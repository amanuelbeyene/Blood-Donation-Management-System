
import prisma from './server/config/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    const targetUsername = 'sintayehu';
    console.log(`Resetting password for: "${targetUsername}"`);

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('12345678', salt);

        await prisma.staff.update({
            where: { username: targetUsername },
            data: { password: hashedPassword }
        });

        console.log("Password reset successfully to '12345678'");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
