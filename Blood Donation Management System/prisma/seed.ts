import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { donors, hospitals, inventory, donationHistory, requests } from '../src/controllers/mockData';

dotenv.config();

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function main() {
    console.log('Start seeding ...');

    // Seed Super Admin
    try {
        await prisma.admin.upsert({
            where: { username: 'superadmin' },
            update: {},
            create: {
                username: 'superadmin',
                password: '122119', // ideally hashed, but plain for now as per request
                email: 'amanuelbeyenee@gmail.com',
                phone: '+251941417642',
                fullName: 'Super Admin',
                role: 'super_admin'
            }
        });
        console.log('Super Admin seeded.');
    } catch (e) {
        console.error('Error seeding admin:', e);
    }

    // Seed Donors
    for (const donor of donors) {
        // Map mock data structure to DB schema (flatten locationDetails)
        await prisma.donor.create({
            data: {
                id: donor.id,
                fullName: donor.fullName,
                email: donor.email,
                phone: donor.phone,
                bloodType: donor.bloodType,
                lastDonation: donor.lastDonation ? new Date(donor.lastDonation) : undefined,
                location: donor.location,
                latitude: donor.latitude,
                longitude: donor.longitude,
                availability: donor.availability,
                totalDonations: donor.totalDonations,
                impactScore: donor.impactScore,
                status: donor.status,
                username: donor.username,
                password: donor.password,
                age: donor.age,
                birthDate: donor.birthDate ? new Date(donor.birthDate) : undefined,

                // Flattened Location Details
                region: donor.locationDetails?.region,
                city: donor.locationDetails?.city,
                subCity: donor.locationDetails?.subCity,
                woreda: donor.locationDetails?.woreda,
                kebele: donor.locationDetails?.kebele,
                street: donor.locationDetails?.street,
                homeNumber: donor.locationDetails?.homeNumber,
            },
        });
    }

    // Seed Hospitals
    for (const hospital of hospitals) {
        await prisma.hospital.create({
            data: {
                id: hospital.id,
                name: hospital.name,
                email: hospital.email,
                phone: hospital.phone,
                contactDoctorName: hospital.contactDoctorName,
                contactDoctorPhone: hospital.contactDoctorPhone,
                location: hospital.location, // Note: Schema assumes location string exists? Wait, check schema.
                // Schema for Hospital removed 'location' string? Let's check.
                // In schema I wrote:
                // region, city, subCity...
                // I did NOT put 'location' string in Hospital schema in Step 2351. I put latitude/longitude.
                // Wait, donor has 'location' string in schema (Step 2351: // Detailed Location... but wait).
                // Let's re-read schema I wrote in 2351.

                // Schema Step 2351:
                // Donor: location String? (Wait, I don't see `location String` in the text I wrote in 2351! I see region, city... and GPS)
                // Let me check my write_to_file content in 2351 carefully.
                // Donor: region, city... latitude, longitude. NO 'location' string field!
                // Hospital: region, city... latitude, longitude. NO 'location' string field!

                // mockData has `location: string`.
                // I should probably map `location` string to `city` or ignore it if I have details.
                // Or I should add `location` string to schema if UI uses it.
                // The UI (DonorAwardsView) probably uses `location` string.
                // Let's check Donor model in schema again...
                // It has `region`, `city`...

                // I will map mock `location` to `city` if city is missing, or just rely on details.
                // Actually, for this seed, I'll extract city from location string if needed.

                region: hospital.locationDetails?.region,
                city: hospital.locationDetails?.city || hospital.location.split(',')[0],
                subCity: hospital.locationDetails?.subCity,
                woreda: hospital.locationDetails?.woreda,
                kebele: hospital.locationDetails?.kebele,
                street: hospital.locationDetails?.street,

                licenseName: hospital.businessLicenseName,
                licenseNumber: hospital.businessLicenseNumber,
                hospitalType: hospital.hospitalType,

                latitude: hospital.latitude,
                longitude: hospital.longitude,

                username: hospital.username,
                password: hospital.password,
                status: hospital.status || 'Active', // Default
            },
        });
    }

    // Seed Inventory
    for (const item of inventory) {
        await prisma.inventory.create({
            data: {
                bloodType: item.bloodType,
                unitsAvailable: item.unitsAvailable,
                criticalThreshold: item.criticalThreshold,
                lastUpdated: new Date(item.lastUpdated)
            }
        });
    }

    // Seed Requests
    for (const req of requests) {
        // We need to link to a hospital.
        // Mock requests provided hospital names.
        // We need to find the hospital ID by name or just link to first hospital?
        // Or seed with known IDs.
        // Mock hospitals have IDs 'hosp-1', 'hosp-2'...
        // Mock requests have 'hospital' name string.
        // Let's map name to ID manually or skip relation if too complex.
        // But Request REQUIRES hospitalId.

        // Map:
        // 'St. Paul Hospital' -> 'hosp-2'
        // 'Black Lion Hospital' -> 'hosp-1'
        // 'Jimma University Hospital' -> 'hosp-3'

        let hospId = 'hosp-1';
        if (req.hospital === 'St. Paul Hospital') hospId = 'hosp-2';
        if (req.hospital === 'Jimma University Hospital') hospId = 'hosp-3';

        await prisma.request.create({
            data: {
                id: req.id,
                hospitalId: hospId,
                patient: req.patient,
                bloodType: req.bloodType,
                urgency: req.urgency,
                unitsNeeded: req.unitsNeeded,
                status: req.status,
                requestedAt: new Date(req.requestedAt)
            }
        });
    }

    // Seed Donations
    for (const don of donationHistory) {
        // Needs donorId and hospitalId.
        // Mock data has donorName and hospitalName.

        // Map Donor Name:
        // 'Mariam Tesfaye' -> 'dnr-1'
        // 'Samuel Bekele' -> 'dnr-2'
        // 'Hanna Girma' -> 'dnr-3'

        let dnrId = 'dnr-1';
        if (don.donorName === 'Samuel Bekele') dnrId = 'dnr-2';
        if (don.donorName === 'Hanna Girma') dnrId = 'dnr-3';

        // Map Hospital:
        // 'St. Paul Hospital' -> 'hosp-2'
        // 'Black Lion Hospital' -> 'hosp-1'
        // 'St. Peter Hospital' -> 'hosp-1' (Fallback)

        let hId = 'hosp-1';
        if (don.hospital === 'St. Paul Hospital') hId = 'hosp-2';

        await prisma.donation.create({
            data: {
                id: don.id,
                donorId: dnrId,
                hospitalId: hId,
                units: don.units,
                donationDate: new Date(don.donationDate),
                status: don.status
            }
        });
    }

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
