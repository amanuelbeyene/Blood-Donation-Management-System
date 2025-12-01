import { delay } from './apiClient';
import { donors as mockDonors } from './mockData';
import type { Donor } from '../models/Donor';

export const fetchDonors = async (): Promise<Donor[]> => {
  await delay();
  return mockDonors;
};


