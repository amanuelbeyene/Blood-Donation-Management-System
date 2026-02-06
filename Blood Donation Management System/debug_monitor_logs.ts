
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("--- Fetching Last 5 Admin Activity Logs ---");
    const logs = await prisma.adminActivityLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    logs.forEach(log => {
        console.log(`\nID: ${log.id}`);
        console.log(`Action: ${log.actionType}`);
        console.log(`Target: ${log.targetName} (${log.targetId})`);
        console.log(`Details: ${log.details}`);
        console.log(`Details Type: ${typeof log.details}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
