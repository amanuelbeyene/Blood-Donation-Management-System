import type { BloodType } from './Donor';

export interface DonationRecord {
  id: string;
  donorId: string;
  donorName: string;
  hospital: string;
  hospitalId?: string;
  bloodType: BloodType;
  units: number;
  donationDate: string;
  status: 'completed' | 'in-progress' | 'in_progress' | 'Completed' | 'Rejected' | 'rejected';
}


