import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        const inventory = await prisma.inventory.findMany();
        res.json(inventory);
    } catch (error) {
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
