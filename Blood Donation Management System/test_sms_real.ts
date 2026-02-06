
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const myNumber = '+251941417642'; // The user's number

async function testRealSMS() {
    console.log('--- Testing Real SMS Configuration ---');
    console.log('Account SID:', accountSid ? 'Set' : 'Missing');
    console.log('Auth Token:', authToken ? 'Set' : 'Missing');
    console.log('Twilio Phone Number:', twilioPhoneNumber ? 'Set' : 'Missing');

    if (!accountSid || !authToken || !twilioPhoneNumber) {
        console.error('❌ ERROR: Missing Twilio credentials in .env file.');
        console.log('Please check your .env file and ensure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are set.');
        return;
    }

    const client = twilio(accountSid, authToken);

    try {
        console.log(`Attempting to send test SMS to ${myNumber}...`);
        const message = await client.messages.create({
            body: 'Hello from BDMS! This is a test of the Real SMS system.',
            from: twilioPhoneNumber,
            to: myNumber
        });
        console.log('✅ SUCCESS: SMS sent successfully!');
        console.log('Message SID:', message.sid);
    } catch (error: any) {
        console.error('❌ FAILED: Could not send SMS.');
        console.error('Error Details:', error.message);
        if (error.code === 21608) {
            console.log('👉 Tip: This is likely because you are on a Twilio Free Trial and have not verified the recipient number.');
        } else if (error.code === 20003) {
            console.log('👉 Tip: Your Account SID or Auth Token might be incorrect.');
        }
    }
}

testRealSMS();
