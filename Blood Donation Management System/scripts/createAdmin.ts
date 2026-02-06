
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const username = 'amanuel';
    const passwordRaw = '#Amanuel,4002';

    // Check if exists
    const existing = await prisma.admin.findFirst({
        where: { username }
    });

    if (existing) {
        console.log('User already exists. Updating password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordRaw, salt);

        await prisma.admin.update({
            where: { id: existing.id },
            data: {
                password: hashedPassword,
                role: 'super_admin' // Ensure role is correct
            }
        });
        console.log('User updated.');
    } else {
        console.log('Creating new Super Admin...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordRaw, salt);

        await prisma.admin.create({
            data: {
                username: 'amanuel',
                email: 'amanuel@blood.gov.et', // Placeholder email
                fullName: 'Amanuel SuperAdmin',
                password: hashedPassword,
                landline: '0111111111', // Required field
                phone: '0911111111',
                role: 'super_admin',
                status: 'active'
            }
        });
        console.log('Super Admin created successfully.');
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
