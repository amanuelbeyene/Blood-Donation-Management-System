import { Request, Response } from 'express';
import prisma from '../config/prisma';

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

export const createAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        const newAdmin = await prisma.admin.create({
            data: {
                username: data.username,
                password: data.password,
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                role: data.role || 'admin',
                profilePicture: data.profilePicture,
                status: data.status || 'active',
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
    const updates = req.body;
    delete updates.id;
    delete updates.createdAt; // Prevent updating createdAt

    // Parse floats if strings
    if (updates.latitude) updates.latitude = parseFloat(updates.latitude);
    if (updates.longitude) updates.longitude = parseFloat(updates.longitude);

    try {
        const updatedAdmin = await prisma.admin.update({
            where: { id },
            data: updates
        });
        res.json(updatedAdmin);
    } catch (error) {
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
