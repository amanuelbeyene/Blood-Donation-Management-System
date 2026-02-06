import { describe, it, expect } from 'vitest';

// Simple smoke test to verify Vitest is working
describe('Inventory Logic Smoke Test', () => {
    it('should correctly calculate remaining stock', () => {
        const currentStock = 100;
        const expiredUnits = 15;
        const remaining = currentStock - expiredUnits;
        expect(remaining).toBe(85);
    });

    it('should not allow negative stock', () => {
        const currentStock = 10;
        const expiredUnits = 15;
        const remaining = Math.max(0, currentStock - expiredUnits);
        expect(remaining).toBe(0);
    });
});
