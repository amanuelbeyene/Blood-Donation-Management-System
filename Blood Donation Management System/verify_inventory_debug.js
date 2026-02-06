
const { PrismaClient } = require('@prisma/client');
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
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
