import { apiClient } from './apiClient';

export interface Notification {
    id: string;
    message: string;
    type: string;
    relatedId?: string;
    isRead: boolean;
    createdAt: string;
}

export const fetchNotifications = async (role: string = 'super_admin', userId?: string): Promise<Notification[]> => {
    try {
        const response = await apiClient.get('/notifications', {
            params: { role, userId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
    try {
        await apiClient.put(`/notifications/${id}/read`);
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
};
