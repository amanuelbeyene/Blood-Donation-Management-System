
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

console.log(`Checking numbers for Account: ${accountSid}`);

const client = twilio(accountSid, authToken);

async function listNumbers() {
    try {
        const numbers = await client.incomingPhoneNumbers.list({ limit: 20 });
        if (numbers.length === 0) {
            console.log("No phone numbers found in this account.");
            console.log("Please buy a phone number in the Twilio Console.");
        } else {
            console.log("Found Phone Numbers:");
            numbers.forEach(n => console.log(`- ${n.phoneNumber} (${n.friendlyName})`));
        }
    } catch (error: any) {
        console.error("Error fetching numbers:", error.message);
    }
}

listNumbers();
