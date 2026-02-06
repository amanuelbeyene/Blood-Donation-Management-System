
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const identifier = 'amanuel';
    console.log(`Searching for admin with identifier: ${identifier}`);

    const user = await prisma.admin.findFirst({
        where: {
            OR: [
                { email: identifier },
                { username: identifier }
            ]
        }
    });

    if (user) {
        console.log('User found:', {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            passwordHash: user.password.substring(0, 10) + '...', // Show partial hash
        });
    } else {
        console.log('User NOT found.');
        // List all admins to help debugging
        const allAdmins = await prisma.admin.findMany({
            select: { username: true, email: true, role: true }
        });
        console.log('Existing Admins:', allAdmins);
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
