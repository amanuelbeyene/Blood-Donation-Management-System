import prisma from '../server/config/prisma';

async function main() {
    const targetEmail = 'amanuelbeyenee@gmail.com';
    console.log(`Checking for email: ${targetEmail}`);

    const donor = await prisma.donor.findUnique({
        where: { email: targetEmail }
    });

    if (donor) {
        console.log('FOUND DONOR:', JSON.stringify(donor, null, 2));
    } else {
        console.log('Donor NOT found via findUnique.');
    }

    // Also check all emails just in case of casing issues
    const allDonors = await prisma.donor.findMany({
        select: { email: true, username: true }
    });
    console.log('All Donor Emails:', JSON.stringify(allDonors, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
