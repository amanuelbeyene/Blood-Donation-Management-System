export type BloodType =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-';

export interface DonorLocation {
  region?: string;
  city?: string;
  subCity?: string;
  woreda?: string;
  kebele?: string;
  street?: string;
  homeNumber?: string;
}

export interface Donor {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  bloodType: BloodType;
  lastDonation?: string;
  location: string; // Keep for backward compatibility
  locationDetails?: DonorLocation; // New detailed location
  latitude?: number;
  longitude?: number;
  availability: 'ready' | 'resting';
  totalDonations: number;
  impactScore: number;
  profilePicture?: string; // URL or base64 string for profile picture
  age?: number;
  birthDate?: string; // ISO Date string
  medicalCondition?: string;
  lotteryId?: string;
  status?: 'Active' | 'Inactive' | 'Pending';
}


