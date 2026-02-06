import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { generateCustomId } from '../utils/idGenerator';

// Get all staff
export const getStaff = async (req: Request, res: Response): Promise<void> => {
    try {
        const staff = await prisma.staff.findMany({
            orderBy: { createdAt: 'desc' }
        });
        // Exclude password from response
        const safeStaff = staff.map(s => {
            const { password, ...rest } = s;
            return rest;
        });
        res.json(safeStaff);
    } catch (error) {
        console.error('Get Staff Error:', error);
        res.status(500).json({ message: 'Failed to fetch staff' });
    }
};

// Get single staff
export const getStaffById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const staff = await prisma.staff.findUnique({ where: { id } });
        if (!staff) {
            res.status(404).json({ message: 'Staff not found' });
            return;
        }

        // -- Admin Activity Logging (VIEW_STAFF) --
        try {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer mock-jwt-token-')) {
                let adminId = authHeader.replace('Bearer mock-jwt-token-', '');
                let admin = null;

                // Simple admin fetch (omitting complex create-if-missing logic for lightweight View logs)
                if (adminId === 'temp-admin' || adminId === 'admin') {
                    admin = await prisma.admin.findUnique({ where: { id: 'SA0000001' } });
                } else {
                    admin = await prisma.admin.findUnique({ where: { id: adminId } });
                }

                if (admin) {
                    await prisma.adminActivityLog.create({
                        data: {
                            adminId: admin.id,
                            actionType: 'VIEW_STAFF',
                            targetId: staff.id,
                            targetName: staff.fullName,
                            details: 'Viewed staff details'
                        }
                    });
                }
            }
        } catch (logError) {
            // Sillent fail for view logging
        }
        // -----------------------------

        // Exclude password from response
        const { password, ...safeStaff } = staff;
        res.json(safeStaff);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching staff' });
    }
};

// Create staff
export const createStaff = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        console.log('Creating Staff:', { ...data, profilePicture: data.profilePicture ? 'Base64...' : undefined });

        const sanitize = (val: any) => (val === '' || val === 'null' || val === 'undefined') ? undefined : val;

        const staffData = {
            username: data.username,
            fullName: data.fullName,
            email: data.email,
            landline: data.landline,
            phone: data.phone,
            role: data.role || 'Staff',

            profilePicture: sanitize(data.profilePicture),
            status: data.status || 'active',

            bloodType: sanitize(data.bloodType),
            birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
            age: data.age ? parseInt(data.age) : undefined,
            maritalStatus: sanitize(data.maritalStatus),
            gender: sanitize(data.gender),
            fanNumber: sanitize(data.fanNumber),
            idCardFront: sanitize(data.idCardFront),
            idCardBack: sanitize(data.idCardBack),

            medicalCondition: sanitize(data.medicalCondition),
            hasDisability: sanitize(data.hasDisability),
            disabilityType: sanitize(data.disabilityType),

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
        };

        // Hash Password
        let hashedPassword = '';
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(data.password, salt);
        } else {
            res.status(400).json({ message: 'Password is required' });
            return;
        }

        const customId = await generateCustomId('staff', 'ST');

        const newStaff = await prisma.staff.create({
            data: {
                ...staffData,
                id: customId,
                password: hashedPassword,
            }
        });

        // -- Admin Activity Logging --
        try {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer mock-jwt-token-')) {
                let adminId = authHeader.replace('Bearer mock-jwt-token-', '');
                let admin = null;

                const findOrCreateSystemLogger = async () => {
                    // 3. Try any Super Admin
                    let a = await prisma.admin.findFirst({ where: { role: 'super_admin' } });
                    if (a) return a;

                    // 4. Try any Admin
                    a = await prisma.admin.findFirst();
                    if (a) return a;

                    // 5. Create System Placeholder (Last Resort)
                    console.log('[LOG] No existing admins found. Creating System Logger placeholder.');
                    const sysId = await generateCustomId('admin', 'SA');
                    return await prisma.admin.create({
                        data: {
                            id: sysId,
                            username: 'system_log',
                            password: '$2a$10$PlaceholderHashValuewithSalt...', // Dummy hash
                            fullName: 'System Logger',
                            email: 'system@log.com',
                            landline: '0000000000',
                            role: 'super_admin',
                            status: 'active'
                        }
                    });
                };

                if (adminId === 'temp-admin' || adminId === 'admin') {
                    // 1. Try SA0000001
                    admin = await prisma.admin.findUnique({ where: { id: 'SA0000001' } });
                    if (!admin) {
                        admin = await findOrCreateSystemLogger();
                    }
                } else {
                    // Normal case: find specific admin
                    admin = await prisma.admin.findUnique({ where: { id: adminId } });
                    // Fallback even for normal IDs if they don't exist (e.g. deleted but token remains)
                    if (!admin) {
                        admin = await findOrCreateSystemLogger();
                    }
                }

                if (admin) {
                    await prisma.adminActivityLog.create({
                        data: {
                            adminId: admin.id,
                            actionType: 'ADD_STAFF',
                            targetId: newStaff.id,
                            targetName: newStaff.fullName,
                            details: `Added new staff member: ${newStaff.fullName}${adminId === 'temp-admin' ? ' (via System Access)' : ''}`
                        }
                    });
                    console.log(`[LOG] Admin Activity: ADD_STAFF attributed to ${admin.username} (ID: ${admin.id})`);
                } else {
                    console.warn('[LOG] CRITICAL: Could not attribute ADD_STAFF action to any admin even after fallback.');
                }
            }
        } catch (logError) {
            console.error("Failed to log admin activity:", logError);
        }
        // -----------------------------

        res.status(201).json(newStaff);
    } catch (error: any) {
        console.error('Create Staff Error:', error);
        if (error.code === 'P2002') {
            const target = error.meta?.target;
            res.status(409).json({ message: `A user with this ${target ? target : 'information'} already exists.` });
            return;
        }
        res.status(500).json({ message: 'Failed to create staff' });
    }
};

