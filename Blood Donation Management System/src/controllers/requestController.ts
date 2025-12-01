import { delay } from './apiClient';
import { requests as mockRequests } from './mockData';
import type { RecipientRequest } from '../models/RecipientRequest';

export const fetchRequests = async (): Promise<RecipientRequest[]> => {
  await delay();
  return mockRequests;
};


