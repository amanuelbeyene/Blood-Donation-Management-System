
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateCustomId } from '../server/utils/idGenerator';

const prisma = new PrismaClient();

async function main() {
    console.log('Creating Super Admin...');

    const email = 'amanuelbeyenee@gmail.com';
    const username = 'amanuel';
    const rawPassword = '#Amanuel,4002';

    // Check if exists
    const existing = await prisma.admin.findFirst({
        where: {
            OR: [
                { email },
                { username }
            ]
        }
    });

    if (existing) {
        console.log('Admin with this email or username already exists. Updating role to super_admin...');
        // Update existing to super_admin and set details if needed, or just warn.
        // For this task, let's update it to match requested details to be safe.
        // Actually, if it exists, let's delete and recreate or update.
        // Let's update.
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    // Generate ID
    // We need to handle this carefully. If updating, keep ID? Or if creating, generate new.
    let adminId = existing?.id;
    if (!adminId) {
        adminId = await generateCustomId('admin', 'ADM');
    }

    const adminData = {
        username,
        password: hashedPassword,
        fullName: 'Amanuel Beyene Asosa',
        email,
        phone: '+251941417642',
        role: 'super_admin',

        // Profile
        profilePicture: '/uploads/amanuel_profile.jpg',
        status: 'active',

        // Location
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        subCity: 'Bole Subcity',
        woreda: 'Woreda 08',
        kebele: '08',
        street: 'Megenagnia Street',
        homeNumber: '1456',

        location: 'Addis Ababa, Bole SubCity, Woreda 08',
        latitude: 9.007923,
        longitude: 38.767821,
    };

    if (existing) {
        await prisma.admin.update({
            where: { id: adminId },
            data: adminData
        });
        console.log(`Updated existing admin ${username} to Super Admin.`);
    } else {
        await prisma.admin.create({
            data: {
                id: adminId,
                ...adminData
            }
        });
        console.log(`Created new Super Admin: ${username} (ID: ${adminId})`);
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
