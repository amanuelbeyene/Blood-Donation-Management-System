import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { generateCustomId } from '../utils/idGenerator';

import { createNotification } from './notificationController';
import fs from 'fs';
import path from 'path';

const logDebug = (msg: string) => {
    const logPath = path.join(__dirname, '../debug.log');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
};

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
            age: validInt(data.age),
            weight: (data.weight !== undefined && data.weight !== null && data.weight !== '') ? String(data.weight) : undefined,

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
            hasDisability: data.hasDisability !== undefined && data.hasDisability !== null ? String(data.hasDisability) : undefined,
            disabilityType: sanitize(data.disabilityType),

            maritalStatus: (data.maritalStatus !== undefined && data.maritalStatus !== null && data.maritalStatus !== '') ? String(data.maritalStatus) : undefined,

            fanNumber: sanitize(data.fanNumber),
            username: sanitize(data.username),
            password: sanitize(data.password),

            appointmentRegion: sanitize(data.appointmentRegion),
            appointmentPlace: sanitize(data.appointmentPlace),
            appointmentTime: sanitize(data.appointmentTime),

            profilePicture: sanitize(data.profilePicture),

            lotteryId: data.lotteryId || generateLotteryId(),
            status: 'Pending',
            source: req.headers.authorization ? 'Staff' : 'Self', // Track registration source
            totalDonations: 0,
            impactScore: 0,
        };

        // Hash Password
        if (donorData.password) {
            const salt = await bcrypt.genSalt(10);
            donorData.password = await bcrypt.hash(donorData.password, salt);
        }

        // Generate Custom ID
        const customId = await generateCustomId('donor', 'D');

        console.log('Donor Data to Create (Whitelisted):', JSON.stringify(donorData, null, 2));

        const donor = await prisma.donor.create({
            data: {
                ...donorData,
                id: customId
            },
        });

        // NOTIFICATION LOGIC
        try {
            // Create Notification
            logDebug('Creating DONOR_REGISTER notification...');
            await prisma.notification.create({
                data: {
                    type: 'DONOR_REGISTER',
                    message: `Approve Waiting Donor: ${donor.fullName}`,
                    isRead: false,
                    forRole: 'admin',
                    relatedId: donor.id
                }
            });
            logDebug('DONOR_REGISTER notification created.');

            // Check if Staff registered this AND send SECOND notification
            if (req.headers.authorization) {
                const token = req.headers.authorization.split(' ')[1];
                logDebug(`Authorization header found. Token: ${token}`);

                const id = token.replace('mock-jwt-token-', '');
                logDebug(`Extracted ID: ${id}`);

                // Try to find staff
                const staff = await prisma.staff.findUnique({ where: { id: id } });
                if (staff) {
                    logDebug(`Staff found: ${staff.fullName}. Creating STAFF_ADD_DONOR notification...`);
                    await prisma.notification.create({
                        data: {
                            type: 'STAFF_ADD_DONOR',
                            message: `Staff ${staff.fullName} Added Donor: ${donor.fullName}`,
                            isRead: false,
                            forRole: 'admin',
                            relatedId: id
                        }
                    });
                    logDebug('STAFF_ADD_DONOR notification created.');
                } else {
                    logDebug('Staff NOT found with that ID. Checking Admin...');
                    const admin = await prisma.admin.findUnique({ where: { id: id } });

                    if (admin) {
                        // Optional: If Admin added it, maybe we want an Admin notification too?
                        // For now, just log it.
                        logDebug(`User was ADMIN: ${admin.fullName}. No 'Staff Add' notification sent.`);
                    } else {
                        logDebug('User not found in Staff or Admin tables.');
                    }
                }
            } else {
                logDebug('No Authorization header found.');
            }
        } catch (notifError) {
            console.error('Failed to create notification for new donor:', notifError);
        }

        // Admin Activity Log (If registered by Admin/Staff)
        if (req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                if (token) {
                    const adminId = token.replace('mock-jwt-token-', '');
                    // Basic check - in real app, decode token
                    let admin = await prisma.admin.findUnique({ where: { id: adminId } });
                    // Fallback
                    if (!admin && (adminId === 'admin' || adminId === 'temp-admin')) {
                        admin = await prisma.admin.findUnique({ where: { id: 'SA0000001' } });
                    }

                    if (admin) {
                        await prisma.adminActivityLog.create({
                            data: {
                                adminId: admin.id,
                                actionType: 'CREATE_DONOR',
                                targetId: donor.id,
                                targetName: donor.fullName,
                                details: 'New Donor Registration'
                            }
                        });
                    }
                }
            } catch (logEx) {
                console.error("Log error", logEx);
            }
        }


        res.status(201).json(mapDonorToFrontend(donor));
    } catch (error: any) {
        console.error('Register Donor Error:', error);
        if (error.code === 'P2002') {
            // Unique constraint failed
            const target = error.meta?.target;
            res.status(409).json({ message: `A user with this ${target ? (Array.isArray(target) ? target.join(', ') : target) : 'information'} already exists.` });
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

// Helper functions for consistent parsing
const validDate = (d: any) => {
    if (!d) return undefined;
    const date = new Date(d);
    return isNaN(date.getTime()) ? undefined : date;
};

const validInt = (d: any) => {
    if (d === undefined || d === null || d === '') return undefined;
    const i = parseInt(d, 10);
    return isNaN(i) ? undefined : i;
};

const validFloat = (d: any) => {
    if (d === undefined || d === null || d === '') return undefined;
    const f = parseFloat(d);
    return isNaN(f) ? undefined : f;
};

export const updateDonor = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const data = req.body;

    const sanitize = (val: any) => (val === '' || val === 'null' || val === 'undefined') ? undefined : val;
    const locationDetails = data.locationDetails || {};

    const updates: any = {
        fullName: data.fullName, // Required by schema if created, but update can skip if not present in payload logic below (but we whitelist)
        email: data.email,
        phone: data.phone,
        bloodType: data.bloodType,

        age: validInt(data.age),
        // Explicitly handle weight and maritalStatus to ensure they are passed if present
        weight: (data.weight !== undefined && data.weight !== null && data.weight !== '') ? String(data.weight) : undefined,
        gender: sanitize(data.gender),
        maritalStatus: (data.maritalStatus !== undefined && data.maritalStatus !== null && data.maritalStatus !== '') ? String(data.maritalStatus) : undefined,
        fanNumber: sanitize(data.fanNumber),

        idCardFront: sanitize(data.idCardFront),
        idCardBack: sanitize(data.idCardBack),

        medicalCondition: sanitize(data.medicalCondition),
        hasDisability: data.hasDisability !== undefined && data.hasDisability !== null ? String(data.hasDisability) : undefined,
        disabilityType: sanitize(data.disabilityType),

        region: sanitize(locationDetails.region || data.region),
        city: sanitize(locationDetails.city || data.city),
        subCity: sanitize(locationDetails.subCity || data.subCity),
        woreda: sanitize(locationDetails.woreda || data.woreda),
        kebele: sanitize(locationDetails.kebele || data.kebele),
        street: sanitize(locationDetails.street || data.street),
        homeNumber: sanitize(locationDetails.homeNumber || data.homeNumber),
        location: sanitize(data.location),

        latitude: validFloat(locationDetails.latitude ?? data.latitude),
        longitude: validFloat(locationDetails.longitude ?? data.longitude),

        birthDate: validDate(data.birthDate),
        donationAppointmentDate: validDate(data.donationAppointmentDate),
        lastDonation: validDate(data.lastDonation),
        totalDonations: validInt(data.totalDonations),
        impactScore: validInt(data.impactScore),

        appointmentRegion: sanitize(data.appointmentRegion),
        appointmentPlace: sanitize(data.appointmentPlace),
        appointmentTime: sanitize(data.appointmentTime),

        username: sanitize(data.username),
        profilePicture: sanitize(data.profilePicture),
        status: sanitize(data.status),
        rejectionReason: sanitize(data.rejectionReason),
    };

    // Remove undefined keys
    Object.keys(updates).forEach(key => {
        if (updates[key] === undefined) delete updates[key];
    });

    // Debug Logging
    console.log(`[UpdateDonor] ID: ${id}`);
    console.log(`[UpdateDonor] Payload:`, JSON.stringify(data, null, 2));
    console.log(`[UpdateDonor] Generated Updates:`, JSON.stringify(updates, null, 2));

    try {
        const updatedDonor = await prisma.donor.update({
            where: { id },
            data: updates
        });
        console.log(`[UpdateDonor] Success. Updated:`, JSON.stringify(updatedDonor, null, 2));

        // Password Change Logic
        if (data.newPassword && data.currentPassword) {
            // Self-Service Change: Verify current password
            const currentDonor = await prisma.donor.findUnique({ where: { id } });
            if (!currentDonor || !currentDonor.password) {
                res.status(400).json({ message: 'Donor not found or password not set' });
                return;
            }

            const isMatch = await bcrypt.compare(data.currentPassword, currentDonor.password);
            if (!isMatch) {
                res.status(400).json({ message: 'Incorrect current password' });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.newPassword, salt);
            await prisma.donor.update({
                where: { id },
                data: { password: hashedPassword }
            });
        } else if (data.password) {
            // Admin Override or Direct Update (if no currentPassword enforcement required)
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.password, salt);
            await prisma.donor.update({
                where: { id },
                data: { password: hashedPassword }
            });
        }

        // Admin Activity Logging (Simplified for robustness)
        if (req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                if (token && (data.status === 'Active' || data.status === 'Rejected')) {
                    const adminId = token.replace('mock-jwt-token-', '');
                    // We skip the complex lookup here to limit potential errors, or keep it if trusted
                    // Keeping it minimal:
                    let admin = await prisma.admin.findUnique({ where: { id: adminId } });
                    // Fallback for demo
                    if (!admin && (adminId === 'admin' || adminId === 'temp-admin')) {
                        admin = await prisma.admin.findUnique({ where: { id: 'SA0000001' } });
                    }

                    if (admin) {
                        const actionType = data.status === 'Active' ? 'APPROVE_DONOR' : 'REJECT_DONOR';
                        await prisma.adminActivityLog.create({
                            data: {
                                adminId: admin.id,
                                actionType: actionType,
                                targetId: id,
                                targetName: updates.fullName || 'Unknown',
                                details: data.status === 'Rejected' ? data.rejectionReason : 'Approved'
                            }
                        });



                        // NOTIFY STAFF
                        await createNotification(
                            `Admin ${admin.fullName} ${data.status === 'Active' ? 'approved' : 'rejected'} donor ${updates.fullName || 'Unknown'}`,
                            actionType,
                            id,
                            'staff'
                        );
                    }
                }
                // Check for Staff Update
                else if (token && !data.status) { // If status didn't change (likely edit details)
                    const staffId = token.replace('mock-jwt-token-', '');
                    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
                    if (staff) {
                        await createNotification(
                            `Staff ${staff.fullName} updated details for Donor: ${updates.fullName || 'Unknown'}`,
                            'STAFF_EDIT_DONOR',
                            staffId // Link to Staff for highlighting
                        );
                    }
                }
            } catch (logEx) {
                console.error("Log Error (Non-fatal):", logEx);
            }
        }

        const finalDonor = await prisma.donor.findUnique({ where: { id } });
        res.json(mapDonorToFrontend(finalDonor));
    } catch (error: any) {
        console.error("Update Donor Error:", error);
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Donor not found (P2025)' });
            return;
        }
        if (error.code === 'P2002') {
            res.status(409).json({ message: 'Email, Phone, or Username already exists' });
            return;
        }
        const errorMessage = error.message?.length > 200 ? error.message.substring(0, 200) + '...' : error.message;
        res.status(500).json({ message: 'Failed to update donor: ' + errorMessage });
    }
};


