import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncInventory() {
    console.log('Starting Inventory Sync...');

    try {
        // 1. Fetch all completed donations
        const donations = await prisma.donation.findMany({
            where: { status: 'Completed' }
        });

        // 2. Aggregate units by blood type
        const stockCounts: Record<string, number> = {
            'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
            'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
        };

        donations.forEach(d => {
            const type = d.donor?.bloodType; // Need to include donor to get blood type?
            // Donation model doesn't have bloodType directly, it links to donor.
            // Oh, wait.
        });

        // Re-fetch with include
        const donationsWithDonor = await prisma.donation.findMany({
            where: { status: 'Completed' },
            include: { donor: true }
        });

        donationsWithDonor.forEach(d => {
            if (d.donor && d.donor.bloodType) {
                const type = d.donor.bloodType as string;
                if (stockCounts[type] !== undefined) {
                    stockCounts[type] += d.units;
                }
            }
        });

        console.log('Calculated Stock from Donations:', stockCounts);

        // 3. Update Inventory
        for (const [type, units] of Object.entries(stockCounts)) {
            // Upsert (Create or Update)
            const existing = await prisma.inventory.findFirst({ where: { bloodType: type } });

            if (existing) {
                await prisma.inventory.update({
                    where: { id: existing.id },
                    data: { unitsAvailable: units } // Reset to exact calculation
                });
                console.log(`Updated ${type}: ${units} units`);
            } else {
                await prisma.inventory.create({
                    data: {
                        bloodType: type,
                        unitsAvailable: units,
                        criticalThreshold: 10
                    }
                });
                console.log(`Created ${type}: ${units} units`);
            }
        }

        console.log('Inventory Sync Complete!');
    } catch (error) {
        console.error('Sync Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

syncInventory();
