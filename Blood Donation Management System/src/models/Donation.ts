import type { BloodType } from './Donor';

export interface DonationRecord {
  id: string;
  donorName: string;
  hospital: string;
  bloodType: BloodType;
  units: number;
  donationDate: string;
  status: 'completed' | 'in-progress';
}


