export type BloodType =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-';

export interface Donor {
  id: string;
  fullName: string;
  bloodType: BloodType;
  lastDonation?: string;
  location: string;
  availability: 'ready' | 'resting';
  totalDonations: number;
  impactScore: number;
}


