import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { generateCustomId } from '../utils/idGenerator';

import { createNotification } from './notificationController';

// Helper to map DB Hospital to Frontend (handling locationDetails)
const mapHospitalToFrontend = (hospital: any) => {
    return {
        ...hospital,
        businessLicenseName: hospital.licenseName,
        businessLicenseNumber: hospital.licenseNumber,
        businessLicenseImage: hospital.businessLicenseImage,
        locationDetails: {
            region: hospital.region,
            city: hospital.city,
            subCity: hospital.subCity,
            woreda: hospital.woreda,
            kebele: hospital.kebele,
            street: hospital.street,
            homeNumber: hospital.homeNumber // Note: Schema calls it homeNumber, model might not have it or it's implicitly there.
        }
    };
};

export const getHospitals = async (req: Request, res: Response): Promise<void> => {
    try {
        const hospitals = await prisma.hospital.findMany();
        res.json(hospitals.map(mapHospitalToFrontend));
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch hospitals' });
    }
};

export const getHospitalById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const hospital = await prisma.hospital.findUnique({ where: { id } });
        if (!hospital) {
            res.status(404).json({ message: 'Hospital not found' });
            return;
        }
        res.json(mapHospitalToFrontend(hospital));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hospital details' });
    }
};

// registerHospital
export const registerHospital = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        // Validation/Mapping
        const hospitalData = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            fanNumber: data.fanNumber, // Fix: Include FAN Number
            username: data.username,
            password: data.password,
            contactDoctorName: data.contactDoctorName,
            contactDoctorPhone: data.contactDoctorPhone,

            // Location Flattening
            region: data.locationDetails?.region || data.region,
            city: data.locationDetails?.city || data.city,
            subCity: data.locationDetails?.subCity || data.subCity,
            woreda: data.locationDetails?.woreda || data.woreda,
            kebele: data.locationDetails?.kebele || data.kebele,
            street: data.locationDetails?.street || data.street,
            location: data.location,

            latitude: data.latitude ? parseFloat(data.latitude) : null,
            longitude: data.longitude ? parseFloat(data.longitude) : null,

            licenseName: data.businessLicenseName,
            licenseNumber: data.businessLicenseNumber,
            businessLicenseImage: data.businessLicenseImage,
            hospitalType: data.hospitalType,
            profilePicture: data.profilePicture,
            status: 'Pending', // Default to Pending for approval workflow
            source: req.headers.authorization ? 'Staff' : 'Self', // 'Staff' if auth token present, else 'Self'
        };

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        hospitalData.password = await bcrypt.hash(data.password, salt);

        // Generate Custom ID
        const customId = await generateCustomId('hospital', 'H');

        const newHospital = await prisma.hospital.create({
            data: {
                ...hospitalData,
                id: customId
            }
        });

        // NOTIFICATION LOGIC
        try {
            // 1. Approve Waiting Hospital (For Admin)
            await createNotification(
                `Approve Waiting Hospital: ${newHospital.name}`,
                'HOSPITAL_REGISTER',
                newHospital.id,
                'admin' // Explicitly for admin
            );

            // 2. Staff Add Hospital (Activity Log)
            if (req.headers.authorization) {
                const token = req.headers.authorization.split(' ')[1];
                const staffId = token.replace('mock-jwt-token-', '');

                // Ensure we only log if it's actually a staff member (not just any auth)
                const staff = await prisma.staff.findUnique({ where: { id: staffId } });
                if (staff) {
                    await createNotification(
                        `Staff ${staff.fullName} Add Hospital: ${newHospital.name}`, // "Add" as requested
                        'STAFF_ADD_HOSPITAL',
                        staffId, // Related to Staff for activity view redirection
                        'admin'
                    );
                }
            }
        } catch (notifError) {
            console.error('Failed to create notification for new hospital:', notifError);
        }

        res.status(201).json(mapHospitalToFrontend(newHospital));
    } catch (error: any) {
        console.error("Register Hospital Error", error);
        if (error.code === 'P2002') {
            res.status(409).json({ message: `A hospital with this ${error.meta?.target} already exists` });
            return;
        }
        res.status(500).json({ message: error.message || 'Registration failed' });
    }
};

