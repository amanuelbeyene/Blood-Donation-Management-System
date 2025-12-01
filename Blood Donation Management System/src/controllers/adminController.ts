import { delay } from './apiClient';
import {
  dashboardStats as mockStats,
  donationHistory as mockHistory,
} from './mockData';
import type { DashboardStats } from '../models/Stats';
import type { DonationRecord } from '../models/Donation';

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  await delay();
  return mockStats;
};

export const fetchDonationHistory = async (): Promise<DonationRecord[]> => {
  await delay();
  return mockHistory;
};


