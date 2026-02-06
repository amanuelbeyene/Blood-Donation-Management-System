import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function auditStaffPasswords() {
    console.log('Starting Staff Password Audit...');
    try {
        const allStaff = await prisma.staff.findMany();
        console.log(`Found ${allStaff.length} staff members.`);

        const defaultPassword = '12345678';

        for (const staff of allStaff) {
            console.log(`\nChecking Staff: ${staff.name} (${staff.email || staff.phone})`);
            console.log(`Details: ID=${staff.id}, Role=${staff.role}`);

            // Check against default password
            const isMatchDefault = await bcrypt.compare(defaultPassword, staff.password);

            if (isMatchDefault) {
                console.log(`✅ Password matches default "${defaultPassword}"`);
            } else {
                console.log(`❌ Password DOES NOT match default "${defaultPassword}"`);
                console.log(`   Stored Hash Prefix: ${staff.password.substring(0, 10)}...`);
                // Check if it's NOT a hash (e.g. plain text)
                if (!staff.password.startsWith('$2')) {
                    console.log(`   ⚠️ WARNING: Stored password does not look like a bcrypt hash!`);
                }
            }
        }
    } catch (error) {
        console.error('Error auditing staff passwords:', error);
    } finally {
        await prisma.$disconnect();
    }
}

auditStaffPasswords();