// Update staff
export const updateStaff = async (req: Request, res: Response): Promise<void> => {
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

        status: data.status, // Admin can update status

        bloodType: sanitize(data.bloodType),
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        age: data.age ? parseInt(data.age) : undefined,
        maritalStatus: sanitize(data.maritalStatus),
        gender: sanitize(data.gender),
        fanNumber: sanitize(data.fanNumber),

        idCardFront: sanitize(data.idCardFront),
        idCardBack: sanitize(data.idCardBack),

        medicalCondition: sanitize(data.medicalCondition),
        hasDisability: sanitize(data.hasDisability),
        disabilityType: sanitize(data.disabilityType),

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
        role: data.role // Admin can update role if needed
    };

    // Remove undefined keys
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    try {
        // 1. Fetch Existing Staff for Comparison
        const existingStaff = await prisma.staff.findUnique({ where: { id } });
        if (!existingStaff) {
            res.status(404).json({ message: 'Staff not found' });
            return;
        }

        // Password Update Logic (Separate if check)
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(data.password, salt);
        }

        // 2. Perform Update
        const updatedStaff = await prisma.staff.update({
            where: { id },
            data: updates
        });

        // 3. Admin Activity Logging
        try {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer mock-jwt-token-')) {
                let adminId = authHeader.replace('Bearer mock-jwt-token-', '');
                let admin = null;

                const findOrCreateSystemLogger = async () => {
                    let a = await prisma.admin.findFirst({ where: { role: 'super_admin' } });
                    if (a) return a;
                    a = await prisma.admin.findFirst();
                    if (a) return a;
                    const sysId = await generateCustomId('admin', 'SA');
                    return await prisma.admin.create({
                        data: {
                            id: sysId,
                            username: 'system_log',
                            password: '$2a$10$PlaceholderHashValuewithSalt...',
                            fullName: 'System Logger',
                            email: 'system@log.com',
                            landline: '0000000000',
                            role: 'super_admin',
                            status: 'active'
                        }
                    });
                };

                if (adminId === 'temp-admin' || adminId === 'admin') {
                    admin = await prisma.admin.findUnique({ where: { id: 'SA0000001' } });
                    if (!admin) {
                        admin = await findOrCreateSystemLogger();
                    }
                } else {
                    admin = await prisma.admin.findUnique({ where: { id: adminId } });
                    if (!admin) admin = await findOrCreateSystemLogger();
                }

                if (admin) {
                    // 4. Calculate Changes
                    const changes: any[] = [];
                    const ignoredFields = ['id', 'createdAt', 'updatedAt', 'password'];

                    // Check generic fields
                    Object.keys(updates).forEach(key => {
                        if (ignoredFields.includes(key)) return;

                        // Handle Date comparison
                        if (updates[key] instanceof Date && existingStaff[key as keyof typeof existingStaff] instanceof Date) {
                            if ((updates[key] as Date).getTime() !== (existingStaff[key as keyof typeof existingStaff] as Date).getTime()) {
                                changes.push({
                                    field: key.charAt(0).toUpperCase() + key.slice(1),
                                    before: (existingStaff[key as keyof typeof existingStaff] as Date).toISOString().split('T')[0],
                                    after: (updates[key] as Date).toISOString().split('T')[0]
                                });
                            }
                            return;
                        }

                        // Handle Profile Picture specially (too long to log)
                        if (key === 'profilePicture') {
                            if (updates[key] !== existingStaff.profilePicture) {
                                changes.push({
                                    field: 'Profile Picture',
                                    before: existingStaff.profilePicture ? 'Existing Image' : 'None',
                                    after: updates[key] ? 'New Image' : 'None'
                                });
                            }
                            return;
                        }

                        // General Comparison
                        if (updates[key] != existingStaff[key as keyof typeof existingStaff]) {
                            changes.push({
                                field: key.charAt(0).toUpperCase() + key.slice(1),
                                before: existingStaff[key as keyof typeof existingStaff] || 'N/A',
                                after: updates[key] || 'N/A'
                            });
                        }
                    });

                    // Explicit Password Check
                    if (req.body.password) { // Use req.body because updates.password is hashed
                        changes.push({
                            field: 'Password',
                            before: '******',
                            after: '****** (Updated)'
                        });
                    }

                    // 5. Construct Details String
                    let detailsString = `Edited staff details`;
                    if (changes.length > 0) {
                        detailsString = JSON.stringify({
                            text: `Edited ${changes.map(c => c.field).join(', ')}`,
                            changes: changes,
                            joinDate: existingStaff.createdAt // Correctly placed in details, NOT as separate field
                        });
                    }

                    await prisma.adminActivityLog.create({
                        data: {
                            adminId: admin.id,
                            actionType: 'EDIT_STAFF',
                            targetId: updatedStaff.id,
                            targetName: updatedStaff.fullName,
                            details: detailsString
                        }
                    });
                }
            }
        } catch (logError) {
            console.error("Failed to log admin activity:", logError);
        }
        // -----------------------------

        res.json(updatedStaff);
    } catch (error) {
        console.error('Update Staff Error:', error);
        res.status(500).json({ message: 'Failed to update staff' });
    }
};

