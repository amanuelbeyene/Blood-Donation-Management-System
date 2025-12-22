import { apiClient } from './apiClient';
import type { RecipientRequest } from '../models/RecipientRequest';

export const fetchRequests = async (): Promise<RecipientRequest[]> => {
  const response = await apiClient.get('/requests');
  return response.data;
};

export const createRequest = async (data: Partial<RecipientRequest>): Promise<RecipientRequest> => {
  const response = await apiClient.post('/requests', data);
  return response.data;
};

export const updateRequest = async (id: string, data: Partial<RecipientRequest>): Promise<RecipientRequest> => {
  const response = await apiClient.put(`/requests/${id}`, data);
  return response.data;
};

export const deleteRequest = async (id: string): Promise<void> => {
  await apiClient.delete(`/requests/${id}`);
};
