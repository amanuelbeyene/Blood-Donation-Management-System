import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetStaffPasswords() {
    console.log('Starting Staff Password Reset...');
    try {
        const defaultPassword = '12345678';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        console.log(`Generated hash for "${defaultPassword}": ${hashedPassword}`);

        const updateResult = await prisma.staff.updateMany({
            data: {
                password: hashedPassword
            }
        });

        console.log(`✅ Successfully updated ${updateResult.count} staff records.`);
        console.log('All staff members should now be able to login with password: "12345678"');

    } catch (error) {
        console.error('Error resetting staff passwords:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetStaffPasswords();
