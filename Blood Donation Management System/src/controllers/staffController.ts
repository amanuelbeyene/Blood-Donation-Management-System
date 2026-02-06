import { apiClient } from './apiClient';

export interface Staff {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    landline?: string;
    role: string;
    status: string;
    profilePicture?: string;

    // Personal
    bloodType?: string;
    birthDate?: string;
    age?: number;
    maritalStatus?: string;
    gender?: string;
    fanNumber?: string;

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

    // Medical
    medicalCondition?: string;
    hasDisability?: string;
    disabilityType?: string;
    joinedDate?: string;
    createdAt?: string;
    idCardFront?: string | null;
    idCardBack?: string | null;
}

export const fetchStaff = async (): Promise<Staff[]> => {
    const response = await apiClient.get('/staff');
    return response.data;
};

export const fetchStaffById = async (id: string): Promise<Staff> => {
    const response = await apiClient.get(`/staff/${id}`);
    return response.data;
};

export const createStaff = async (data: Partial<Staff>): Promise<Staff> => {
    const response = await apiClient.post('/staff', data);
    return response.data;
};


// Helper to get current user (duplicated to avoid circular deps for now)
const getCurrentUser = () => {
    try {
        const roles = ['admin', 'staff', 'super_admin'];
        for (const role of roles) {
            const userStr = localStorage.getItem(`user_${role}`);
            if (userStr) return JSON.parse(userStr);
        }
        const basicUser = localStorage.getItem('user');
        if (basicUser) return JSON.parse(basicUser);
        return null;
    } catch {
        return null;
    }
};

import { ActivityTracker } from '../utils/ActivityTracker';

export const updateStaff = async (id: string, data: Partial<Staff>): Promise<Staff> => {
    // 1. Fetch existing data for diffing
    let oldStaff: Staff | null = null;
    try {
        oldStaff = await fetchStaffById(id);
    } catch (e) {
        console.warn('Could not fetch old staff for diff logging', e);
    }

    // 2. Perform update
    const response = await apiClient.put(`/staff/${id}`, data);
    const updatedStaff = response.data;

    // 3. Log Activity
    try {
        const currentUser = getCurrentUser();
        if (currentUser && oldStaff) {
            const changes: string[] = [];

            // Compare fields relevant to the log (excluding timestamps, etc)
            const fieldsToCheck: (keyof Staff)[] = [
                'fullName', 'email', 'phone', 'role', 'status', 'profilePicture',
                'bloodType', 'birthDate', 'age', 'maritalStatus', 'gender', 'fanNumber',
                'region', 'city', 'subCity', 'woreda', 'kebele', 'street', 'homeNumber',
                'medicalCondition', 'hasDisability', 'disabilityType'
            ];

            fieldsToCheck.forEach(key => {
                const oldValue = oldStaff?.[key];
                const newValue = data[key];
                // simple equality check (loose for string/number variances like "Yes" vs "Yes")
                if (newValue !== undefined && newValue !== oldValue) {
                    // Start Case the key for display (e.g., medicalCondition -> Medical Condition)
                    // But screenshots show camelCase or PascalCase "HasDisability, DisabilityType"
                    // I will stick to the key name or simple formatting as seen in screenshot
                    // Screenshot shows "HasDisability, DisabilityType" (PascalCase-ish)
                    // I'll capitalize the first letter.
                    const label = key.charAt(0).toUpperCase() + key.slice(1);
                    changes.push(label);
                }
            });

            if (changes.length > 0) {
                ActivityTracker.addLog({
                    staffId: currentUser.id, // Admin ID
                    actionType: 'UPDATE_STAFF',
                    targetId: id, // Staff ID being updated
                    targetName: updatedStaff.fullName,
                    targetProfilePicture: updatedStaff.profilePicture, // Optional
                    details: changes.join(', '), // "Phone, FullName"
                    staff: currentUser // Include staff details for the log
                });
            }
        }
    } catch (error) {
        console.error('Failed to log update staff activity', error);
    }

    return updatedStaff;
};

export const deleteStaff = async (id: string): Promise<void> => {
    await apiClient.delete(`/staff/${id}`);
};
