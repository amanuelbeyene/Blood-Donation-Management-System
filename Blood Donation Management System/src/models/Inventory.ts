import type { BloodType } from './Donor';

export interface InventoryRecord {
  id: string;
  bloodType: BloodType;
  unitsAvailable: number;
  criticalThreshold: number;
  lastUpdated: string;
}


