import { Request, Response } from 'express';
import prisma from '../config/prisma';

// Helper to map DB Donor to Frontend Donor (with nested locationDetails)
const mapDonorToFrontend = (donor: any) => {
    return {
        ...donor,
        locationDetails: {
            region: donor.region,
            city: donor.city,
            subCity: donor.subCity,
            woreda: donor.woreda,
            kebele: donor.kebele,
            street: donor.street,
            homeNumber: donor.homeNumber,
            latitude: donor.latitude,
            longitude: donor.longitude
        }
    };
};

const generateLotteryId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `LOT-${randomNum}`;
};

export const registerDonor = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        console.log('Received Register Donor Request:', { ...data, profilePicture: data.profilePicture ? 'Base64 String' : 'undefined' });

        // Helper to sanitize input
        const sanitize = (val: any) => {
            if (val === '') return undefined;
            if (val === 'null') return undefined;
            if (val === 'undefined') return undefined;
            return val;
        };

        // Helper to check for valid date
        const validDate = (d: any) => {
            if (!d) return undefined;
            const date = new Date(d);
            return isNaN(date.getTime()) ? undefined : date;
        };

        const validFloat = (d: any) => {
            if (d !== undefined && d !== null && d !== '') {
                const f = parseFloat(d);
                return isNaN(f) ? undefined : f;
            }
            return undefined;
        }

        const locationDetails = data.locationDetails || {};

        // Explicitly WHITELIST fields to prevent "Unknown argument" errors
        const donorData = {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            bloodType: data.bloodType,

            // Dates & Numbers
            birthDate: validDate(data.birthDate),
            donationAppointmentDate: validDate(data.donationAppointmentDate),
            age: (typeof data.age === 'string' ? parseInt(data.age, 10) : data.age) || undefined,

            // Location (Flattened)
            region: sanitize(locationDetails.region || data.region),
            city: sanitize(locationDetails.city || data.city),
            subCity: sanitize(locationDetails.subCity || data.subCity),
            woreda: sanitize(locationDetails.woreda || data.woreda),
            kebele: sanitize(locationDetails.kebele || data.kebele),
            street: sanitize(locationDetails.street || data.street),
            homeNumber: sanitize(locationDetails.homeNumber || data.homeNumber),
            location: locationDetails.city || data.location ? `${locationDetails.city || ''}, ${locationDetails.region || ''}` : sanitize(data.location),

            // GPS
            latitude: validFloat(locationDetails.latitude ?? data.latitude),
            longitude: validFloat(locationDetails.longitude ?? data.longitude),

            // Optional Fields
            gender: sanitize(data.gender),
            medicalCondition: sanitize(data.medicalCondition),
            hasDisability: sanitize(data.hasDisability),
            disabilityType: sanitize(data.disabilityType),

            fanNumber: sanitize(data.fanNumber),
            username: sanitize(data.username),
            password: sanitize(data.password),

            appointmentRegion: sanitize(data.appointmentRegion),
            appointmentPlace: sanitize(data.appointmentPlace),
            appointmentTime: sanitize(data.appointmentTime),

            profilePicture: sanitize(data.profilePicture),

            lotteryId: data.lotteryId || generateLotteryId(),

            status: 'Active',
            totalDonations: 0,
            impactScore: 0,
        };

        // Log the exact data being passed to Prisma
        console.log('Donor Data to Create (Whitelisted):', JSON.stringify(donorData, null, 2));

        const donor = await prisma.donor.create({
            data: donorData,
        });

        res.status(201).json(mapDonorToFrontend(donor));
    } catch (error: any) {
        console.error('Register Donor Error:', error);
        if (error.code === 'P2002') {
            // Unique constraint failed
            const target = error.meta?.target;
            res.status(409).json({ message: `A user with this ${target ? target : 'information'} already exists.` });
            return;
        }
        // Improve default error message
        const message = error.message || 'Internal server error';
        res.status(500).json({ message: message });
    }
};

export const getDonors = async (req: Request, res: Response): Promise<void> => {
    try {
        const donors = await prisma.donor.findMany({
            orderBy: {
                fullName: 'asc'
            }
        });

        const mappedDonors = donors.map(mapDonorToFrontend);
        res.json(mappedDonors);
    } catch (error) {
        console.error("Get Donors Error", error);
        res.status(500).json({ message: 'Failed to fetch donors' });
    }
};

export const getDonorById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const donor = await prisma.donor.findUnique({
            where: { id }
        });
        if (!donor) {
            res.status(404).json({ message: 'Donor not found' });
            return;
        }
        res.json(mapDonorToFrontend(donor));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching donor' });
    }
};

export const updateDonor = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const data = req.body;
    delete data.id; // immutable

    // Remove complex nested objects if they cause issues, or flatten them
    if (data.locationDetails) {
        // Flatten logic if you want to update location via locationDetails object
        // ... (Similar to register logic, but for update)
        // For now, assuming frontend sends flat structure or we rely on partials
    }

    try {
        const updatedDonor = await prisma.donor.update({
            where: { id },
            data: {
                ...data,
                birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
                donationAppointmentDate: data.donationAppointmentDate ? new Date(data.donationAppointmentDate) : undefined,
                lastDonation: data.lastDonation ? new Date(data.lastDonation) : undefined,
                age: data.age ? parseInt(data.age) : undefined,
                totalDonations: data.totalDonations ? parseInt(data.totalDonations) : undefined,
                impactScore: data.impactScore ? parseInt(data.impactScore) : undefined,
                latitude: data.latitude ? parseFloat(data.latitude) : undefined,
                longitude: data.longitude ? parseFloat(data.longitude) : undefined,
            }
        });
        // @ts-ignore
        res.json(mapDonorToFrontend(updatedDonor));
    } catch (error: any) {
        console.error("Update Donor Error", error);
        res.status(500).json({ message: 'Failed to update donor' });
    }
};

export const deleteDonor = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.donor.delete({ where: { id } });
        res.json({ message: 'Donor deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
};
