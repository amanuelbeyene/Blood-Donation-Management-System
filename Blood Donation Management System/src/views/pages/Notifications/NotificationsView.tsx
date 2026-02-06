import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { fetchNotifications, markNotificationAsRead, Notification } from '../../../controllers/notificationController';

const NotificationsView = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNotifications = async () => {
            if (user) {
                try {
                    const roleParam = user.role;
                    const userId = user.id;
                    const data = await fetchNotifications(roleParam, userId);
                    setNotifications(data);
                } catch (error) {
                    console.error("Failed to load notifications", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadNotifications();

        // Optional: formatting interval or polling
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const handleNotificationClick = async (notif: Notification) => {
        // Mark as read if not already
        if (!notif.isRead) {
            await markNotificationAsRead(notif.id);
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
        }

        // Redirect Logic (Matches AdminHeader)
        const adminActivityTypes = [
            'STAFF_ADD', 'STAFF_EDIT', 'STAFF_DELETE', 'VIEW_STAFF',
            'APPROVE_DONOR', 'REJECT_DONOR',
            'APPROVE_HOSPITAL', 'REJECT_HOSPITAL'
        ];

        const basePath = user?.role === 'super_admin' ? '/super-admin' : '/admin';

        if (adminActivityTypes.includes(notif.type) || ['STAFF_ADD_DONOR', 'STAFF_EDIT_DONOR', 'STAFF_DELETE_DONOR', 'STAFF_ADD_HOSPITAL', 'STAFF_EDIT_HOSPITAL', 'STAFF_DELETE_HOSPITAL', 'STAFF_REMOVE_APPT'].includes(notif.type)) {
            if (['STAFF_ADD_DONOR', 'STAFF_EDIT_DONOR', 'STAFF_DELETE_DONOR', 'STAFF_ADD_HOSPITAL', 'STAFF_EDIT_HOSPITAL', 'STAFF_DELETE_HOSPITAL', 'STAFF_REMOVE_APPT'].includes(notif.type)) {
                navigate(`${basePath}/manage-staff`, { state: { highlightId: notif.relatedId } });
            } else if (adminActivityTypes.includes(notif.type)) {
                navigate(`${basePath}/manage-admins`, { state: { highlightId: notif.relatedId } });
            }
        } else if (notif.type === 'BLOOD_REQUEST') {
            navigate(`${basePath}/blood-requests`);
        } else if (notif.type === 'INVENTORY_UPDATE' || notif.type === 'BLOOD_STOCK_UPDATE') {
            navigate(`${basePath}/blood-stock`);
        } else if (['DONOR_REGISTER', 'MEDICAL_TEST_RESULT'].includes(notif.type)) {
            navigate(`${basePath}/approve-donor`);
        } else if (['HOSPITAL_REGISTER'].includes(notif.type)) {
            navigate(`${basePath}/approve-hospital`);
        } else if (notif.type.startsWith('STAFF_')) {
            // Fallback for staff-specific notifications if any
        }
    };

    const handleMarkAllRead = async () => {
        const unreadParams = notifications.filter(n => !n.isRead);
        // Execute sequentially or parallel
        await Promise.all(unreadParams.map(n => markNotificationAsRead(n.id)));
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = (now.getTime() - date.getTime()) / 1000; // seconds

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                    {user && (
                        <p className="text-slate-600 mt-1">
                            Welcome <span className="font-semibold text-primary">{user.fullName}</span>
                        </p>
                    )}
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-sm font-semibold text-red-600 hover:text-red-800 transition"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading notifications...</div>
            ) : (
                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-slate-500">No notifications found.</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={`p-4 rounded-xl border transition cursor-pointer relative group
                                    ${n.isRead
                                        ? 'bg-white border-slate-200 hover:border-red-200'
                                        : 'bg-white border-l-4 border-l-red-500 shadow-sm border-t-slate-200 border-r-slate-200 border-b-slate-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        {!n.isRead && (
                                            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                                        )}
                                        <h3 className={`font-semibold text-lg ${n.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                                            {n.type.replace('STAFF_', '').replace(/_/g, ' ')}
                                        </h3>
                                        {n.isRead && (
                                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-500 font-medium border border-gray-200">
                                                Seen
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-400 whitespace-nowrap">{formatTime(n.createdAt)}</span>
                                </div>
                                <p className={`text-sm ml-5 ${n.isRead ? 'text-slate-500' : 'text-slate-700'}`}>{n.message}</p>

                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationsView;
