import { apiClient, delay } from './apiClient';
import type { UserRole } from '../store/slices/authSlice';

interface Credentials {
  identifier: string;
  password: string;
  role: string;
}

export const loginUser = async (
  credentials: Credentials,
): Promise<{ token: string; role: UserRole; userId?: string; fullName: string; profilePicture?: string; status?: string }> => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    // Handle both fullName (Donor) and name (Hospital/Admin) properties
    const { id, fullName, name, role, token, profilePicture } = response.data;
    return {
      token,
      role: role as UserRole,
      userId: id,
      fullName: fullName || name,
      profilePicture,
      status: response.data.status,
    };
  } catch (error: any) {
    console.error('Login API Error:', error);
    // Throw error or return default failed state
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const updatePassword = async (data: {
  identifier: string;
  role: string;
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post('/auth/update-password', data);
    return response.data;
  } catch (error: any) {
    console.error('Update Password Error:', error);
    throw new Error(error.response?.data?.message || 'Update password failed');
  }
};
