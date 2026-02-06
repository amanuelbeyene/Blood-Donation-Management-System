
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("--- Backfilling Staff Logs ---");

    // 1. Get Target Admin (Meskerem - AD0000001)
    const targetAdmin = await prisma.admin.findUnique({ where: { id: 'AD0000001' } });
    if (!targetAdmin) {
        console.error("Target Admin AD0000001 not found!");
        return;
    }
    console.log(`Targeting Admin: ${targetAdmin.fullName} (${targetAdmin.id})`);

    // 2. Get All Staff
    const allStaff = await prisma.staff.findMany();
    console.log(`Found ${allStaff.length} Staff members.`);

    // 3. Get Existing ADD_STAFF Logs
    const existingLogs = await prisma.adminActivityLog.findMany({
        where: { actionType: 'ADD_STAFF' }
    });
    const loggedStaffIds = new Set(existingLogs.map(l => l.targetId));

    // 4. Backfill
    let count = 0;
    for (const staff of allStaff) {
        if (!loggedStaffIds.has(staff.id)) {
            console.log(`Creating log for Unlogged Staff: ${staff.fullName} (ID: ${staff.id})`);

            await prisma.adminActivityLog.create({
                data: {
                    adminId: targetAdmin.id,
                    actionType: 'ADD_STAFF',
                    targetId: staff.id,
                    targetName: staff.fullName,
                    details: `Added new staff member: ${staff.fullName} (Restored History)`,
                    createdAt: staff.createdAt // Preserve original creation time
                }
            });
            count++;
        } else {
            console.log(`Skipping Logged Staff: ${staff.fullName}`);
        }
    }

    console.log(`\nBackfill Complete. Created ${count} new logs.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
