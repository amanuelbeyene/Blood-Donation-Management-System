
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Creating test request with note...");
    // Find a hospital ID first
    const hospital = await prisma.hospital.findFirst();
    if (!hospital) {
        console.log("No hospital found to create request");
        return;
    }

    const created = await prisma.request.create({
        data: {
            hospitalId: hospital.id,
            patient: "Test Note Patient",
            bloodType: "A+",
            urgency: "high",
            unitsNeeded: 1,
            status: "pending",
            note: "This is a test note from script"
        }
    });

    console.log("Created Request:", created);
    console.log("Note saved:", created.note);

    // Clean up
    await prisma.request.delete({ where: { id: created.id } });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
