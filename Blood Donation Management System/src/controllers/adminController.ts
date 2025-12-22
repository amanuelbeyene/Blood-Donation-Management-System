import { apiClient } from './apiClient';

export interface Admin {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string; // 'admin' | 'super_admin'
  profilePicture?: string;
  status?: string;

  // Address
  region?: string;
  city?: string;
  subCity?: string;
  woreda?: string;
  kebele?: string;
  street?: string;
  homeNumber?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export const fetchAdmins = async (): Promise<Admin[]> => {
  const response = await apiClient.get('/admins');
  return response.data;
};

export const fetchAdminById = async (id: string): Promise<Admin> => {
  const response = await apiClient.get(`/admins/${id}`);
  return response.data;
};

export const createAdmin = async (data: any): Promise<Admin> => {
  const response = await apiClient.post('/admins', data);
  return response.data;
};

export const updateAdmin = async (id: string, data: Partial<Admin>): Promise<Admin> => {
  const response = await apiClient.put(`/admins/${id}`, data);
  return response.data;
};

export const deleteAdmin = async (id: string): Promise<void> => {
  await apiClient.delete(`/admins/${id}`);
};

export const fetchDashboardStats = async (): Promise<any> => {
  // TODO: Replace with actual API call
  return {
    registeredDonors: 0,
    emergencyRequests: 0,
    livesSaved: 0
  };
};

export const fetchDonationHistory = async (): Promise<any[]> => {
  // TODO: Replace with actual API call
  return [];
};
