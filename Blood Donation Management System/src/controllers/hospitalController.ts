import { delay } from './apiClient';
import { hospitals as mockHospitals } from './mockData';
import type { Hospital } from '../models/Hospital';

export const fetchHospitals = async (): Promise<Hospital[]> => {
  await delay();
  return mockHospitals;
};

