import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { generateCustomId } from '../utils/idGenerator';

// Helper to map DB Donor to Frontend Donor (with nested locationDetails)
const mapDonorToFrontend = (donor: any) => {
    return {
        ...donor,
        locationDetails: {
            region: donor.region,
            city: donor.city,
            subCity: donor.subCity,
            woreda: donor.woreda,
            kebele: donor.kebele,
            street: donor.street,
            homeNumber: donor.homeNumber,
            latitude: donor.latitude,
            longitude: donor.longitude
        }
    };
};

const generateLotteryId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `LOT-${randomNum}`;
};

export const registerDonor = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        console.log('Received Register Donor Request:', { ...data, profilePicture: data.profilePicture ? 'Base64 String' : 'undefined' });

        // Helper to sanitize input
        const sanitize = (val: any) => {
            if (val === '') return undefined;
            if (val === 'null') return undefined;
            if (val === 'undefined') return undefined;
            return val;
        };

        // Helper to check for valid date
        const validDate = (d: any) => {
            if (!d) return undefined;
            const date = new Date(d);
            return isNaN(date.getTime()) ? undefined : date;
        };

        const validFloat = (d: any) => {
            if (d !== undefined && d !== null && d !== '') {
                const f = parseFloat(d);
                return isNaN(f) ? undefined : f;
            }
            return undefined;
        }

        const locationDetails = data.locationDetails || {};

        // Explicitly WHITELIST fields to prevent "Unknown argument" errors
        const donorData = {
            fullName: data.fullName,
            email: data.email,

            phone: data.phone,
            bloodType: data.bloodType,

            // Dates & Numbers
            birthDate: validDate(data.birthDate),
            donationAppointmentDate: validDate(data.donationAppointmentDate),
            age: (typeof data.age === 'string' ? parseInt(data.age, 10) : data.age) || undefined,
            weight: (typeof data.weight === 'string' ? parseInt(data.weight, 10) : data.weight) || undefined,

            // Location (Flattened)
            region: sanitize(locationDetails.region || data.region),
            city: sanitize(locationDetails.city || data.city),
            subCity: sanitize(locationDetails.subCity || data.subCity),
            woreda: sanitize(locationDetails.woreda || data.woreda),
            kebele: sanitize(locationDetails.kebele || data.kebele),
            street: sanitize(locationDetails.street || data.street),
            homeNumber: sanitize(locationDetails.homeNumber || data.homeNumber),
            location: locationDetails.city || data.location ? `${locationDetails.city || ''}, ${locationDetails.region || ''}` : sanitize(data.location),

            // GPS
            latitude: validFloat(locationDetails.latitude ?? data.latitude),
            longitude: validFloat(locationDetails.longitude ?? data.longitude),

            // Optional Fields
            gender: sanitize(data.gender),
            medicalCondition: sanitize(data.medicalCondition),
            hasDisability: sanitize(data.hasDisability),
            disabilityType: sanitize(data.disabilityType),

            fanNumber: sanitize(data.fanNumber),
            username: sanitize(data.username),
            password: sanitize(data.password),

            appointmentRegion: sanitize(data.appointmentRegion),
            appointmentPlace: sanitize(data.appointmentPlace),
            appointmentTime: sanitize(data.appointmentTime),

            profilePicture: sanitize(data.profilePicture),

            lotteryId: data.lotteryId || generateLotteryId(),
            status: 'Pending',
            totalDonations: 0,
            impactScore: 0,
        };



        // Hash Password
        if (donorData.password) {
            const salt = await bcrypt.genSalt(10);
            donorData.password = await bcrypt.hash(donorData.password, salt);
        }

        // Generate Custom ID
        const customId = await generateCustomId('donor', 'D');

        // Log the exact data being passed to Prisma
        console.log('Donor Data to Create (Whitelisted):', JSON.stringify(donorData, null, 2));

        const donor = await prisma.donor.create({
            data: {
                ...donorData,
                id: customId
            },
        });

        res.status(201).json(mapDonorToFrontend(donor));
    } catch (error: any) {
        console.error('Register Donor Error:', error);
        if (error.code === 'P2002') {
            // Unique constraint failed
            const target = error.meta?.target;
            res.status(409).json({ message: `A user with this ${target ? target : 'information'} already exists.` });
            return;
        }
        // Improve default error message
        const message = error.message || 'Internal server error';
        res.status(500).json({ message: message });
    }
};

export const getDonors = async (req: Request, res: Response): Promise<void> => {
    try {
        const donors = await prisma.donor.findMany({
            orderBy: {
                fullName: 'asc'
            }
        });

        const mappedDonors = donors.map(mapDonorToFrontend);
        res.json(mappedDonors);
    } catch (error) {
        console.error("Get Donors Error", error);
        res.status(500).json({ message: 'Failed to fetch donors' });
    }
};

