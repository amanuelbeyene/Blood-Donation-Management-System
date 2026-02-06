import { Request, Response } from 'express';
import prisma from '../config/prisma';

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
