import { apiClient } from './apiClient';

export interface Admin {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  landline?: string;
  role: string; // 'admin' | 'super_admin'
  profilePicture?: string;
  status?: string;

  // Address
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

  // Personal
  bloodType?: string;
  birthDate?: string;
  age?: number | string;
  maritalStatus?: string;
  gender?: string;
  fanNumber?: string;
  createdAt?: string;
  idCardFront?: string | null;
  idCardBack?: string | null;
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
  try {
    const response = await apiClient.get('/admins/dashboard-stats');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    // Return zeroes on failure to avoid UI crash
    return {
      totalDonors: 0,
      totalRequests: 0,
      approvedRequests: 0,
      totalVolume: 0,
      bloodGroups: {},
      availableBloodUnits: 0,
      totalStaff: 0,
      totalHospitals: 0
    };
  }
};

export const fetchDonationHistory = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/donations');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch donation history:", error);
    return [];
  }
};
