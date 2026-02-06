
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const testEmail = async () => {
    const logPath = path.join(process.cwd(), 'email-test-result.txt');
    try {
        console.log('Testing email configuration...');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.verify();

        fs.writeFileSync(logPath, 'SUCCESS: Connection established and authenticated.');
        console.log('SUCCESS');
    } catch (error: any) {
        const errorMsg = `ERROR: ${error.message}\nCode: ${error.code}\nCommand: ${error.command}\nResponse: ${error.response}`;
        fs.writeFileSync(logPath, errorMsg);
        console.error(errorMsg);
    }
};

testEmail();
