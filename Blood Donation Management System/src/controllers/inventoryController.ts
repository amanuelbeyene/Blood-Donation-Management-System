import { delay } from './apiClient';
import { inventory as mockInventory } from './mockData';
import type { InventoryRecord } from '../models/Inventory';

export const fetchInventory = async (): Promise<InventoryRecord[]> => {
  await delay();
  return mockInventory;
};


