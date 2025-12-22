import { Request, Response } from 'express';
import prisma from '../config/prisma';

// Helper to map DB Hospital to Frontend (handling locationDetails)
const mapHospitalToFrontend = (hospital: any) => {
    return {
        ...hospital,
        businessLicenseName: hospital.licenseName,
        businessLicenseNumber: hospital.licenseNumber,
        locationDetails: {
            region: hospital.region,
            city: hospital.city,
            subCity: hospital.subCity,
            woreda: hospital.woreda,
            kebele: hospital.kebele,
            street: hospital.street,
            homeNumber: hospital.homeNumber // Note: Schema calls it homeNumber, model might not have it or it's implicitly there.
        }
    };
};

export const getHospitals = async (req: Request, res: Response): Promise<void> => {
    try {
        const hospitals = await prisma.hospital.findMany();
        res.json(hospitals.map(mapHospitalToFrontend));
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch hospitals' });
    }
};

export const getHospitalById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const hospital = await prisma.hospital.findUnique({ where: { id } });
        if (!hospital) {
            res.status(404).json({ message: 'Hospital not found' });
            return;
        }
        res.json(mapHospitalToFrontend(hospital));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hospital details' });
    }
};

export const registerHospital = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        // Validation/Mapping
        const hospitalData = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            username: data.username,
            password: data.password,
            contactDoctorName: data.contactDoctorName,
            contactDoctorPhone: data.contactDoctorPhone,

            // Location Flattening
            region: data.locationDetails?.region || data.region,
            city: data.locationDetails?.city || data.city,
            subCity: data.locationDetails?.subCity || data.subCity,
            woreda: data.locationDetails?.woreda || data.woreda,
            kebele: data.locationDetails?.kebele || data.kebele,
            street: data.locationDetails?.street || data.street,
            location: data.location,

            latitude: data.latitude ? parseFloat(data.latitude) : null,
            longitude: data.longitude ? parseFloat(data.longitude) : null,

            licenseName: data.businessLicenseName,
            licenseNumber: data.businessLicenseNumber,
            hospitalType: data.hospitalType,
            profilePicture: data.profilePicture,
            status: 'Pending',
        };

        const newHospital = await prisma.hospital.create({
            data: hospitalData
        });
        res.status(201).json(mapHospitalToFrontend(newHospital));
    } catch (error: any) {
        console.error("Register Hospital Error", error);
        if (error.code === 'P2002') {
            res.status(409).json({ message: `A hospital with this ${error.meta?.target} already exists` });
            return;
        }
        res.status(500).json({ message: error.message || 'Registration failed' });
    }
};

export const updateHospital = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const data = req.body;

    // Remove immutable
    delete data.id;

    // Handle nested locationDetails updates if provided
    let flatLocation = {};
    if (data.locationDetails) {
        flatLocation = {
            region: data.locationDetails.region,
            city: data.locationDetails.city,
            subCity: data.locationDetails.subCity,
            woreda: data.locationDetails.woreda,
            kebele: data.locationDetails.kebele,
            street: data.locationDetails.street,
        };
        // We delete the nested object so Prisma doesn't complain about unknown arg
        delete data.locationDetails;
    }

    try {
        const updatedHospital = await prisma.hospital.update({
            where: { id },
            data: {
                ...data,
                ...flatLocation,
                latitude: data.latitude ? parseFloat(data.latitude) : undefined,
                longitude: data.longitude ? parseFloat(data.longitude) : undefined,
                // Remap license keys if they are coming in as businessLicense*
                licenseName: data.businessLicenseName || undefined,
                licenseNumber: data.businessLicenseNumber || undefined,
            }
        });
        res.json(mapHospitalToFrontend(updatedHospital));
    } catch (error: any) {
        console.error("Update Hospital Error", error);
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Hospital not found' });
            return;
        }
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
};

export const deleteHospital = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.hospital.delete({ where: { id } });
        res.json({ message: 'Hospital deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
};
