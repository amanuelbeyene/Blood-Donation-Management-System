
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER; // Should be +13802700882
const toNumber = '+251941417642'; // User's number

console.log('--- DETAILED SMS DIAGNOSIS ---');
console.log(`Using Account SID: ${accountSid?.substring(0, 6)}...`);
console.log(`From Number: ${fromNumber}`);
console.log(`To Number: ${toNumber}`);

if (!accountSid || !authToken || !fromNumber) {
    console.error('CRITICAL: Missing credentials in .env');
    process.exit(1);
}

const client = twilio(accountSid, authToken);

async function diagnose() {
    try {
        console.log('1. Attempting to send SMS...');
        const message = await client.messages.create({
            body: 'BDMS Test Message: Verification of Live Delivery.',
            from: fromNumber,
            to: toNumber
        });

        console.log('✅ SUCCESS!');
        console.log(`SID: ${message.sid}`);
        console.log(`Status: ${message.status}`);

        if (message.status === 'queued' || message.status === 'accepted') {
            console.log('NOTE: Message is QUEUED. If it does not arrive, check "Geo Permissions" in Twilio Console.');
        }
    } catch (error: any) {
        console.error('❌ FAILURE: Twilio returned an error.');
        console.error(`Code: ${error.code}`);
        console.error(`Message: ${error.message}`);

        if (error.code === 21408) {
            console.log('\n>>> DIAGNOSIS: Authorization Error.');
            console.log('You must enable SMS to Ethiopia (+251) in your Twilio Console > Messaging > Settings > Geo Permissions.');
        } else if (error.code === 21608) {
            console.log('\n>>> DIAGNOSIS: Trial Account Restriction.');
            console.log('If you are on a Trial, you must VERIFY the recipient number (+251...) in Twilio Console.');
        } else if (error.code === 20003) {
            console.log('\n>>> DIAGNOSIS: Auth Failure.');
            console.log('Your Account SID or Token is invalid. Check they match the "Live Credentials" exactly.');
        }
    }
}

diagnose();
