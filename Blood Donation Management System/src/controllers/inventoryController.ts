import { apiClient } from './apiClient';
import type { InventoryRecord } from '../models/Inventory';

export const fetchInventory = async (): Promise<InventoryRecord[]> => {
  const response = await apiClient.get('/inventory');
  return response.data;
};

export const updateInventory = async (id: string, data: Partial<InventoryRecord>): Promise<InventoryRecord> => {
  // Note: Inventory might be keyed by BloodType in some views, but ID in backend.
  // If backend expects ID, we ensure we pass ID.
  const response = await apiClient.put(`/inventory/${id}`, data);
  return response.data;
};

export const checkAndProcessExpiry = async (): Promise<any> => {
  try {
    const response = await apiClient.post('/inventory/check-expiry');
    return response.data;
  } catch (error) {
    console.error("Failed to check expiry", error);
    throw error;
  }
};

export const fetchExpiredStock = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/inventory/expired');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch expired stock", error);
    return [];
  }
};
