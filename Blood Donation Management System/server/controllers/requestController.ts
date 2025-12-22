import { Request, Response } from 'express';
import prisma from '../config/prisma';

const mapRequestToFrontend = (req: any) => ({
    ...req,
    hospital: req.hospital?.name, // Flatten relation for frontend table
    hospitalId: req.hospitalId
});

export const getRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const requests = await prisma.request.findMany({
            include: { hospital: true },
            orderBy: { requestedAt: 'desc' }
        });
        res.json(requests.map(mapRequestToFrontend));
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch requests' });
    }
};

export const createRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        // Ideally we get hospitalId from Auth Token in a real app, assuming passed in body for now
        const newRequest = await prisma.request.create({
            data: {
                hospitalId: data.hospitalId,
                patient: data.patient,
                bloodType: data.bloodType,
                urgency: data.urgency,
                unitsNeeded: parseInt(data.unitsNeeded),
                status: 'pending'
            },
            include: { hospital: true }
        });
        res.status(201).json(mapRequestToFrontend(newRequest));
    } catch (error: any) {
        console.error("Create Request Error", error);
        res.status(500).json({ message: 'Failed to create request' });
    }
};

export const updateRequest = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const updated = await prisma.request.update({
            where: { id },
            data: {
                ...updates,
                unitsNeeded: updates.unitsNeeded ? parseInt(updates.unitsNeeded) : undefined
            },
            include: { hospital: true }
        });
        res.json(mapRequestToFrontend(updated));
    } catch (error) {
        res.status(500).json({ message: 'Update failed' });
    }
};

export const deleteRequest = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.request.delete({ where: { id } });
        res.json({ message: 'Request deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
};
