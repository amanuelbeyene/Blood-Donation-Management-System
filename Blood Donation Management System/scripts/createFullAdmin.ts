
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Full Super Admin Creation...');

    // User Data
    const userData = {
        username: 'amanuel',
        password: '#Amanuel,4002',
        fullName: 'Amanuel Beyene Asosa',
        email: 'amanuelbeyenee@gmail.com',
        landline: '0114141764',
        phone: '+251941417642',
        bloodType: 'B-',
        birthDate: new Date('2000-10-04'),
        age: 25,
        gender: 'Male',
        maritalStatus: 'Single', // Normalized case
        // medicalCondition: 'Normal', // Not in Admin schema
        // hasDisability: 'NO', // Not in Admin schema
        // disabilityType: 'NO', // Not in Admin schema

        // Address
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        subCity: 'Bole Subcity',
        woreda: 'Woreda 08',
        kebele: '08',
        street: 'Megenagnia Street',
        homeNumber: '1456',
        location: 'Addis Ababa, Bole SubCity, Woreda 08',

        // GPS
        latitude: 9.007923,
        longitude: 38.767821,

        fanNumber: '6490859284201863',
        role: 'super_admin',
        status: 'active'
    };

    // Image Handling
    let profilePicture = null;
    const imagePath = 'C:/Users/yigus/.gemini/antigravity/brain/37eb521e-5184-4dbe-b437-8aeba98532ee/uploaded_image_1766988632967.jpg';

    try {
        if (fs.existsSync(imagePath)) {
            console.log('Reading profile picture...');
            const imageBuffer = fs.readFileSync(imagePath);
            // Guess mime type based on extension or assume png
            const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
            profilePicture = base64Image;
            console.log('Profile picture read successfully.');
        } else {
            console.warn('Profile picture file not found at:', imagePath);
        }
    } catch (err) {
        console.error('Error reading profile picture:', err);
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Check if user exists
    const existingUser = await prisma.admin.findFirst({
        where: {
            OR: [
                { username: userData.username },
                { email: userData.email }
            ]
        }
    });

    if (existingUser) {
        console.log(`User exists with ID: ${existingUser.id}. Deleting to enforce new ID 'SA0000001'...`);
        await prisma.admin.delete({ where: { id: existingUser.id } });
    }

    console.log('Creating new Super Admin with ID SA0000001...');
    await prisma.admin.create({
        data: {
            id: 'SA0000001', // Explicitly set ID
            username: userData.username,
            password: hashedPassword,
            fullName: userData.fullName,
            email: userData.email,
            landline: userData.landline,
            phone: userData.phone,
            bloodType: userData.bloodType,
            birthDate: userData.birthDate,
            age: userData.age,
            gender: userData.gender,
            maritalStatus: userData.maritalStatus,
            fanNumber: userData.fanNumber,

            region: userData.region,
            city: userData.city,
            subCity: userData.subCity,
            woreda: userData.woreda,
            kebele: userData.kebele,
            street: userData.street,
            homeNumber: userData.homeNumber,
            location: userData.location,
            latitude: userData.latitude,
            longitude: userData.longitude,

            role: userData.role,
            status: userData.status,
            profilePicture: profilePicture
        }
    });
    console.log('New Super Admin created successfully with ID SA0000001.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
