import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { generateCustomId } from '../utils/idGenerator';
import crypto from 'crypto';
import { sendEmail } from '../utils/emailService';
import { sendSMS } from '../utils/smsService';


export const login = async (req: Request, res: Response): Promise<void> => {
    const { identifier, password, role } = req.body;
    console.log(`[LOGIN ATTEMPT] Role: ${role}, Identifier: ${identifier}`);

    try {
        let user;
        if (role === 'donor') {
            console.log('[LOGIN] Searching Donor table');
            user = await prisma.donor.findFirst({
                where: { OR: [{ email: identifier }, { username: identifier }, { phone: identifier }] },
            });
        } else if (role === 'hospital') {
            console.log(`[LOGIN] Searching Hospital table for identifier: "${identifier}"`);
            user = await prisma.hospital.findFirst({
                where: { OR: [{ email: identifier }, { username: identifier }, { phone: identifier }] },
            });
            console.log('[LOGIN] Hospital search result:', user ? `Found (ID: ${user.id}, Email: ${user.email})` : 'Not Found');
            if (user) {
                console.log(`[LOGIN] Hospital User found. Stored Password Hash length: ${user.password ? user.password.length : 'N/A'}`);
            }
        } else if (role === 'staff' || role === 'medical_staff') {
            console.log('[LOGIN] Searching Staff table');
            try {
                user = await prisma.staff.findFirst({
                    where: { OR: [{ email: identifier }, { username: identifier }, { phone: identifier }] },
                });
                console.log('[LOGIN] Staff search result:', user ? `Found (ID: ${user.id})` : 'Not Found');
            } catch (err) {
                console.error('[LOGIN] Error querying Staff table (Prisma client issue?):', err);
                throw err;
            }
        } else {
            console.log('[LOGIN] Searching Admin table');
            // Check Admin table
            user = await prisma.admin.findFirst({
                where: { OR: [{ email: identifier }, { username: identifier }] }
            });

            // Bootstrap initial admin if no user found & using default creds
            if (!user && identifier === 'admin' && password === 'admin') {
                console.log('[LOGIN] Using bootstrap admin credentials');
                res.json({
                    id: 'temp-admin',
                    name: 'System Admin',
                    role: 'super_admin',
                    token: 'mock-jwt-token-admin',
                });
                return;
            }
        }

        if (!user || !user.password) {
            console.log('[LOGIN] User not found or no password set.');
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`[LOGIN] Password match result: ${isMatch}`);

        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Return user info (excluding password)
        const { password: _, ...userWithoutPassword } = user;

        // Normalize role to lowercase for consistent frontend navigation
        const userRole = ((user as any).role || role).toLowerCase();

        res.json({
            ...userWithoutPassword,
            role: userRole,
            token: `mock-jwt-token-${user.id}`,
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const registerDonor = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        console.log('Registering Donor (Auth):', { ...data, profilePicture: data.profilePicture ? 'Base64...' : undefined });

        // sanitize helper
        const sanitize = (val: any) => (val === '' || val === 'null' || val === 'undefined') ? undefined : val;

        // Handle locationDetails if present, or flat fields
        const locationDetails = data.locationDetails || {};

        // Explicitly construct valid Prisma data object
        const donorData = {
            fullName: data.fullName,
            email: data.email,
            landline: data.landline,
            phone: data.phone,
            bloodType: data.bloodType,

            birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
            donationAppointmentDate: data.donationAppointmentDate ? new Date(data.donationAppointmentDate) : undefined,
            age: data.age ? parseInt(data.age) : undefined,
            weight: (data.weight !== undefined && data.weight !== null && data.weight !== '') ? String(data.weight) : undefined,
            gender: sanitize(data.gender),
            maritalStatus: (data.maritalStatus !== undefined && data.maritalStatus !== null && data.maritalStatus !== '') ? String(data.maritalStatus) : undefined,
            medicalCondition: sanitize(data.medicalCondition),
            profilePicture: sanitize(data.profilePicture),

            // Location
            region: sanitize(locationDetails.region || data.region),
            city: sanitize(locationDetails.city || data.city),
            subCity: sanitize(locationDetails.subCity || data.subCity),
            woreda: sanitize(locationDetails.woreda || data.woreda),
            kebele: sanitize(locationDetails.kebele || data.kebele),
            street: sanitize(locationDetails.street || data.street),
            homeNumber: sanitize(locationDetails.homeNumber || data.homeNumber),
            location: sanitize(data.location), // GPS string or formatted

            latitude: (locationDetails.latitude ?? data.latitude) ? parseFloat(locationDetails.latitude ?? data.latitude) : undefined,
            longitude: (locationDetails.longitude ?? data.longitude) ? parseFloat(locationDetails.longitude ?? data.longitude) : undefined,

            fanNumber: sanitize(data.fanNumber),
            hasDisability: sanitize(data.hasDisability),
            disabilityType: sanitize(data.disabilityType),

            idCardFront: sanitize(data.idCardFront),
            idCardBack: sanitize(data.idCardBack),

            username: sanitize(data.username),

            appointmentRegion: sanitize(data.appointmentRegion),
            appointmentPlace: sanitize(data.appointmentPlace),
            appointmentTime: sanitize(data.appointmentTime),

            lotteryId: data.lotteryId, // If frontend generates it
        };

        // Hash Password
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            // @ts-ignore
            donorData.password = await bcrypt.hash(data.password, salt);
        }

        const customId = await generateCustomId('donor', 'D');

        const newDonor = await prisma.donor.create({
            data: {
                ...donorData,
                id: customId,
                status: 'Pending',
            }
        });

        // NOTIFICATION LOGIC (Ported from donorController)
        try {
            await prisma.notification.create({
                data: {
                    type: 'DONOR_REGISTER',
                    message: `Approve Waiting Donor: ${newDonor.fullName}`,
                    isRead: false,
                    forRole: 'admin',
                    relatedId: newDonor.id
                }
            });

            // Check if Staff registered this AND send SECOND notification
            if (req.headers.authorization) {
                const token = req.headers.authorization.split(' ')[1];

                const id = token.replace('mock-jwt-token-', '');
                const staff = await prisma.staff.findUnique({ where: { id: id } });

                if (staff) {
                    await prisma.notification.create({
                        data: {
                            type: 'STAFF_ADD_DONOR',
                            message: `Staff ${staff.fullName} Added Donor: ${newDonor.fullName}`,
                            isRead: false,
                            forRole: 'admin',
                            relatedId: id
                        }
                    });
                }
            }
        } catch (notifError) {
            console.error('Failed to create notification for new donor (Auth):', notifError);
        }

        res.status(201).json(newDonor);
    } catch (error: any) {
        console.error('Register Donor Error (Auth):', error);
        if (error.code === 'P2002') {
            const target = error.meta?.target;
            res.status(409).json({ message: `A user with this ${target ? target : 'information'} already exists.` });
            return;
        }
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

export const registerHospital = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        console.log('Registering Hospital (Auth):', { ...data, profilePicture: data.profilePicture ? 'Base64...' : undefined });

        const sanitize = (val: any) => (val === '' || val === 'null' || val === 'undefined') ? undefined : val;

        const hospitalData = {
            name: data.name,
            email: data.email,
            landline: data.landline,
            phone: data.phone,

            contactDoctorName: sanitize(data.contactDoctorName),
            contactDoctorPhone: sanitize(data.contactDoctorPhone),

            region: sanitize(data.region),
            city: sanitize(data.city),
            subCity: sanitize(data.subCity),
            woreda: sanitize(data.woreda),
            kebele: sanitize(data.kebele),
            street: sanitize(data.street),
            location: sanitize(data.location), // GPS string or formatted

            latitude: data.latitude ? parseFloat(data.latitude) : undefined,
            longitude: data.longitude ? parseFloat(data.longitude) : undefined,

            licenseName: sanitize(data.businessLicenseName || data.licenseName),
            licenseNumber: sanitize(data.businessLicenseNumber || data.licenseNumber),
            businessLicenseImage: data.businessLicenseImage,
            hospitalType: sanitize(data.hospitalType),

            idCardFront: sanitize(data.idCardFront),
            idCardBack: sanitize(data.idCardBack),

            username: sanitize(data.username),
            profilePicture: sanitize(data.profilePicture),
            status: 'Pending', // Default
        };

        // Hash Password
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            // @ts-ignore
            hospitalData.password = await bcrypt.hash(data.password, salt);
        }

        const customId = await generateCustomId('hospital', 'H');

        const newHospital = await prisma.hospital.create({
            data: {
                ...hospitalData,
                id: customId,
            }
        });

        // NOTIFICATION LOGIC (Hospital)
        try {
            await prisma.notification.create({
                data: {
                    type: 'HOSPITAL_REGISTER',
                    message: `Approve Waiting Hospital: ${newHospital.name}`,
                    isRead: false,
                    forRole: 'admin',
                    relatedId: newHospital.id
                }
            });

            if (req.headers.authorization) {
                const token = req.headers.authorization.split(' ')[1];
                const id = token.replace('mock-jwt-token-', '');
                const staff = await prisma.staff.findUnique({ where: { id: id } });

                if (staff) {
                    await prisma.notification.create({
                        data: {
                            type: 'STAFF_ADD_HOSPITAL',
                            message: `Staff ${staff.fullName} Added Hospital: ${newHospital.name}`,
                            isRead: false,
                            forRole: 'admin',
                            relatedId: id
                        }
                    });
                }
            }
        } catch (e) { console.error('Notif Error', e); }

        res.status(201).json(newHospital);
    } catch (error: any) {
        console.error('Register Hospital Error (Auth):', error);
        if (error.code === 'P2002') {
            const target = error.meta?.target;
            res.status(409).json({ message: `A hospital with this ${target ? target : 'information'} already exists.` });
            return;
        }
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
    const { identifier, role, currentPassword, newPassword } = req.body;

    try {
        let user;
        if (role === 'donor') {
            user = await prisma.donor.findFirst({
                where: { OR: [{ email: identifier }, { username: identifier }, { phone: identifier }] },
            });
        } else if (role === 'hospital') {
            user = await prisma.hospital.findFirst({
                where: { OR: [{ email: identifier }, { username: identifier }, { phone: identifier }] },
            });
        } else if (role === 'staff' || role === 'medical_staff') {
            user = await prisma.staff.findFirst({
                where: { OR: [{ email: identifier }, { username: identifier }, { phone: identifier }] },
            });
        } else {
            user = await prisma.admin.findFirst({
                where: { OR: [{ email: identifier }, { username: identifier }] }
            });
        }

        if (!user || !user.password) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Current password is incorrect' });
            return;
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update in database
        const updateData = { password: hashedPassword };

        if (role === 'donor') {
            await prisma.donor.update({ where: { id: user.id }, data: updateData });
        } else if (role === 'hospital') {
            await prisma.hospital.update({ where: { id: user.id }, data: updateData });
        } else if (role === 'staff' || role === 'medical_staff') {
            await prisma.staff.update({ where: { id: user.id }, data: updateData });
        } else {
            await prisma.admin.update({ where: { id: user.id }, data: updateData });
        }

        res.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Helper function to find user by email or phone across different roles
const findUserByIdentifier = async (identifier: string) => {
    let user;
    let role;

    // Check if identifier is an email
    const isEmail = identifier.includes('@');

    if (isEmail) {
        user = await prisma.donor.findFirst({ where: { email: identifier } });
        if (user) return { user, role: 'donor' };

        user = await prisma.hospital.findFirst({ where: { email: identifier } });
        if (user) return { user, role: 'hospital' };

        user = await prisma.staff.findFirst({ where: { email: identifier } });
        if (user) return { user, role: 'staff' };

        user = await prisma.admin.findFirst({ where: { email: identifier } });
        if (user) return { user, role: 'admin' };
    } else {
        // Assume it's a phone number
        user = await prisma.donor.findFirst({ where: { phone: identifier } });
        if (user) return { user, role: 'donor' };

        user = await prisma.hospital.findFirst({ where: { phone: identifier } });
        if (user) return { user, role: 'hospital' };

        user = await prisma.staff.findFirst({ where: { phone: identifier } });
        if (user) return { user, role: 'staff' };
        // Admin typically doesn't have a phone field for login, but if it did, it would go here.
        // For now, only email for admin.
    }

    return null;
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { identifier } = req.body;

    try {
        const result = await findUserByIdentifier(identifier);

        if (!result) {
            res.status(404).json({ message: 'User not found with this email or phone' });
            return;
        }

        const { user, role } = result;

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

        // Save OTP to DB
        // @ts-ignore
        const updateData = { resetPasswordToken: otp, resetPasswordExpires };

        if (role === 'donor') {
            await prisma.donor.update({ where: { id: user.id }, data: updateData });
        } else if (role === 'hospital') {
            await prisma.hospital.update({ where: { id: user.id }, data: updateData });
        } else if (role === 'staff') {
            await prisma.staff.update({ where: { id: user.id }, data: updateData });
        } else {
            await prisma.admin.update({ where: { id: user.id }, data: updateData });
        }

        // Determine if Identifier is Email or Phone
        const isEmail = identifier.includes('@');

        if (isEmail) {
            const message = `
                <h1>Password Reset Request</h1>
                <p>Your OTP is: <strong>${otp}</strong></p>
                <p>Use this code to reset your password.</p>
            `;
            await sendEmail({
                to: identifier,
                subject: 'Password Reset OTP',
                html: message,
            });
            res.json({ message: 'OTP sent to email successfully', method: 'email' });
        } else {
            const message = `Your Blood Donation App Password Reset OTP is: ${otp}`;
            await sendSMS(identifier, message);
            // In development, send OTP in response for testing
            const isDev = process.env.NODE_ENV !== 'production';
            res.json({
                message: 'OTP sent to phone successfully',
                method: 'phone',
                debugOtp: isDev ? otp : undefined
            });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { identifier, otp, password } = req.body;

    try {
        const result = await findUserByIdentifier(identifier);

        if (!result) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const { user, role } = result;

        // Check OTP and Expiry
        // @ts-ignore
        if (user.resetPasswordToken !== otp || !user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
            res.status(400).json({ message: 'Invalid or expired OTP' });
            return;
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password and clear token
        // @ts-ignore
        const updateData = {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        };

        if (role === 'donor') {
            await prisma.donor.update({ where: { id: user.id }, data: updateData });
        } else if (role === 'hospital') {
            await prisma.hospital.update({ where: { id: user.id }, data: updateData });
        } else if (role === 'staff') {
            await prisma.staff.update({ where: { id: user.id }, data: updateData });
        } else {
            await prisma.admin.update({ where: { id: user.id }, data: updateData });
        }

        res.json({ message: 'Password reset successfully' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
