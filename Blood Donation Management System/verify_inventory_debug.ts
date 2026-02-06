
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching inventory for B-...');
    const inventory = await prisma.inventory.findMany({
        where: {
            bloodType: 'B-'
        }
    });

    console.log(`Found ${inventory.length} records for B-`);
    inventory.forEach(item => {
        console.log(`ID: ${item.id}, Units: ${item.unitsAvailable}`);
    });

    if (inventory.length > 1) {
        console.log('WARNING: Multiple records found for B-! This might be the cause.');
    }

    // Also check all types for duplicates
    const allInventory = await prisma.inventory.findMany();
    const typeCounts: Record<string, number> = {};
    allInventory.forEach((item: { bloodType: string }) => {
        typeCounts[item.bloodType] = (typeCounts[item.bloodType] || 0) + 1;
    });

    console.log('Duplicate Check Summary:');
    Object.entries(typeCounts).forEach(([type, count]) => {
        if (count > 1) console.log(`- ${type}: ${count} records`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
