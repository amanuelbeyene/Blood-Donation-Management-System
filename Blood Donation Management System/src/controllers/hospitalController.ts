import { apiClient } from './apiClient';
import type { Hospital } from '../models/Hospital';

export const fetchHospitals = async (): Promise<Hospital[]> => {
  const response = await apiClient.get('/hospitals');
  return response.data;
};

export const fetchHospitalById = async (id: string): Promise<Hospital> => {
  const response = await apiClient.get(`/hospitals/${id}`);
  return response.data;
};

export const updateHospital = async (id: string, data: Partial<Hospital>): Promise<Hospital> => {
  const response = await apiClient.put(`/hospitals/${id}`, data);
  return response.data;
};

export const deleteHospital = async (id: string): Promise<void> => {
  await apiClient.delete(`/hospitals/${id}`);
};

export const registerHospital = async (data: any): Promise<Hospital> => {
  const response = await apiClient.post('/hospitals', data);
  return response.data;
};
