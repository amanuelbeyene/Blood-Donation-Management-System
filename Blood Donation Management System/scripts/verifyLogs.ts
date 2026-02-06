
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("--- Verifying DB State ---");

    // 1. Check Admins
    const admins = await prisma.admin.findMany();
    console.log(`Found ${admins.length} Admins.`);
    admins.forEach(a => console.log(` - [${a.role}] ${a.username} (ID: ${a.id})`));

    // 2. Check Logs
    // @ts-ignore
    if (!prisma.adminActivityLog) {
        console.error("CRITICAL: prisma.adminActivityLog is undefined. Client not generated properly?");
        return;
    }

    const logs = await prisma.adminActivityLog.findMany();
    console.log(`Found ${logs.length} Activity Logs.`);
    logs.forEach(l => console.log(` - ${l.actionType} by ${l.adminId}: ${l.details}`));

    // 3. Try to Create a Log
    if (admins.length > 0) {
        const admin = admins[0];
        console.log(`\nAttempting to create a test log for admin ${admin.username} (${admin.id})...`);

        try {
            const newLog = await prisma.adminActivityLog.create({
                data: {
                    adminId: admin.id,
                    actionType: 'ADD_STAFF',
                    targetId: 'test-staff-id',
                    targetName: 'Test Staff',
                    details: 'Manual Test Log Entry'
                }
            });
            console.log("SUCCESS: Created log entry:", newLog);
        } catch (e) {
            console.error("FAILED to create log entry:", e);
        }
    } else {
        console.warn("No admins found to attach a log to.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
