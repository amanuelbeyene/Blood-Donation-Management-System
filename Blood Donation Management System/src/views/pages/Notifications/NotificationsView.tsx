import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import MainLayout from '../../components/layout/MainLayout';

const NotificationsView = () => {
    const { t } = useLanguage();
    const { user } = useAuth();

    // Mock Notifications (Expanded)
    const notifications = [
        { id: 1, title: 'Urgent Request', message: 'O+ blood needed at Black Lion Hospital', time: '10m ago', unread: true, type: 'urgent' },
        { id: 2, title: 'Appointment Confirmed', message: 'Your donation is scheduled for tomorrow at 9:00 AM', time: '1h ago', unread: false, type: 'info' },
        { id: 3, title: 'System Update', message: 'Maintenance scheduled for tonight from 2 AM to 4 AM.', time: '5h ago', unread: false, type: 'system' },
        { id: 4, title: 'New Donor Registered', message: 'A new donor has registered in your region.', time: '1d ago', unread: false, type: 'info' },
        { id: 5, title: 'Blood Stock Low', message: 'AB- blood stock is running low in the central bank.', time: '2d ago', unread: true, type: 'warning' },
    ];

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                    {user && (
                        <p className="text-slate-600 mt-1">
                            Welcome <span className="font-semibold text-primary">{user.name}</span> {user.role === 'super_admin' ? 'Super Admin' : user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'} To Notification Center
                        </p>
                    )}
                </div>
                <button className="text-sm font-semibold text-primary hover:text-primary-dark">
                    Mark all as read
                </button>
            </div>

            <div className="space-y-4">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`p-4 rounded-xl border border-slate-200 shadow-sm transition hover:shadow-md ${n.unread ? 'bg-white border-l-4 border-l-blue-500' : 'bg-slate-50'}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`h-2 w-2 rounded-full ${n.unread ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                <h3 className={`font-semibold ${n.unread ? 'text-slate-900' : 'text-slate-700'}`}>{n.title}</h3>
                            </div>
                            <span className="text-xs text-slate-500 whitespace-nowrap">{n.time}</span>
                        </div>
                        <p className="text-sm text-slate-600 ml-5">{n.message}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <button className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition">
                    Load More
                </button>
            </div>
        </div>
    );
};

export default NotificationsView;
