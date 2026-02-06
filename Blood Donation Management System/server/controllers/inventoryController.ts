import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { createNotification } from './notificationController';

export const getInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        let inventory = await prisma.inventory.findMany();
        const allBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

        // Check if we need to seed
        const missingTypes = allBloodTypes.filter(type => !inventory.some(i => i.bloodType === type));

        if (missingTypes.length > 0) {
            // Seed missing types
            await prisma.inventory.createMany({
                data: missingTypes.map(type => ({
                    bloodType: type,
                    unitsAvailable: 0,
                    criticalThreshold: 10
                }))
            });
            // Re-fetch
            inventory = await prisma.inventory.findMany();
        }

        res.json(inventory);
    } catch (error) {
        console.error("Get Inventory Error", error);
        res.status(500).json({ message: 'Failed to fetch inventory' });
    }
};

export const updateInventory = async (req: Request, res: Response): Promise<void> => {
    // Inventory is likely identified by bloodType, but Prisma ID is UUID.
    // If the frontend sends ID, fine. If it sends bloodType, we need to handle that.
    // Schema says ID is UUID.
    const { id } = req.params;
    const { unitsAvailable } = req.body;

    try {
        const updated = await prisma.inventory.update({
            where: { id },
            data: {
                unitsAvailable: parseInt(unitsAvailable),
                lastUpdated: new Date()
            }
        });

        // Notification
        const token = req.headers.authorization?.split(' ')[1];
        let actor = 'Admin/System';
        let staffId = null;

        if (token && !token.startsWith('mock-jwt-token-SA') && !token.startsWith('mock-jwt-token-admin')) {
            staffId = token.replace('mock-jwt-token-', '');
            const staff = await prisma.staff.findUnique({ where: { id: staffId } });
            if (staff) actor = `Staff ${staff.fullName}`;
        }

        await createNotification(
            `${actor} manually updated ${updated.bloodType} stock to ${updated.unitsAvailable} units`,
            'INVENTORY_UPDATE',
            updated.id,
            'admin'
        );

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Update failed' });
    }
};

// Seed/Init inventory if empty (optional helper)
export const initInventory = async (req: Request, res: Response) => {
    // Logic to ensure all blood types exist
    res.json({ message: 'Not implemented' });
}

// Check for expired blood (older than 45 days)
export const checkExpiration = async (req: Request, res: Response): Promise<void> => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 45); // 45 days ago

        const expiredDonations = await prisma.donation.findMany({
            where: {
                status: 'Completed',
                donationDate: {
                    lt: cutoffDate
                }
            },
            include: { donor: true }
        });

        const results = [];

        for (const donation of expiredDonations) {
            const result = await prisma.$transaction(async (prisma) => {
                // 1. Update Donation Status
                const updatedDonation = await prisma.donation.update({
                    where: { id: donation.id },
                    data: { status: 'Expired' }
                });

                // 2. Decrement Inventory
                // Find inventory for this blood type
                const inventoryItem = await prisma.inventory.findFirst({
                    where: { bloodType: donation.donor.bloodType }
                });

                if (inventoryItem) {
                    // Ensure we don't go below 0
                    const newAmount = Math.max(0, inventoryItem.unitsAvailable - donation.units);
                    await prisma.inventory.update({
                        where: { id: inventoryItem.id },
                        data: { unitsAvailable: newAmount }
                    });
                }

                return updatedDonation;
            });
            results.push(result);
        }

        res.json({ processed: results.length, expiredItems: results });
    } catch (error) {
        console.error("Check Expiration Error", error);
        res.status(500).json({ message: 'Failed to process expired stock' });
    }
};

export const getExpiredStock = async (req: Request, res: Response): Promise<void> => {
    try {
        const expired = await prisma.donation.findMany({
            where: { status: 'Expired' },
            include: { donor: true },
            orderBy: { donationDate: 'desc' }
        });

        const mapped = expired.map(d => ({
            id: d.id,
            donorName: d.donor.fullName,
            bloodType: d.donor.bloodType,
            units: d.units,
            donationDate: d.donationDate,
            expiryDate: new Date(new Date(d.donationDate).getTime() + (45 * 24 * 60 * 60 * 1000)), // Approximate
            status: d.status
        }));

        res.json(mapped);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch expired stock' });
    }
};
