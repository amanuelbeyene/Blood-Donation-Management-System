import { apiClient } from './apiClient';
import type { DonationRecord } from '../models/Donation';

export const fetchDonations = async (): Promise<DonationRecord[]> => {
    const response = await apiClient.get('/donations');
    return response.data;
};

export const createDonation = async (data: any): Promise<DonationRecord> => {
    const response = await apiClient.post('/donations', data);
    return response.data;
};

export const updateDonation = async (id: string, data: any): Promise<DonationRecord> => {
    const response = await apiClient.put(`/donations/${id}`, data);
    return response.data;
};
