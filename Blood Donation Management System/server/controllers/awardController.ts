import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { createNotification } from './notificationController';

const prizeTiers = [
    { points: 2000, title: 'Free Treatment', tierName: 'Tier 1' },
    { points: 1800, title: 'Free Medicine', tierName: 'Tier 2' },
    { points: 1500, title: 'Computer', tierName: 'Tier 3' },
    { points: 1300, title: 'Mobile', tierName: 'Tier 4' },
    { points: 1000, title: 'Books', tierName: 'Tier 5' },
    { points: 800, title: 'Free Transportation', tierName: 'Tier 6' },
    { points: 600, title: 'Credit Money', tierName: 'Tier 7' },
    { points: 300, title: 'Electronics', tierName: 'Tier 8' },
    { points: 100, title: 'Free Mobile Airtime', tierName: 'Tier 9' },
];

export const drawWinners = async (req: Request, res: Response): Promise<void> => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Check if draw already happened this month
        const existingcount = await prisma.lotteryWinner.count({
            where: {
                month: {
                    gte: startOfMonth
                }
            }
        });

        if (existingcount > 0) {
            // Option: Allow re-draw or block. For now, let's just add to it or return existing
            // But user said "make the award pick one person... make this for 9 Prize Collection Tiers"
            // Let's assume we can re-run or fill missing spots.
            // For simplicity, let's proceed to pick winners for tiers not yet populated, or just pick new ones.
        }

        const winners: any[] = [];

        for (const tier of prizeTiers) {
            // Find eligible donors
            // Points calculation: totalDonations * 100
            // So minDonations = points / 100
            const minDonations = Math.ceil(tier.points / 100);

            // Get donors who qualify and haven't won this tier this month
            // Also optional: exclude donors who won ANY tier this month? Let's keep it simple: one prize per person per month?
            const alreadyWonDonorIds = winners.map(w => w.donorId); // simplified local check

            const eligibleDonors = await prisma.donor.findMany({
                where: {
                    totalDonations: {
                        gte: minDonations
                    },
                    id: {
                        notIn: alreadyWonDonorIds
                    }
                },
                select: { id: true, fullName: true, totalDonations: true }
            });

            if (eligibleDonors.length > 0) {
                // Randomly pick one
                const randomIndex = Math.floor(Math.random() * eligibleDonors.length);
                const winner = eligibleDonors[randomIndex];

                // Save to DB
                // Check if this tier already has a winner this month
                const existingTierWinner = await prisma.lotteryWinner.findFirst({
                    where: {
                        month: { gte: startOfMonth },
                        tierName: tier.title // Using title as the unique identifier for the tier roughly
                    }
                });

                if (!existingTierWinner) {
                    const newWinner = await prisma.lotteryWinner.create({
                        data: {
                            donorId: winner.id,
                            tierName: tier.title,
                            points: winner.totalDonations * 100,
                            month: startOfMonth,
                            award: tier.title
                        }
                    });
                    winners.push(newWinner);

                    // Send Notification
                    await createNotification(
                        `Congratulations! You have won the ${tier.title} award in this month's lottery!`,
                        'award',
                        newWinner.id,
                        'donor',
                        winner.id
                    );
                }
            }
        }

        res.status(200).json({ message: 'Lottery draw completed', newWinners: winners });

    } catch (error) {
        console.error('Draw Lottery Error:', error);
        res.status(500).json({ message: 'Failed to draw winners' });
    }
};

export const getWinners = async (req: Request, res: Response): Promise<void> => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const winners = await prisma.lotteryWinner.findMany({
            where: {
                month: {
                    gte: startOfMonth
                }
            },
            include: {
                donor: {
                    select: {
                        fullName: true,
                        bloodType: true,
                        location: true,
                        city: true,
                        totalDonations: true
                    }
                }
            }
        });

        res.json(winners);
    } catch (error) {
        console.error('Get Winners Error:', error);
        res.status(500).json({ message: 'Failed to fetch winners' });
    }
};
