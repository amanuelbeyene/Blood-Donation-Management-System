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
  contactDoctorName?: string;
  contactDoctorPhone?: string;
  location: string; // Keep for backward compatibility
  locationDetails?: HospitalLocation; // New detailed location
  businessLicenseName?: string;
  businessLicenseNumber?: string;
  hospitalType?: HospitalType;
  profilePicture?: string; // URL or base64 string for profile picture
  latitude?: number;
  longitude?: number;
}

