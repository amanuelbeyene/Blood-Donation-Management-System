
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const latestRequest = await prisma.request.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { hospital: true }
    });

    console.log('Latest Request:', latestRequest);
    if (latestRequest) {
        console.log('Note Field:', latestRequest.note);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
