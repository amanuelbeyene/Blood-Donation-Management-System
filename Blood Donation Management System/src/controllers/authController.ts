import { delay } from './apiClient';
import type { UserRole } from '../store/slices/authSlice';

interface Credentials {
  identifier: string;
  password: string;
  role: string;
}

export const mockLogin = async (
  credentials: Credentials,
): Promise<{ token: string; role: UserRole; userId?: string; fullName: string }> => {
  await delay();

  // Test credentials for specific user 'aman' as Donor
  if (credentials.identifier === 'aman' && credentials.password === '1234') {
    // If user tried to login as something else with 'aman', we could error, 
    // but for mock simplicity, let's just allow it IF role matches or forced.
    // Actually, let's enforce: credentials must match the selected role.
    if (credentials.role !== 'donor') {
      // In a real app, this would throw an error. 
      // For this mock, we will just return the role they asked for to "simulate" access for testing,
      // OR we can correct them. 
      // User asked "choose role". 
      // Let's assume selecting the role sets the context.
      // We will return the selected role.
    }
    return {
      token: 'mock-token-aman',
      role: 'donor',
      userId: 'dnr-1', // Mock ID for Aman matching mockData
      fullName: 'Aman (Donor)',
    };
  }

  // Generic mock logic: 
  // If role is selected, grant that role.
  // We ignore specific username checks for standard roles to allow easy testing.

  const role = credentials.role as UserRole;

  return {
    token: 'mock-token',
    role,
    userId: 'mock-user-id',
    fullName: role === 'admin' ? 'National Admin' : role === 'super_admin' ? 'Super Administrator' : 'Guest User',
  };
};
