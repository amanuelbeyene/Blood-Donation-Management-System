import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { generateCustomId } from '../utils/idGenerator';

export const getAdmins = async (req: Request, res: Response): Promise<void> => {
    try {
        const admins = await prisma.admin.findMany();
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch admins' });
    }
};

export const getAdminById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const admin = await prisma.admin.findUnique({ where: { id } });
        if (!admin) {
            res.status(404).json({ message: 'Admin not found' });
            return;
        }
        res.json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin' });
    }
};

export const getAdminActivityLogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const logs = await prisma.adminActivityLog.findMany({
            include: {
                admin: {
                    select: { id: true, fullName: true, profilePicture: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // 1. Collect IDs by Type
        const staffIds = new Set<string>();
        const donorIds = new Set<string>();
        const hospitalIds = new Set<string>();

        logs.forEach(log => {
            if (log.actionType.includes('STAFF')) {
                staffIds.add(log.targetId);
            } else if (log.actionType.includes('DONOR')) {
                donorIds.add(log.targetId);
            } else if (log.actionType.includes('HOSPITAL')) {
                hospitalIds.add(log.targetId);
            }
        });

        // 2. Fetch Entities
        const [staffMembers, donors, hospitals] = await Promise.all([
            prisma.staff.findMany({
                where: { id: { in: Array.from(staffIds) } },
                select: { id: true, fullName: true, profilePicture: true, createdAt: true }
            }),
            prisma.donor.findMany({
                where: { id: { in: Array.from(donorIds) } },
                select: { id: true, fullName: true, profilePicture: true, createdAt: true } // Assuming createdAt exists on Donor
            }),
            prisma.hospital.findMany({
                where: { id: { in: Array.from(hospitalIds) } },
                select: { id: true, name: true, profilePicture: true, createdAt: true }
            })
        ]);

        // 3. Create Maps for fast lookup
        const staffMap = new Map(staffMembers.map(s => [s.id, s]));
        const donorMap = new Map(donors.map(d => [d.id, d]));
        const hospitalMap = new Map(hospitals.map(h => [h.id, h]));

        // 4. Map Logs with enriched data
        const logsWithTargets = logs.map(log => {
            let enrichedData: any = {};

            if (log.actionType.includes('STAFF')) {
                const staff = staffMap.get(log.targetId);
                if (staff) {
                    enrichedData = {
                        targetName: staff.fullName,
                        targetProfilePicture: staff.profilePicture,
                        targetJoinDate: staff.createdAt
                    };
                }
            } else if (log.actionType.includes('DONOR')) {
                const donor = donorMap.get(log.targetId);
                if (donor) {
                    enrichedData = {
                        targetName: donor.fullName,
                        targetProfilePicture: donor.profilePicture,
                        targetJoinDate: donor.createdAt
                    };
                }
            } else if (log.actionType.includes('HOSPITAL')) {
                const hospital = hospitalMap.get(log.targetId);
                if (hospital) {
                    enrichedData = {
                        targetName: hospital.name,
                        targetProfilePicture: hospital.profilePicture,
                        targetJoinDate: hospital.createdAt
                    };
                }
            }

            return {
                ...log,
                ...enrichedData, // Override DB value if found, otherwise keep DB value
            };
        });

        res.json(logsWithTargets);
    } catch (error) {
        console.error("Get Logs Error", error);
        res.status(500).json({ message: 'Failed to fetch activity logs' });
    }
};

export const createAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;

        // Hash Password
        let hashedPassword = data.password;
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(data.password, salt);
        }

        // Generate Custom ID
        const prefix = (data.role === 'super_admin') ? 'SA' : 'AD';
        const customId = await generateCustomId('admin', prefix);

        const newAdmin = await prisma.admin.create({
            data: {
                id: customId,
                username: data.username,
                password: hashedPassword,
                fullName: data.fullName,
                email: data.email,
                landline: data.landline,
                phone: data.phone,
                role: data.role || 'admin',
                profilePicture: data.profilePicture,
                status: data.status || 'active',

                // Personal Info
                bloodType: data.bloodType,
                birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
                age: data.age ? parseInt(data.age) : undefined,
                maritalStatus: data.maritalStatus,
                gender: data.gender,
                fanNumber: data.fanNumber,
                idCardFront: data.idCardFront,
                idCardBack: data.idCardBack,

                region: data.region,
                city: data.city,
                subCity: data.subCity,
                woreda: data.woreda,
                kebele: data.kebele,
                street: data.street,
                homeNumber: data.homeNumber,
                location: data.location,
                latitude: data.latitude ? parseFloat(data.latitude) : undefined,
                longitude: data.longitude ? parseFloat(data.longitude) : undefined,
            }
        });

        res.status(201).json(newAdmin);
    } catch (error: any) {
        console.error("Create Admin Error", error);
        if (error.code === 'P2002') {
            res.status(409).json({ message: 'Username or Email already exists' });
            return;
        }
        res.status(500).json({ message: 'Failed to create admin' });
    }
};

export const updateAdmin = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    // Use req.body to extract data
    const data = req.body;

    // Helper to sanitize input
    const sanitize = (val: any) => (val === '' || val === 'null' || val === 'undefined') ? undefined : val;

    // Explicitly whitelist updateable fields
    const updates: any = {
        fullName: data.fullName,
        email: data.email,
        landline: data.landline,
        phone: data.phone,
        status: data.status,
        role: data.role,

        bloodType: sanitize(data.bloodType),
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        age: data.age ? parseInt(data.age) : undefined,
        maritalStatus: sanitize(data.maritalStatus),
        gender: sanitize(data.gender),
        fanNumber: sanitize(data.fanNumber),
        idCardFront: sanitize(data.idCardFront),
        idCardBack: sanitize(data.idCardBack),

        region: sanitize(data.region),
        city: sanitize(data.city),
        subCity: sanitize(data.subCity),
        woreda: sanitize(data.woreda),
        kebele: sanitize(data.kebele),
        street: sanitize(data.street),
        homeNumber: sanitize(data.homeNumber),
        location: sanitize(data.location),

        latitude: data.latitude ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude) : undefined,

        profilePicture: sanitize(data.profilePicture),
        username: sanitize(data.username)
    };

    // Remove undefined keys
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    try {
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(data.password, salt);
        }

        const updatedAdmin = await prisma.admin.update({
            where: { id },
            data: updates
        });
        res.json(updatedAdmin);
    } catch (error) {
        console.error("Update Admin Error", error);
        res.status(500).json({ message: 'Failed to update admin' });
    }
};

export const deleteAdmin = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.admin.delete({ where: { id } });
        res.json({ message: 'Admin deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
};
