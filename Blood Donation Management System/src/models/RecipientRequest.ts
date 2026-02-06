import type { BloodType } from './Donor';

export type RequestStatus = 'pending' | 'matched' | 'fulfilled' | 'rejected' | 'in_progress';

export interface RecipientRequest {
  id: string;
  hospital: string;
  hospitalId?: string;
  patient: string;
  bloodType: BloodType;
  urgency: 'emergency' | 'high' | 'standard';
  unitsNeeded: number;
  status: RequestStatus;
  rejectionReason?: string;
  note?: string;
  donationId?: string;
  donation?: {
    status: string;
  };
  requestedAt: string;
}


