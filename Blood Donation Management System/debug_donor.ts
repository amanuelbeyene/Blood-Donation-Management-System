
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const donorId = 'D0000015';
    console.log(`Checking donor ${donorId}...`);

    const donor = await prisma.donor.findUnique({
        where: { id: donorId },
    });

    if (!donor) {
        console.log('Donor not found');
    } else {
        console.log('Donor Data:', JSON.stringify(donor, null, 2));
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
