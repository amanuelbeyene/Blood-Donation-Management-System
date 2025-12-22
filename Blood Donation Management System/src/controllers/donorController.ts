import { apiClient, delay } from './apiClient';
// import { donors as mockDonors } from './mockData'; // Removed mock usage
import type { Donor } from '../models/Donor';

export const fetchDonors = async (): Promise<Donor[]> => {
  try {
    const response = await apiClient.get('/donors');
    return response.data;
  } catch (error) {
    console.error('Fetch Donors Error:', error);
    return [];
  }
};

export const fetchDonorById = async (id: string): Promise<Donor | undefined> => {
  try {
    const response = await apiClient.get(`/donors/${id}`);
    return response.data;
  } catch (error) {
    console.error('Fetch Donor By ID Error:', error);
    return undefined;
  }
};

export const registerDonor = async (data: any): Promise<Donor> => {
  const response = await apiClient.post('/donors', data);
  return response.data;
};

export const updateDonor = async (id: string, data: Partial<Donor>): Promise<Donor> => {
  const response = await apiClient.put(`/donors/${id}`, data);
  return response.data;
};

export const deleteDonor = async (id: string): Promise<void> => {
  await apiClient.delete(`/donors/${id}`);
};


