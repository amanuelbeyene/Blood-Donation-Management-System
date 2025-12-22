import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const login = async (req: Request, res: Response): Promise<void> => {
    const { identifier, password, role } = req.body;

    try {
        let user;
        if (role === 'donor') {
            user = await prisma.donor.findFirst({
                where: {
                    OR: [
                        { email: identifier },
                        { username: identifier },
                        { phone: identifier },
                    ],
                },
            });
        } else if (role === 'hospital') {
            user = await prisma.hospital.findFirst({
                where: {
                    OR: [
                        { email: identifier },
                        { username: identifier },
                        { phone: identifier },
                    ],
                },
            });
        } else {
            // Check Admin table
            const user = await prisma.admin.findFirst({
                where: {
                    OR: [
                        { email: identifier },
                        { username: identifier }
                    ]
                }
            });

            if (user && user.password === password) {
                // Return user info (excluding password)
                const { password: _, ...userWithoutPassword } = user;
                res.json({
                    ...userWithoutPassword,
                    role: user.role, // 'admin' or 'super_admin'
                    token: `mock-jwt-token-${user.id}`,
                });
                return;
            }

            // Fallback for initial bootstrap (if DB is empty, allow default admin)
            if (identifier === 'admin' && password === 'admin') {
                res.json({
                    id: 'temp-admin',
                    name: 'System Admin',
                    role: 'super_admin',
                    token: 'mock-jwt-token-admin',
                });
                return;
            }

            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        if (!user || user.password !== password) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Return user info (excluding password)
        // In production, use JWT
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            ...userWithoutPassword,
            role,
            token: `mock-jwt-token-${user.id}`,
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
