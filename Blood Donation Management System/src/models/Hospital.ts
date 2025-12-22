export interface HospitalLocation {
  region?: string;
  city?: string;
  subCity?: string;
  woreda?: string;
  kebele?: string;
  street?: string;
  homeNumber?: string;
}

export type HospitalType = 'Government Hospital' | 'Non-Government Hospital';

export interface Hospital {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  username?: string;
  password?: string;
  contactDoctorName?: string;
  contactDoctorPhone?: string;
  fanNumber?: string; // 16-digit Unique ID
  location: string; // Keep for backward compatibility
  locationDetails?: HospitalLocation; // New detailed location
  businessLicenseName?: string;
  businessLicenseNumber?: string;
  businessLicenseImage?: string; // URL or base64 string for license document
  hospitalType?: HospitalType;
  profilePicture?: string; // URL or base64 string for profile picture
  latitude?: number;
  longitude?: number;
  status?: 'Active' | 'Pending' | 'Rejected';
  rejectionReason?: string;
}

