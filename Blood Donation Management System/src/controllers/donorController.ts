import { apiClient, delay } from './apiClient';
// import { donors as mockDonors } from './mockData'; // Removed mock usage
import type { Donor } from '../models/Donor';
import { ActivityTracker } from '../utils/ActivityTracker';

export type { Donor };

const getCurrentUser = () => {
  try {
    const roles = ['admin', 'staff', 'super_admin'];

    // 1. Check Session Storage (Active Tab) - Priority
    for (const role of roles) {
      const userStr = sessionStorage.getItem(`user_${role}`);
      if (userStr) return JSON.parse(userStr);
    }

    // 2. Check Local Storage (Persisted Session)
    for (const role of roles) {
      const userStr = localStorage.getItem(`user_${role}`);
      if (userStr) return JSON.parse(userStr);
    }

    // 3. Fallback to basic 'user' key
    const basicUser = localStorage.getItem('user');
    if (basicUser) return JSON.parse(basicUser);

    return null;
  } catch {
    return null;
  }
};

export const fetchDonors = async (): Promise<Donor[]> => {
  try {
    const response = await apiClient.get('/donors');
    return response.data;
  } catch (error) {
    console.error('Fetch Donors Error:', error);
    return [];
  }
};

export const fetchDonorById = async (id: string): Promise<Donor | undefined> => {
  try {
    const response = await apiClient.get(`/donors/${id}`);
    return response.data;
  } catch (error) {
    console.error('Fetch Donor By ID Error:', error);
    return undefined;
  }
};

export const registerDonor = async (data: any): Promise<Donor> => {
  // Pass current user context implicitly via ActivityTracker in the controller?
  // Ideally this belongs in the service layer, but for this persistent-demo fix:
  const response = await apiClient.post('/auth/register/donor', data);
  const donor = response.data;

  // Log Activity locally
  const currentUser = getCurrentUser();
  if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff' || currentUser.role === 'super_admin')) {
    ActivityTracker.addLog({
      staffId: currentUser.id, // Assuming currentUser has ID matching Staff ID
      actionType: 'REGISTER_DONOR',
      targetId: donor.id,
      targetName: donor.fullName,
      targetProfilePicture: donor.profilePicture,
      details: 'Registered new donor',
      staff: {
        id: currentUser.id,
        fullName: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        status: 'Active',
        phone: '', // Added to satisfy Staff interface
        joinedDate: new Date().toISOString(),
        profilePicture: currentUser.profilePicture
      }
    });
  }

  return donor;
};

export const updateDonor = async (id: string, data: Partial<Donor>): Promise<Donor> => {
  // 1. Fetch existing for diff
  let oldDonor: Donor | undefined;
  try {
    oldDonor = await fetchDonorById(id);
  } catch (e) {
    console.warn('Could not fetch old donor for logging', e);
  }

  const response = await apiClient.put(`/donors/${id}`, data);
  const donor = response.data;

  // Log Activity locally
  try {
    const currentUser = getCurrentUser();
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff' || currentUser.role === 'super_admin')) {
      const changes: string[] = [];

      // Define fields to track
      const fieldsToCheck: (keyof Donor)[] = [
        'fullName', 'email', 'phone', 'bloodType', 'fanNumber',
        'appointmentRegion', 'appointmentPlace', 'appointmentTime', 'donationAppointmentDate',
        'hasDisability', 'disabilityType', 'lastDonation', 'location', 'availability',
        'totalDonations', 'impactScore', 'profilePicture', 'age', 'birthDate',
        'medicalCondition', 'gender', 'maritalStatus', 'status', 'rejectionReason'
      ];

      fieldsToCheck.forEach(key => {
        const oldValue = oldDonor?.[key];
        const newValue = data[key];
        if (newValue !== undefined && newValue !== oldValue) {
          // Format key: camelCase to Title Case (e.g. bloodType -> BloodType)
          // Screenshot shows "HasDisability, DisabilityType" (PascalCase-ish keys)
          // I'll capitalize first letter.
          const label = key.charAt(0).toUpperCase() + key.slice(1);
          changes.push(label);
        }
      });

      if (changes.length > 0) {
        ActivityTracker.addLog({
          staffId: currentUser.id,
          actionType: 'UPDATE_DONOR',
          targetId: donor.id,
          targetName: donor.fullName,
          targetProfilePicture: donor.profilePicture, // Ensure we carry this over
          details: changes.join(', '), // "Phone, BloodType"
          staff: {
            id: currentUser.id,
            fullName: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
            status: 'Active',
            phone: '',
            joinedDate: new Date().toISOString(),
            profilePicture: currentUser.profilePicture
          }
        });
      }
    }
  } catch (error) {
    console.error('Failed to log update donor activity', error);
  }

  return donor;
};

export const deleteDonor = async (id: string): Promise<void> => {
  await apiClient.delete(`/donors/${id}`);

  // Log Activity locally
  // For delete, we might not have the donor name anymore if we didn't fetch it, 
  // but usually delete happens from a context where we know it.
  // Actually delete returns void, so we can't get donor details easily unless passed.
  // We'll skip logging DELETE here to avoid complexity, or try to fetch before delete?
  // Let's Skip delete for now as User emphasized REGISTER and EDIT.
};

export const registerHospital = async (data: any): Promise<any> => {
  const response = await apiClient.post('/auth/register/hospital', data);
  return response.data;
};


