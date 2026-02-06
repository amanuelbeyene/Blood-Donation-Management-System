import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generates a custom ID in the format "0000001".
 * @param model The Prisma model name (lowercase) to query against (e.g., 'donor', 'admin', 'hospital').
 * @param prefix Optional prefix (e.g., "DNR" -> "DNR000001"). Default is empty string for pure numbers.
 */
export const generateCustomId = async (model: 'donor' | 'hospital' | 'admin' | 'request' | 'donation' | 'inventory' | 'staff', prefix: string = ''): Promise<string> => {
    try {
        // We need to access the model dynamically. PrismaClient models are usually camelCase properties on the client instance.
        // e.g. prisma.donor, prisma.hospital
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prismaModel = (prisma as any)[model];

        if (!prismaModel) {
            throw new Error(`Model '${model}' not found in Prisma Client`);
        }

        const lastRecord = await prismaModel.findFirst({
            where: {
                id: { startsWith: prefix }
            },
            orderBy: { id: 'desc' },
            take: 1
        });

        let nextIdNumber = 1;

        if (lastRecord && lastRecord.id) {
            // Extract all digits from the ID
            const digits = lastRecord.id.replace(/\D/g, '');

            if (digits && digits.length > 0) {
                nextIdNumber = parseInt(digits, 10) + 1;
            }
        }

        // Pad with zeros to length 7. If nextIdNumber is 1, result is "0000001"
        const paddedNumber = nextIdNumber.toString().padStart(7, '0');

        return `${prefix}${paddedNumber}`;
    } catch (error) {
        console.error(`Error generating custom ID for ${model}:`, error);
        // Fallback to timestamp if generation fails relative to DB (should rely on database transaction in prod)
        return `${prefix}${Date.now().toString().slice(-7)}`;
    }
};
