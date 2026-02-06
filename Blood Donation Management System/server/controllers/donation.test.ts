import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { getDonations } from './donationController';

// 1. Mock Prisma Client
vi.mock('../config/prisma', () => ({
    __esModule: true,
    default: mockDeep(),
}));

const prismaMock = prisma as unknown as ReturnType<typeof mockDeep>;

describe('Donation Controller', () => {
    beforeEach(() => {
        mockReset(prismaMock);
    });

    it('getDonations should return a list of donations', async () => {
        // Arrange
        const mockDonations = [
            {
                id: '1',
                donorId: 'd1',
                hospitalId: 'h1',
                units: 1,
                status: 'Completed',
                createdAt: new Date(),
                donor: { fullName: 'John Doe', bloodType: 'A+' },
                hospital: { name: 'City Hospital' }
            }
        ];

        // Mock the prisma response
        prismaMock.donation.findMany.mockResolvedValue(mockDonations as any);

        const req = {} as Request;
        const res = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        } as unknown as Response;

        // Act
        await getDonations(req, res);

        // Assert
        expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({
                id: '1',
                donorName: 'John Doe', // Check mapped field
                hospital: 'City Hospital' // Check mapped field
            })
        ]));
    });
});
