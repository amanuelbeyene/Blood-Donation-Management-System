import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export const sendSMS = async (to: string, message: string): Promise<{ success: boolean; method: 'REAL' | 'MOCK'; error?: string }> => {
    // If Twilio is configured, try sending real SMS
    if (client && twilioPhoneNumber) {
        try {
            console.log(`[SMS] Sending real SMS to ${to}...`);
            await client.messages.create({
                body: message,
                from: twilioPhoneNumber,
                to: to
            });
            console.log(`[SMS] SMS sent successfully to ${to}`);
            return { success: true, method: 'REAL' };
        } catch (error: any) {
            console.error('[SMS] Failed to send real SMS via Twilio (Primary):', error.code, error.message);

            // Error 21606: Phone number not capable of sending to this destination (e.g. US Toll-Free to Ethiopia)
            // Error 21408: Permission to send SMS has not been enabled for the region
            if (error.code === 21606 || error.code === 21408) {
                try {
                    console.log('[SMS] Retrying with Alphanumeric Sender ID "BDMS"...');
                    await client.messages.create({
                        body: message,
                        from: 'BDMS', // Alphanumeric Sender ID
                        to: to
                    });
                    console.log(`[SMS] Retry successful with Sender ID "BDMS"`);
                    return { success: true, method: 'REAL' };
                } catch (retryError: any) {
                    console.error('[SMS] Retry failed:', retryError.message);
                    // Final Fallback: Return success=true but method=MOCK to allow UI to show "Simulated" warning
                    // This prevents locking the user out of the flow if they haven't upgraded their account yet.
                    console.log('[SMS] Fatal error sending real SMS. Falling back to MOCK simulation.');
                    return { success: true, method: 'MOCK' };
                }
            }

            // For other errors, also fallback to mock to keep the app usable during demo
            console.log('[SMS] Error encountered. Falling back to MOCK simulation.');
            return { success: true, method: 'MOCK' };
        }
    }

    // Mock SMS Service (Fallback)
    console.log('================================================');
    console.log(`[MOCK SMS] To: ${to}`);
    console.log(`[MOCK SMS] Message: ${message}`);
    console.log(`[MOCK SMS] NOTE: Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env to send real SMS.`);
    console.log('================================================');
    return Promise.resolve({ success: true, method: 'MOCK' });
};
