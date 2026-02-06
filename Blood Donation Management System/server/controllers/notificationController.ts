import { Request, Response } from 'express';
import prisma from '../config/prisma';

// Get notifications for a role
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
    const { role } = req.query; // Expecting ?role=super_admin or inferred from token

    if (!role || typeof role !== 'string') {
        res.status(400).json({ message: 'Role parameter is required' });
        return;
    }

    const normalizedRole = role.toLowerCase();

    try {
        // Allow Super Admin to see both 'super_admin' and 'admin' notifications
        let whereClause: any = {};

        if (req.query.userId) {
            whereClause = { userId: req.query.userId as string };
        } else {
            whereClause = { forRole: normalizedRole };
            if (normalizedRole === 'super_admin') {
                whereClause = {
                    forRole: { in: ['super_admin', 'admin'] }
                };
            } else if (normalizedRole === 'medical_staff') {
                whereClause = {
                    forRole: { in: ['medical_staff', 'staff'] }
                };
            }
        }

        const notifications = await prisma.notification.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });
        res.json(notifications);
    } catch (error) {
        console.error('Get Notifications Error:', error);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const notification = await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
        res.json(notification);
    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ message: 'Failed to update notification' });
    }
};

// Create notification (Helper for internal use)
export const createNotification = async (message: string, type: string, relatedId: string | null, forRole: string = 'admin', userId: string | null = null) => {
    try {
        await prisma.notification.create({
            data: {
                message,
                type,
                relatedId,
                forRole,
                userId,
                isRead: false
            }
        });
    } catch (error) {
        console.error('Create Notification Error:', error);
    }
};
