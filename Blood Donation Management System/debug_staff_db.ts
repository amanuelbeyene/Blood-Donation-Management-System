
import prisma from './server/config/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    const targetUsername = 'sintayehu';
    console.log(`Checking for user: "${targetUsername}"`);

    try {
        const user = await prisma.staff.findFirst({
            where: {
                OR: [
                    { email: targetUsername },
                    { username: targetUsername },
                    { phone: targetUsername }
                ]
            },
        });

        if (user) {
            console.log("User found in DB:");
            console.log(`- ID: ${user.id}`);
            console.log(`- Username: ${user.username}`);
            console.log(`- Role: ${user.role}`);
            console.log(`- Password Hash: ${user.password}`);

            // Test password '12345678'
            const isMatch = await bcrypt.compare('12345678', user.password);
            console.log(`Password '12345678' match result: ${isMatch}`);
        } else {
            console.log("User NOT found with that identifier.");
            // List all to see what's there
            const all = await prisma.staff.findMany();
            console.log("All staff usernames:", all.map(s => s.username));
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
