import type { DashboardStats } from '../models/Stats';
import type { Donor } from '../models/Donor';
import type { RecipientRequest } from '../models/RecipientRequest';
import type { InventoryRecord } from '../models/Inventory';
import type { DonationRecord } from '../models/Donation';

export const dashboardStats: DashboardStats = {
  registeredDonors: 1840,
  livesSaved: 612,
  emergencyRequests: 12,
  activeHospitals: 48,
};

export const donors: Donor[] = [
  {
    id: 'dnr-1',
    fullName: 'Mariam Tesfaye',
    bloodType: 'O+',
    lastDonation: '2025-09-18',
    location: 'Addis Ababa',
    availability: 'ready',
    totalDonations: 8,
    impactScore: 92,
  },
  {
    id: 'dnr-2',
    fullName: 'Samuel Bekele',
    bloodType: 'A-',
    lastDonation: '2025-07-02',
    location: 'Gondar',
    availability: 'resting',
    totalDonations: 5,
    impactScore: 74,
  },
  {
    id: 'dnr-3',
    fullName: 'Hanna Girma',
    bloodType: 'B+',
    lastDonation: '2025-10-28',
    location: 'Hawassa',
    availability: 'ready',
    totalDonations: 3,
    impactScore: 61,
  },
];

export const requests: RecipientRequest[] = [
  {
    id: 'req-1',
    hospital: 'St. Paul Hospital',
    patient: 'Neonatal ICU',
    bloodType: 'O-',
    urgency: 'emergency',
    unitsNeeded: 4,
    status: 'pending',
    requestedAt: '2025-11-27T08:30:00Z',
  },
  {
    id: 'req-2',
    hospital: 'Black Lion Hospital',
    patient: 'Surgery Ward',
    bloodType: 'AB+',
    urgency: 'high',
    unitsNeeded: 2,
    status: 'matched',
    requestedAt: '2025-11-26T11:15:00Z',
  },
  {
    id: 'req-3',
    hospital: 'Jimma University Hospital',
    patient: 'Oncology',
    bloodType: 'A+',
    urgency: 'standard',
    unitsNeeded: 6,
    status: 'fulfilled',
    requestedAt: '2025-11-25T15:50:00Z',
  },
];

export const inventory: InventoryRecord[] = [
  { bloodType: 'O+', unitsAvailable: 42, criticalThreshold: 25, lastUpdated: '2025-11-28' },
  { bloodType: 'O-', unitsAvailable: 9, criticalThreshold: 15, lastUpdated: '2025-11-28' },
  { bloodType: 'A+', unitsAvailable: 31, criticalThreshold: 20, lastUpdated: '2025-11-28' },
  { bloodType: 'B+', unitsAvailable: 22, criticalThreshold: 18, lastUpdated: '2025-11-28' },
];

export const donationHistory: DonationRecord[] = [
  {
    id: 'hist-1',
    donorName: 'Mariam Tesfaye',
    hospital: 'St. Paul Hospital',
    bloodType: 'O+',
    units: 1,
    donationDate: '2025-10-28',
    status: 'completed',
  },
  {
    id: 'hist-2',
    donorName: 'Samuel Bekele',
    hospital: 'Black Lion Hospital',
    bloodType: 'A-',
    units: 1,
    donationDate: '2025-09-14',
    status: 'completed',
  },
  {
    id: 'hist-3',
    donorName: 'Hanna Girma',
    hospital: 'St. Peter Hospital',
    bloodType: 'B+',
    units: 1,
    donationDate: '2025-08-12',
    status: 'completed',
  },
];