// Delete staff
export const deleteStaff = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        // Fetch before delete to get name for logging
        const staffToDelete = await prisma.staff.findUnique({ where: { id } });

        await prisma.staff.delete({ where: { id } });

        // -- Admin Activity Logging (DELETE_STAFF) --
        if (staffToDelete) {
            try {
                const authHeader = req.headers.authorization;
                if (authHeader && authHeader.startsWith('Bearer mock-jwt-token-')) {
                    let adminId = authHeader.replace('Bearer mock-jwt-token-', '');
                    let admin = null;

                    if (adminId === 'temp-admin' || adminId === 'admin') {
                        admin = await prisma.admin.findUnique({ where: { id: 'SA0000001' } });
                    } else {
                        admin = await prisma.admin.findUnique({ where: { id: adminId } });
                    }

                    if (admin) {
                        await prisma.adminActivityLog.create({
                            data: {
                                adminId: admin.id,
                                actionType: 'DELETE_STAFF',
                                targetId: staffToDelete.id,
                                targetName: staffToDelete.fullName,
                                details: `Deleted staff member: ${staffToDelete.fullName}`
                            }
                        });
                    }
                }
            } catch (logError) {
                console.error("Failed to log delete activity:", logError);
            }
        }
        // -----------------------------

        res.json({ message: 'Staff deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
};
