import { apiClient, delay } from './apiClient';
import type { UserRole } from '../store/slices/authSlice';

interface Credentials {
  identifier: string;
  password: string;
  role: string;
}

export const mockLogin = async (
  credentials: Credentials,
): Promise<{ token: string; role: UserRole; userId?: string; fullName: string }> => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    const { id, fullName, role, token } = response.data;
    return {
      token,
      role: role as UserRole,
      userId: id,
      fullName,
    };
  } catch (error: any) {
    console.error('Login API Error:', error);
    // Throw error or return default failed state
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};
