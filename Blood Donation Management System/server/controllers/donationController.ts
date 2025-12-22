import { Request, Response } from 'express';
import prisma from '../config/prisma';

const mapDonationToFrontend = (d: any) => ({
    ...d,
    donorName: d.donor?.fullName,
    hospital: d.hospital?.name,
});

export const getDonations = async (req: Request, res: Response): Promise<void> => {
    try {
        const donations = await prisma.donation.findMany({
            include: { donor: true, hospital: true },
            orderBy: { donationDate: 'desc' }
        });
        res.json(donations.map(mapDonationToFrontend));
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch donations' });
    }
};

export const createDonation = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        const newDonation = await prisma.donation.create({
            data: {
                donorId: data.donorId,
                hospitalId: data.hospitalId,
                units: parseInt(data.units),
                status: data.status || 'in-progress'
            },
            include: { donor: true, hospital: true }
        });
        res.status(201).json(mapDonationToFrontend(newDonation));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to log donation' });
    }
};

export const updateDonation = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status, units } = req.body;
    try {
        const updated = await prisma.donation.update({
            where: { id },
            data: {
                status,
                units: units ? parseInt(units) : undefined
            },
            include: { donor: true, hospital: true }
        });
        res.json(mapDonationToFrontend(updated));
    } catch (error) {
        res.status(500).json({ message: 'Update failed' });
    }
};
