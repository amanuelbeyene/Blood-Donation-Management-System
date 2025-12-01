import type { BloodType } from './Donor';

export interface InventoryRecord {
  bloodType: BloodType;
  unitsAvailable: number;
  criticalThreshold: number;
  lastUpdated: string;
}