export const getDonorById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const donor = await prisma.donor.findUnique({
            where: { id }
        });
        if (!donor) {
            res.status(404).json({ message: 'Donor not found' });
            return;
        }
        res.json(mapDonorToFrontend(donor));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching donor' });
    }
};

export const updateDonor = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const data = req.body;

    // Sanitize helper
    const sanitize = (val: any) => (val === '' || val === 'null' || val === 'undefined') ? undefined : val;

    const locationDetails = data.locationDetails || {};

    // Explicitly whitelist updateable fields
    const updates: any = {
        fullName: data.fullName,
        email: data.email,

        phone: data.phone,
        bloodType: data.bloodType,

        age: data.age ? parseInt(data.age) : undefined,
        weight: data.weight ? parseInt(data.weight) : undefined,
        gender: sanitize(data.gender),
        maritalStatus: sanitize(data.maritalStatus),
        fanNumber: sanitize(data.fanNumber),

        idCardFront: sanitize(data.idCardFront),
        idCardBack: sanitize(data.idCardBack),

        medicalCondition: sanitize(data.medicalCondition),
        hasDisability: sanitize(data.hasDisability),
        disabilityType: sanitize(data.disabilityType),

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


        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        donationAppointmentDate: data.donationAppointmentDate ? new Date(data.donationAppointmentDate) : undefined,
        lastDonation: data.lastDonation ? new Date(data.lastDonation) : undefined,
        totalDonations: data.totalDonations ? parseInt(data.totalDonations) : undefined,
        impactScore: data.impactScore ? parseInt(data.impactScore) : undefined,

        appointmentRegion: sanitize(data.appointmentRegion),
        appointmentPlace: sanitize(data.appointmentPlace),
        appointmentTime: sanitize(data.appointmentTime),

        username: sanitize(data.username),
        profilePicture: sanitize(data.profilePicture),
        status: sanitize(data.status),
        rejectionReason: sanitize(data.rejectionReason),
    };

    // Remove undefined keys to avoid overriding with null
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    try {
        const updatedDonor = await prisma.donor.update({
            where: { id },
            data: updates
        });

        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.password, salt);
            await prisma.donor.update({
                where: { id },
                data: { password: hashedPassword }
            });
        }

        // Admin Activity Logging for Approval/Rejection
        if (req.headers.authorization) { // Only log if triggered by authenticated user (admin/staff)
            const token = req.headers.authorization.split(' ')[1];
            // Simple check to identify admin - real implementation has robust auth middleware
            // Assuming admin token format for simplicity: mock-jwt-token-{id}
            if (token && (data.status === 'Active' || data.status === 'Rejected')) {
                try {
                    const adminId = token.replace('mock-jwt-token-', '');
                    let admin = null;

                    // Resolve Admin
                    if (adminId === 'temp-admin' || adminId === 'admin') {
                        admin = await prisma.admin.findUnique({ where: { id: 'SA0000001' } });
                    } else {
                        // Could be Admin or Staff approving
                        // Specifically check for Admin first as per requirement
                        admin = await prisma.admin.findUnique({ where: { id: adminId } });
                    }

                    if (admin) {
                        const actionType = data.status === 'Active' ? 'APPROVE_DONOR' : 'REJECT_DONOR';
                        const details = data.status === 'Rejected'
                            ? `Case: ${data.rejectionReason || 'No reason provided'}`
                            : 'Approved Successfully';

                        await prisma.adminActivityLog.create({
                            data: {
                                adminId: admin.id,
                                actionType: actionType,
                                targetId: id,
                                targetName: updates.fullName || 'Unknown Donor',
                                details: details
                            }
                        });
                        console.log(`[ACTIVITY LOG] Logged ${actionType} for donor ${id} by admin ${admin.id}`);
                    }
                } catch (logError) {
                    console.error('Failed to log admin approval activity:', logError);
                    // Non-blocking
                }
            }
        }

        const finalDonor = await prisma.donor.findUnique({ where: { id } });
        res.json(mapDonorToFrontend(finalDonor));
    } catch (error: any) {
        console.error("Update Donor Error", error);
        if (error.code === 'P2002') {
            res.status(409).json({ message: 'Email, Phone, or Username already exists' });
            return;
        }
        res.status(500).json({ message: 'Failed to update donor: ' + error.message });
    }
};

export const deleteDonor = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.donor.delete({ where: { id } });
        res.json({ message: 'Donor deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
};
