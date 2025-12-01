import type { BloodType } from './Donor';

export type RequestStatus = 'pending' | 'matched' | 'fulfilled';

export interface RecipientRequest {
  id: string;
  hospital: string;
  patient: string;
  bloodType: BloodType;
  urgency: 'emergency' | 'high' | 'standard';
  unitsNeeded: number;
  status: RequestStatus;
  requestedAt: string;
}


