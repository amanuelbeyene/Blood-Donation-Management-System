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
        console.log(`[getAdminById] Fetching admin ${id}:`, admin); // DEBUG LOG
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
            orderBy: { createdAt: 'desc' }
        });

        // 1. Collect IDs
        const adminIds = new Set<string>();
        const staffIds = new Set<string>();
        const donorIds = new Set<string>();
        const hospitalIds = new Set<string>();

        logs.forEach(log => {
            if (log.adminId) adminIds.add(log.adminId);
            if (!log.targetId) return;

            if (log.actionType.includes('STAFF')) {
                staffIds.add(log.targetId);
            } else if (log.actionType.includes('DONOR')) {
                donorIds.add(log.targetId);
            } else if (log.actionType.includes('HOSPITAL')) {
                hospitalIds.add(log.targetId);
            }
        });

        // 2. Fetch Entities
        const [admins, staffMembers, donors, hospitals] = await Promise.all([
            prisma.admin.findMany({
                where: { id: { in: Array.from(adminIds) } },
                select: { id: true, fullName: true, profilePicture: true }
            }),
            prisma.staff.findMany({
                where: { id: { in: Array.from(staffIds) } },
                select: { id: true, fullName: true, profilePicture: true, createdAt: true }
            }),
            prisma.donor.findMany({
                where: { id: { in: Array.from(donorIds) } },
                select: { id: true, fullName: true, profilePicture: true, createdAt: true }
            }),
            prisma.hospital.findMany({
                where: { id: { in: Array.from(hospitalIds) } },
                select: { id: true, name: true, profilePicture: true, createdAt: true }
            })
        ]);

        // 3. Create Maps
        const adminMap = new Map(admins.map(a => [a.id, a]));
        const staffMap = new Map(staffMembers.map(s => [s.id, s]));
        const donorMap = new Map(donors.map(d => [d.id, d]));
        const hospitalMap = new Map(hospitals.map(h => [h.id, h]));

        // 4. Map Logs
        const logsWithTargets = logs.map(log => {
            let enrichedData: any = {};
            const admin = adminMap.get(log.adminId);

            if (log.targetId) {
                if (log.actionType.includes('STAFF')) {
                    const staff = staffMap.get(log.targetId);
                    if (staff) enrichedData = { targetName: staff.fullName, targetProfilePicture: staff.profilePicture, targetJoinDate: staff.createdAt };
                } else if (log.actionType.includes('DONOR')) {
                    const donor = donorMap.get(log.targetId);
                    if (donor) enrichedData = { targetName: donor.fullName, targetProfilePicture: donor.profilePicture, targetJoinDate: donor.createdAt };
                } else if (log.actionType.includes('HOSPITAL')) {
                    const hospital = hospitalMap.get(log.targetId);
                    if (hospital) enrichedData = { targetName: hospital.name, targetProfilePicture: hospital.profilePicture, targetJoinDate: hospital.createdAt };
                }
            }

            return {
                ...log,
                admin: admin || { fullName: 'Unknown Admin', profilePicture: null },
                ...enrichedData,
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
    console.log(`[updateAdmin] Received update for ${id}:`, data); // DEBUG LOG

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
        birthDate: data.birthDate && !isNaN(Date.parse(data.birthDate)) ? new Date(data.birthDate) : undefined,
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
    // Remove undefined or NaN keys
    Object.keys(updates).forEach(key => {
        if (updates[key] === undefined) delete updates[key];
        if (typeof updates[key] === 'number' && isNaN(updates[key])) delete updates[key];
    });

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

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const [
            totalDonors,
            totalRequests,
            approvedRequests,
            inventory,
            bloodRequests
        ] = await Promise.all([
            prisma.donor.count({ where: { status: 'Active' } }),
            prisma.request.count(),
            prisma.request.count({ where: { status: 'Approved' } }),
            prisma.inventory.findMany(),
            prisma.request.findMany({ where: { status: 'Approved' } }) // For calculating total volume if needed, or we can use inventory
        ]);

        // Calculate total volume available
        let totalVolume = 0;
        const bloodGroupStats: { [key: string]: number } = {};

        inventory.forEach(item => {
            totalVolume += item.unitsAvailable; // Assuming unitsAvailable is in ml or units? Usually units. 
            // If 1 unit = 450ml, we might need conversion. The mock data showed volume in ml.
            // Let's assume unitsAvailable is number of bags. Standard bag is ~450ml.
            // But verify mock data: "18.2% volume: 3380". 
            // If inventory stores 'units', we should multiply. 
            // Let's return raw units for now or convert if we can confirm.
            // The frontend mock says "Total Blood Unit (ml) 11415 ml".
            // Let's stick to units for now and let frontend handle display or conversion, 
            // OR provide both.
            bloodGroupStats[item.bloodType] = (bloodGroupStats[item.bloodType] || 0) + item.unitsAvailable;
        });

        const stats = {
            totalDonors,
            totalRequests,
            approvedRequests,
            totalVolume: totalVolume * 450, // Approximation: 1 unit = 450ml
            bloodGroups: bloodGroupStats,
            availableBloodUnits: totalVolume, // Total units count
            totalStaff: await prisma.staff.count(),
            totalHospitals: await prisma.hospital.count(),
            totalAppointments: await prisma.donor.count({
                where: {
                    donationAppointmentDate: {
                        gte: new Date()
                    }
                }
            })
        };

        res.json(stats);
    } catch (error) {
        console.error("Get Dashboard Stats Error", error);
        res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
};