export const deleteDonor = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        // Cascade delete related records (Donations) manually since schema doesn't cascade
        await prisma.donation.deleteMany({ where: { donorId: id } });

        await prisma.donor.delete({ where: { id } });

        // Notification for Staff Delete
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            const staffId = token.replace('mock-jwt-token-', '');
            const staff = await prisma.staff.findUnique({ where: { id: staffId } });
            if (staff) {
                await createNotification(
                    `Staff ${staff.fullName} deleted Donor record`,
                    'STAFF_DELETE_DONOR',
                    staffId // Link to Staff
                );
            }
        }
        res.json({ message: 'Donor deleted' });
    } catch (error: any) {
        console.error("Delete Donor Error:", error);
        res.status(500).json({ message: 'Delete failed: ' + error.message });
    }
};

export const notifyDonor = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { type } = req.body;

    try {
        const donor = await prisma.donor.findUnique({ where: { id } });
        if (!donor) {
            res.status(404).json({ message: 'Donor not found' });
            return;
        }

        if (type === 'appointment_reminder') {
            if (!donor.donationAppointmentDate || !donor.appointmentTime) {
                res.status(400).json({ message: 'Donor has no appointment scheduled' });
                return;
            }

            const dateStr = new Date(donor.donationAppointmentDate).toLocaleDateString();
            const timeStr = donor.appointmentTime;
            const hospitalName = donor.appointmentPlace || 'Blood Bank';

            // Construct the custom message
            const message = `ሰላም ጤና ይስጥልን ውድ ደም ለጋሽ፣ ደም መለገሻ ቀንዎ ${dateStr} እና ሰዓትዎ ${timeStr} ስለሆነ በዚህ ቀን ${hospitalName} ሆስፒታል መጠው ደም እንዲለግሱ ስንል በአክብሮት እንጠይቃለን ፡፡\n\nHello, dear blood donor, your blood donation day is ${dateStr} and your time is ${timeStr}, so we respectfully request you to donate blood at the ${hospitalName} hospital on this day.`;

            // 1. Send SMS
            const { sendSMS } = await import('../utils/smsService');
            const smsResult = await sendSMS(donor.phone, message);

            // 2. Send Email
            let emailResult = { success: false, error: '' };
            if (donor.email) {
                try {
                    const { sendEmail } = await import('../utils/emailService');

                    const amharicPart = message.split('\n\n')[0];
                    const englishPart = message.split('\n\n')[1];

                    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
  .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #eee; }
  .header { background: #DC2626; padding: 20px; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
  .content { padding: 30px; }
  .message-box { background: #f8fafc; border-left: 4px solid #DC2626; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
  .amharic { font-size: 16px; margin-bottom: 20px; color: #1e293b; }
  .english { font-size: 15px; color: #334155; }
  .footer { background: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; }
  .highlight { font-weight: bold; color: #DC2626; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Blood Donation Reminder</h1>
    </div>
    <div class="content">
      <div class="amharic">
        <p>${amharicPart.replace(dateStr, `<span class="highlight">${dateStr}</span>`).replace(timeStr, `<span class="highlight">${timeStr}</span>`).replace(new RegExp(hospitalName.trim(), 'gi'), `<span class="highlight">${hospitalName}</span>`)}</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <div class="english">
        <p>${englishPart.replace(dateStr, `<span class="highlight">${dateStr}</span>`).replace(timeStr, `<span class="highlight">${timeStr}</span>`).replace(new RegExp(hospitalName.trim(), 'gi'), `<span class="highlight">${hospitalName}</span>`)}</p>
      </div>
    </div>
    <div class="footer">
      <p>BDMS Ethiopia - Saving Lives<br/>
      This is an automated message, please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
`;

                    await sendEmail({
                        to: donor.email,
                        subject: '📅 Blood Donation Appointment / የቀጠሮ ማስታወሻ',
                        html: emailHtml,
                        text: message
                    });
                    emailResult.success = true;
                } catch (err: any) {
                    console.error("Failed to send email:", err);
                    emailResult.error = err.message;
                }
            }

            // 3. Create In-App Notification
            try {
                await createNotification(
                    `Appointment Reminder: ${dateStr} at ${timeStr} - ${hospitalName}`,
                    'APPOINTMENT_REMINDER',
                    donor.id, // Related ID
                    undefined, // Role (not needed if userId is present)
                    donor.id   // User ID
                );
            } catch (error) {
                console.error("Failed to create in-app notification", error);
            }

            if (smsResult.method === 'MOCK' && !emailResult.success) {
                res.status(200).json({ message: 'SMS Simulated, Email Failed/Skipped', isMock: true });
                return;
            }

            if (!smsResult.success && !emailResult.success) {
                res.status(500).json({ message: `Failed to notify: SMS(${smsResult.error})` });
                return;
            }

            res.json({
                message: 'Notification Sent Successfully',
                details: {
                    sms: smsResult.success ? 'Sent' : 'Failed',
                    email: emailResult.success ? 'Sent' : (donor.email ? 'Failed' : 'No Email')
                }
            });
            return;
        }

        if (type === 'donation_completed') {
            const hospitalName = donor.appointmentPlace || 'Hospital';

            // Bilingual Thank You Message
            const amharicMsg = `"${donor.fullName}" የደም ልገሳዎ በተሳካ ሁኔታ በ "${hospitalName}" ተፈፅሞል, የርሶ ደም ለሌሎች ሂዎት ነው. እናመሰግናለን !!!`;
            const englishMsg = `"${donor.fullName}" Your blood donation has been successfully completed by "${hospitalName}", your blood is life for others. Thank you!!!`;

            const message = `${amharicMsg}\n\n${englishMsg}`;

            // 1. Send SMS
            const { sendSMS } = await import('../utils/smsService');
            const smsResult = await sendSMS(donor.phone, message);

            // 2. Send Email
            let emailResult = { success: false, error: '' };
            if (donor.email) {
                try {
                    const { sendEmail } = await import('../utils/emailService');

                    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
  .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #eee; }
  .header { background: #16a34a; padding: 20px; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
  .content { padding: 30px; }
  .amharic { font-size: 16px; margin-bottom: 20px; color: #1e293b; font-weight: 500; }
  .english { font-size: 15px; color: #334155; font-weight: 500; }
  .footer { background: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; }
  .highlight { font-weight: bold; color: #16a34a; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Donation Completed / ልገሳው ተሳክቷል</h1>
    </div>
    <div class="content">
      <div class="amharic">
        <p>${amharicMsg.replace(donor.fullName, `<span class="highlight">${donor.fullName}</span>`).replace(new RegExp(hospitalName.trim(), 'gi'), `<span class="highlight">${hospitalName}</span>`)}</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <div class="english">
        <p>${englishMsg.replace(donor.fullName, `<span class="highlight">${donor.fullName}</span>`).replace(new RegExp(hospitalName.trim(), 'gi'), `<span class="highlight">${hospitalName}</span>`)}</p>
      </div>
    </div>
    <div class="footer">
      <p>BDMS Ethiopia - Saving Lives<br/>
      Your contribution makes a difference!</p>
    </div>
  </div>
</body>
</html>
`;

                    await sendEmail({
                        to: donor.email,
                        subject: '✅ Blood Donation Completed / የደም ልገሳው ተሳክቷል',
                        html: emailHtml,
                        text: message
                    });
                    emailResult.success = true;
                } catch (err: any) {
                    console.error("Failed to send email:", err);
                    emailResult.error = err.message;
                }
            }

            // 3. Create In-App Notification
            try {
                await createNotification(
                    `Donation Completed at ${hospitalName}. Thank you for saving lives!`,
                    'DONATION_COMPLETED', // New Type, might need to handle on frontend icon/redirect if distinct
                    donor.id,
                    undefined,
                    donor.id
                );
            } catch (error) {
                console.error("Failed to create in-app notification", error);
            }

            if (smsResult.method === 'MOCK' && !emailResult.success) {
                res.status(200).json({ message: 'SMS Simulated, Email Failed/Skipped', isMock: true });
                return;
            }

            if (!smsResult.success && !emailResult.success) {
                res.status(500).json({ message: `Failed to notify: SMS(${smsResult.error})` });
                return;
            }

            res.json({
                message: 'Thank You Notification Sent Successfully',
                details: {
                    sms: smsResult.success ? 'Sent' : 'Failed',
                    email: emailResult.success ? 'Sent' : (donor.email ? 'Failed' : 'No Email')
                }
            });
            return;
        }

        if (type === 'hospital_request') {
            console.log("Processing hospital_request notification...");

            // Verify Sender is a Hospital
            if (!req.headers.authorization) {
                console.log("No Authorization header found");
                res.status(401).json({ message: 'Unauthorized: Hospital login required' });
                return;
            }

            const tokenHeader = req.headers.authorization;
            console.log("Auth Header:", tokenHeader);

            const token = tokenHeader.split(' ')[1];
            const hospitalId = token.replace('mock-jwt-token-', '');
            console.log("Extracted Hospital ID:", hospitalId);

            const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });
            console.log("Hospital Lookup Result:", hospital ? "Found" : "Not Found");

            if (!hospital) {
                res.status(403).json({ message: 'Only registered hospitals can send this notification' });
                return;
            }

            // Construct Message (Bilingual)
            const amharicMsg = `ጤና ይስጥልን, እርሶ ባሉበት አካባቢ የደም ልገሳ ስለሚያስፈልገን በዚ ሆስፒታል "${hospital.name}" መተው እንዲለግሱን እና የሰው ሂዎት እንዲታደጉ በትህትና አንተይቃለን :: የርሶ ደም ለሌሎች ሂዎት ነው !!!`;
            const englishMsg = `Please help us, we need blood donations in your area, so we humbly ask you to donate to this "${hospital.name}" hospital and save lives. Your blood is the life of others!!!`;

            const message = `${amharicMsg}\n-------------------------------------------------\n${englishMsg}`;

            // 1. Send SMS
            const { sendSMS } = await import('../utils/smsService');
            const smsResult = await sendSMS(donor.phone, message);

            // 2. Send Email
            let emailResult = { success: false, error: '' };
            if (donor.email) {
                try {
                    const { sendEmail } = await import('../utils/emailService');

                    // Professional HTML Email Template
                    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
  .email-container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px 20px; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
  .content { padding: 40px 30px; color: #334155; }
  .alert-icon { font-size: 40px; margin-bottom: 20px; display: block; text-align: center; }
  .title { text-align: center; font-size: 20px; font-weight: 700; color: #dc2626; margin-bottom: 30px; line-height: 1.4; border-bottom: 2px solid #fee2e2; padding-bottom: 20px; }
  .message-box { background-color: #fff1f2; border-left: 5px solid #dc2626; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0; }
  .message-text { font-size: 16px; line-height: 1.8; margin: 0; }
  .amharic { font-family: 'Nyala', 'Kalinga', 'Daedra', sans-serif; font-weight: 500; }
  .divider { height: 1px; background-color: #e2e8f0; margin: 30px 0; border: none; }
  .hospital-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin-top: 30px; }
  .hospital-name { font-weight: 700; font-size: 18px; color: #0f172a; margin-bottom: 5px; }
  .hospital-phone { color: #dc2626; font-weight: 600; font-size: 18px; text-decoration: none; }
  .footer { background-color: #1e293b; color: #94a3b8; text-align: center; padding: 20px; font-size: 12px; }
  .footer p { margin: 5px 0; }
</style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>BDMS Ethiopia</h1>
    </div>
    <div class="content">
      <div class="title">
        🩸 Urgent Blood Donation Request<br>
        <span class="amharic">የደም ልገሳ ጥሪ</span>
      </div>

      <!-- Amharic Section -->
      <div class="message-box">
        <p class="message-text amharic">${amharicMsg}</p>
      </div>

      <hr class="divider">

      <!-- English Section -->
      <div class="message-box" style="background-color: #f0f9ff; border-left-color: #0284c7;">
        <p class="message-text">${englishMsg}</p>
      </div>

      <!-- Contact Section -->
      <div class="hospital-card">
        <div style="font-size: 12px; text-transform: uppercase; color: #64748b; margin-bottom: 5px;">Visit Hospital / ወደ ሆስፒታል ይምጡ</div>
        <div class="hospital-name">${hospital.name}</div>
        <div style="margin-top: 10px;">
          <span style="color: #64748b; font-size: 14px;">Contact / ይደውሉ: </span>
          <a href="tel:${hospital.phone}" class="hospital-phone">${hospital.phone}</a>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>Blood Donation Management System</p>
      <p>Saving Lives Together - የርሶ ደም ለሌሎች ሂዎት ነው</p>
    </div>
  </div>
</body>
</html>
`;

                    await sendEmail({
                        to: donor.email,
                        subject: `🚨 Urgent: Blood Needed at ${hospital.name}`,
                        html: emailHtml,
                        text: message
                    });
                    emailResult.success = true;
                } catch (err: any) {
                    console.error("Failed to send email:", err);
                    emailResult.error = err.message;
                }
            }

            // 3. In-App Notification
            try {
                await createNotification(
                    `URGENT: ${hospital.name} needs your help! / ${hospital.name} የርሶን እርዳታ ይፈልጋል!`,
                    'BLOOD_REQUEST',
                    donor.id,
                    undefined,
                    donor.id
                );
            } catch (error) {
                console.error("Failed to create in-app notification", error);
            }

            res.json({
                message: 'Request Sent',
                details: {
                    sms: smsResult.success ? 'Sent' : 'Failed',
                    email: emailResult.success ? 'Sent' : 'Failed'
                }
            });
            return;
        }

        res.status(400).json({ message: 'Invalid notification type' });

    } catch (error) {
        console.error('Notify Donor Error:', error);
        res.status(500).json({ message: 'Failed to notify donor' });
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
            }
        });

        // Notification for Staff Remove Appt
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            const staffId = token.replace('mock-jwt-token-', '');
            const staff = await prisma.staff.findUnique({ where: { id: staffId } });
            if (staff) {
                await createNotification(
                    `Staff ${staff.fullName} removed appointment for Donor ${donorId}`,
                    'STAFF_REMOVE_APPT',
                    staffId
                );
            }
        }

        res.json({ status: 'Removed' });
    } catch (error: any) {
        console.error("Remove Appointment Error", error);
        res.status(500).json({ message: error.message || 'Failed to remove appointment' });
    }
};
