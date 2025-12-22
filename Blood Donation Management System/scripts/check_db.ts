import prisma from '../server/config/prisma';

async function main() {
    console.log('Checking Donors in Database...');
    const donors = await prisma.donor.findMany({
        select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
            fanNumber: true
        }
    });

    console.log('Found Donors:');
    console.table(donors);

    const hospitals = await prisma.hospital.findMany({
        select: {
            id: true,
            name: true,
            email: true
        }
    });
    console.log('Found Hospitals:');
    console.table(hospitals);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