export const updateHospital = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const data = req.body;

    // Remove immutable
    delete data.id;

    // Handle nested locationDetails updates if provided
    let flatLocation: any = {};
    if (data.locationDetails) {
        flatLocation = {
            region: data.locationDetails.region,
            city: data.locationDetails.city,
            subCity: data.locationDetails.subCity,
            woreda: data.locationDetails.woreda,
            kebele: data.locationDetails.kebele,
            street: data.locationDetails.street,
        };
        // We delete the nested object so Prisma doesn't complain about unknown arg
        delete data.locationDetails;
    }

    if (data.password) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);
    }

    try {
        const updateData: any = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            fanNumber: data.fanNumber, // Fix: Include FAN Number
            idCardFront: data.idCardFront,
            idCardBack: data.idCardBack,
            contactDoctorName: data.contactDoctorName,
            contactDoctorPhone: data.contactDoctorPhone,

            // Address
            region: flatLocation.region || data.region,
            city: flatLocation.city || data.city,
            subCity: flatLocation.subCity || data.subCity,
            woreda: flatLocation.woreda || data.woreda,
            kebele: flatLocation.kebele || data.kebele,
            street: flatLocation.street || data.street,
            location: data.location,

            latitude: data.latitude ? parseFloat(data.latitude) : undefined,
            longitude: data.longitude ? parseFloat(data.longitude) : undefined,

            // License
            licenseName: data.businessLicenseName || data.licenseName,
            licenseNumber: data.businessLicenseNumber || data.licenseNumber,
            businessLicenseImage: data.businessLicenseImage,
            hospitalType: data.hospitalType,

            // Auth & Status
            username: data.username,
            profilePicture: data.profilePicture,
            status: data.status,
            rejectionReason: data.rejectionReason,
        };

        if (data.newPassword && data.currentPassword) {
            // Self-Service Change: Verify current password
            const currentHospital = await prisma.hospital.findUnique({ where: { id } });
            if (!currentHospital || !currentHospital.password) {
                res.status(400).json({ message: 'Hospital not found or password not set' });
                return;
            }

            const isMatch = await bcrypt.compare(data.currentPassword, currentHospital.password);
            if (!isMatch) {
                res.status(400).json({ message: 'Incorrect current password' });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(data.newPassword, salt);
        } else if (data.password) {
            // Admin Override
            updateData.password = data.password;
        }

        const updatedHospital = await prisma.hospital.update({
            where: { id },
            data: updateData
        });

        // Admin Activity Logging for Approval/Rejection
        if (req.headers.authorization) { // Only log if triggered by authenticated user
            const token = req.headers.authorization.split(' ')[1];
            // Only log on status change
            if (token && (data.status === 'Active' || data.status === 'Rejected')) {
                try {
                    const adminId = token.replace('mock-jwt-token-', '');
                    let admin = null;

                    // Resolve Admin
                    if (adminId === 'temp-admin' || adminId === 'admin') {
                        admin = await prisma.admin.findUnique({ where: { id: 'SA0000001' } });
                    } else {
                        admin = await prisma.admin.findUnique({ where: { id: adminId } });
                    }

                    if (admin) {
                        const actionType = data.status === 'Active' ? 'APPROVE_HOSPITAL' : 'REJECT_HOSPITAL';
                        const details = data.status === 'Rejected'
                            ? `Case: ${data.rejectionReason || 'Invalid License Number provided'}` // Default reason if missing for demo
                            : 'Approved Successfully';

                        await prisma.adminActivityLog.create({
                            data: {
                                adminId: admin.id,
                                actionType: actionType,
                                targetId: id,
                                targetName: updatedHospital.name,
                                details: details
                            }
                        });
                        console.log(`[ACTIVITY LOG] Logged ${actionType} for hospital ${id} by admin ${admin.id}`);



                        // NOTIFY STAFF
                        await createNotification(
                            `Admin ${admin.fullName} ${data.status === 'Active' ? 'approved' : 'rejected'} hospital ${updatedHospital.name}`,
                            actionType,
                            id,
                            'staff'
                        );
                    }
                } catch (logError) {
                    console.error('Failed to log admin approval activity:', logError);
                }
            }
            // Check for Staff Update
            else if (token && !data.status) { // If status didn't change (likely edit details)
                const staffId = token.replace('mock-jwt-token-', '');
                const staff = await prisma.staff.findUnique({ where: { id: staffId } });
                if (staff) {
                    await createNotification(
                        `Staff ${staff.fullName} updated details for Hospital: ${updatedHospital.name}`,
                        'STAFF_EDIT_HOSPITAL',
                        staffId
                    );
                }
            }
        }

        res.json(mapHospitalToFrontend(updatedHospital));
    } catch (error: any) {
        console.error("Update Hospital Error", error);
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Hospital not found' });
            return;
        }
        if (error.code === 'P2002') {
            const target = error.meta?.target;
            res.status(409).json({ message: `A hospital with this ${Array.isArray(target) ? target.join(', ') : target} already exists` });
            return;
        }
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
};

export const deleteHospital = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.hospital.delete({ where: { id } });

        // Notification for Staff Delete
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            const staffId = token.replace('mock-jwt-token-', '');
            const staff = await prisma.staff.findUnique({ where: { id: staffId } });
            if (staff) {
                await createNotification(
                    `Staff ${staff.fullName} deleted Hospital record`,
                    'STAFF_DELETE_HOSPITAL',
                    staffId
                );
            }
        }

        res.json({ message: 'Hospital deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
};
