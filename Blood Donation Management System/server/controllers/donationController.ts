import { Request, Response } from 'express';
import prisma from '../config/prisma';

const mapDonationToFrontend = (d: any) => ({
    ...d,
    donorName: d.donor?.fullName,
    hospital: d.hospital?.name,
    bloodType: d.donor?.bloodType,
});

export const getDonations = async (req: Request, res: Response): Promise<void> => {
    try {
        const donations = await prisma.donation.findMany({
            include: { donor: true, hospital: true },
            orderBy: { donationDate: 'desc' }
        });
        res.json(donations.map(mapDonationToFrontend));
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch donations' });
    }
};

export const createDonation = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        const newDonation = await prisma.donation.create({
            data: {
                donorId: data.donorId,
                hospitalId: data.hospitalId,
                units: parseInt(data.units),
                status: data.status || 'in-progress'
            },
            include: { donor: true, hospital: true }
        });
        res.status(201).json(mapDonationToFrontend(newDonation));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to log donation' });
    }
};

export const updateDonation = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status, units } = req.body;
    try {
        const updated = await prisma.donation.update({
            where: { id },
            data: {
                status,
                units: units ? parseInt(units) : undefined
            },
            include: { donor: true, hospital: true }
        });
        res.json(mapDonationToFrontend(updated));
    } catch (error) {
        res.status(500).json({ message: 'Update failed' });
    }
};

export const recordTestResult = async (req: Request, res: Response): Promise<void> => {
    const { donorId, testResult, failureReason } = req.body;

    try {
        const result = await prisma.$transaction(async (prisma) => {
            const donor = await prisma.donor.findUnique({ where: { id: donorId } });
            if (!donor) throw new Error('Donor not found');

            if (testResult === 'Pass') {
                // Update availability to indicate test passed
                await prisma.donor.update({
                    where: { id: donorId },
                    data: { availability: 'Passed_Test' }
                });
                return { status: 'Passed' };
            } else {
                // Failed Test
                // Needs a hospital to link the rejection record because Schema requires hospitalId
                const defaultHospital = await prisma.hospital.findFirst();

                // Fallback: If no hospital exists (rare), we might fail. 
                // But usually there is at least one hospital.
                if (!defaultHospital) throw new Error('System Error: No Hospital record found to link rejection.');

                // Log rejected donation 
                await prisma.donation.create({
                    data: {
                        donorId: donor.id,
                        hospitalId: defaultHospital.id,
                        units: 0,
                        status: 'Rejected',
                        donationDate: new Date()
                    }
                });

                // Update availability to Failed_Test and save reason, but KEEP appointment
                await prisma.donor.update({
                    where: { id: donor.id },
                    data: {
                        availability: 'Failed_Test',
                        rejectionReason: failureReason
                    }
                });

                return { status: 'Rejected' };
            }
        });

        res.json(result);
    } catch (error: any) {
        console.error("Record Test Result Error", error);
        res.status(500).json({ message: error.message || 'Failed to record test result' });
    }
};

export const completeDonation = async (req: Request, res: Response): Promise<void> => {
    const { donorId, units = 1 } = req.body;

    try {
        const result = await prisma.$transaction(async (prisma) => {
            const donor = await prisma.donor.findUnique({ where: { id: donorId } });
            if (!donor) throw new Error('Donor not found');

            // Find valid hospital for record
            const defaultHospital = await prisma.hospital.findFirst();
            if (!defaultHospital) throw new Error('System Error: No Hospital record found.');

            // 1. Update Inventory
            const inventoryItem = await prisma.inventory.findFirst({ where: { bloodType: donor.bloodType } });

            if (inventoryItem) {
                await prisma.inventory.update({
                    where: { id: inventoryItem.id },
                    data: { unitsAvailable: { increment: units } }
                });
            } else {
                // If inventory record doesn't exist, create it
                await prisma.inventory.create({
                    data: {
                        bloodType: donor.bloodType,
                        unitsAvailable: units,
                        criticalThreshold: 10 // Default critical threshold
                    }
                });
            }

            // 2. Create Donation Record
            const newDonation = await prisma.donation.create({
                data: {
                    donorId: donor.id,
                    hospitalId: defaultHospital.id,
                    units: units,
                    status: 'Completed',
                    donationDate: new Date()
                }
            });

            // 3. Update Donor Stats (Keep appointment details to show in list)
            await prisma.donor.update({
                where: { id: donor.id },
                data: {
                    totalDonations: { increment: 1 },
                    lastDonation: new Date(),
                    // Do NOT clear appointment details yet
                    availability: 'resting'
                }
            });

            return { status: 'Success', donation: newDonation };
        });

        res.json(result);
    } catch (error: any) {
        console.error("Complete Donation Error", error);
        res.status(500).json({ message: error.message || 'Failed to complete donation' });
    }
};

export const resetTestStatus = async (req: Request, res: Response): Promise<void> => {
    const { donorId } = req.body;

    try {
        const result = await prisma.donor.update({
            where: { id: donorId },
            data: {
                availability: 'ready'
            }
        });
        res.json({ status: 'Reset', donor: result });
    } catch (error: any) {
        console.error("Reset Test Status Error", error);
        res.status(500).json({ message: error.message || 'Failed to reset test status' });
    }
};

export const removeAppointment = async (req: Request, res: Response): Promise<void> => {
    const { donorId } = req.body;

    try {
        await prisma.donor.update({
            where: { id: donorId },
            data: {
                donationAppointmentDate: null,
                appointmentTime: null,
                appointmentPlace: null,
                appointmentRegion: null,
                // If they haven't donated, reset availability to ready? 
                // If they donated, keep resting.
                // Safest to just clear appointment fields.
            }
        });
        res.json({ status: 'Removed' });
    } catch (error: any) {
        console.error("Remove Appointment Error", error);
        res.status(500).json({ message: error.message || 'Failed to remove appointment' });
    }
};
