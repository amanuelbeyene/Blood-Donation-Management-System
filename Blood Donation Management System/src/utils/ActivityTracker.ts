import { StaffActivityLog } from '../views/pages/Admin/StaffActivityView';

const STORAGE_KEY = 'blood_donation_activity_logs';

export const ActivityTracker = {
    getLogs: (): StaffActivityLog[] => {
        try {
            const logs = localStorage.getItem(STORAGE_KEY);
            return logs ? JSON.parse(logs) : [];
        } catch (e) {
            console.error('Failed to parse activity logs', e);
            return [];
        }
    },

    addLog: (log: Omit<StaffActivityLog, 'id' | 'createdAt'>) => {
        try {
            const logs = ActivityTracker.getLogs();

            // Sanitize log to remove large data (like Base64 images)
            const safeLog: Omit<StaffActivityLog, 'id' | 'createdAt'> = {
                ...log,
                targetProfilePicture: log.targetProfilePicture && log.targetProfilePicture.length > 200
                    ? 'Base64Image...'
                    : log.targetProfilePicture,
                staff: log.staff ? {
                    ...log.staff,
                    profilePicture: log.staff.profilePicture && log.staff.profilePicture.length > 200
                        ? 'Base64Image...'
                        : log.staff.profilePicture
                } : undefined
            };

            const newLog: StaffActivityLog = {
                ...safeLog,
                id: `LOG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date().toISOString()
            };

            // Reduce limit to 50 to be safe
            const updatedLogs = [newLog, ...logs].slice(0, 50);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
            return newLog;
        } catch (e) {
            console.error('Activity Log Storage Error:', e);
            // Attempt to clear if full
            try {
                const logs = ActivityTracker.getLogs();
                // Keep only last 10
                const emergencyLogs = logs.slice(0, 10);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(emergencyLogs));
            } catch (e2) {
                console.warn('Could not recover log storage');
            }
            // Return a safe mocked log if storage fails
            return {
                ...log,
                id: 'temp',
                createdAt: new Date().toISOString(),
                staff: (log.staff || {
                    id: 'unknown',
                    fullName: 'Unknown',
                    email: '',
                    phone: '',
                    role: 'staff',
                    status: 'Active',
                    joinedDate: new Date().toISOString(),
                    profilePicture: undefined
                }) as any // Cast to any to avoid strict interface mismatches during fallback
            } as StaffActivityLog;
        }
    },

    clearLogs: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
