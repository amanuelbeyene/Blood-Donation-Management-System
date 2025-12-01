import { delay } from './apiClient';
import type { UserRole } from '../store/slices/authSlice';

interface Credentials {
  email: string;
  password: string;
}

export const mockLogin = async (
  credentials: Credentials,
): Promise<{ token: string; role: UserRole; fullName: string }> => {
  await delay();

  const role: UserRole = credentials.email.includes('admin')
    ? 'admin'
    : credentials.email.includes('hospital')
      ? 'hospital'
      : 'donor';

  return {
    token: 'mock-token',
    role,
    fullName: role === 'admin' ? 'National Admin' : 'Guest User',
  };
};


