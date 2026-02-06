import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchNotifications, markNotificationAsRead, Notification } from '../../../controllers/notificationController';

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  const { lang, setLanguage, t } = useLanguage();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      // Fetch based on user role.
      if (user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff' || user?.role === 'medical_staff') {
        const data = await fetchNotifications(user.role);
        // Keep last 10 notifications, mixed read/unread
        setNotifications(data.slice(0, 10));
      }
    };

    // Initial load
    loadNotifications();

    // Poll every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleNotificationClick = async (notif: Notification) => {
    // Mark as read
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
      );
    }

    // Determine Base Path
    let basePath = '/admin';
    if (user?.role === 'super_admin') basePath = '/super-admin';
    else if (user?.role === 'staff') basePath = '/staff';
    else if (user?.role === 'medical_staff') basePath = '/medical-staff';

    // Redirect Logic
    const adminActivityTypes = [
      'STAFF_ADD', 'STAFF_EDIT', 'STAFF_DELETE', 'VIEW_STAFF',
      'APPROVE_DONOR', 'REJECT_DONOR',
      'APPROVE_HOSPITAL', 'REJECT_HOSPITAL'
    ];

    if (adminActivityTypes.includes(notif.type) || ['STAFF_ADD_DONOR', 'STAFF_EDIT_DONOR', 'STAFF_DELETE_DONOR', 'STAFF_ADD_HOSPITAL', 'STAFF_EDIT_HOSPITAL', 'STAFF_DELETE_HOSPITAL', 'STAFF_REMOVE_APPT'].includes(notif.type)) {
      if (['STAFF_ADD_DONOR', 'STAFF_EDIT_DONOR', 'STAFF_DELETE_DONOR', 'STAFF_ADD_HOSPITAL', 'STAFF_EDIT_HOSPITAL', 'STAFF_DELETE_HOSPITAL', 'STAFF_REMOVE_APPT'].includes(notif.type)) {
        // Redirect to View Staff page with highlight (Staff might not have this view, check routes)
        // For Staff, 'manage-staff' route doesn't exist. They have 'manage-donors' etc.
        // Assuming this notification type implies actions *on* staff or *by* staff?
        // Actually STAFF_ADD_DONOR usually means a staff added a donor.

        const targetTab = notif.type.includes('HOSPITAL') ? 'hospital' : 'donor';
        // Adjust for staff view if needed
        if (user?.role === 'staff' || user?.role === 'medical_staff') {
          // Staff don't "manage staff". They manage donors/hospitals.
          if (targetTab === 'donor') navigate(`${basePath}/view-donors`, { state: { highlightId: notif.relatedId } });
          else navigate(`${basePath}/view-hospitals`, { state: { highlightId: notif.relatedId } });
        } else {
          navigate(`${basePath}/manage-staff?tab=${targetTab}`, { state: { highlightId: notif.relatedId } });
        }

      } else if (adminActivityTypes.includes(notif.type)) {
        // General admin activity handling
        if (['APPROVE_DONOR'].includes(notif.type)) {
          // Staff can view this in view-donors or a specific page
          navigate(`${basePath}/view-donors`, { state: { highlightId: notif.relatedId } });
        } else if (['REJECT_DONOR'].includes(notif.type)) {
          navigate(`${basePath}/donor-approval`, { state: { highlightId: notif.relatedId, activeTab: 'rejected' } });
        } else if (['APPROVE_HOSPITAL', 'REJECT_HOSPITAL'].includes(notif.type)) {
          navigate(`${basePath}/view-hospitals`, { state: { highlightId: notif.relatedId } });
        } else {
          // Other admin activities (STAFF_ADD etc) - Staff might not see this or just go to notifications
          navigate(`${basePath}/notifications`);
        }
      }
    } else if (notif.type === 'BLOOD_REQUEST') {
      navigate(`${basePath}/blood-requests`, { state: { highlightId: notif.relatedId } });
    } else if (notif.type === 'INVENTORY_UPDATE' || notif.type === 'BLOOD_STOCK_UPDATE') {
      // Staff has inventory view?
      // AppRoutes: '/inventory' is global.
      navigate(`/inventory`);
    } else if (['DONOR_REGISTER', 'MEDICAL_TEST_RESULT'].includes(notif.type)) {
      // Go to Pending tab (default for donor-approval)
      navigate(`${basePath}/donor-approval`, { state: { highlightId: notif.relatedId } });
    } else if (['HOSPITAL_REGISTER'].includes(notif.type)) {
      navigate(`${basePath}/approve-hospital`, { state: { highlightId: notif.relatedId } });
    }

    setShowNotifications(false);
  };

  const getNotificationPath = () => {
    if (user?.role === 'super_admin') return '/super-admin/notifications';
    if (user?.role === 'staff') return '/staff/notifications';
    return '/admin/notifications';
  };

  return (
    <header className="bg-red-600 text-white shadow-md relative z-20 transition-all duration-300">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuClick}
            className="p-1 mr-2 hover:bg-red-700 rounded-lg lg:hidden focus:outline-none"
            aria-label="Toggle Menu"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <NavLink to="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="BDMS Logo" className="h-full w-full object-cover" />
            </div>
            <p className="font-display text-lg font-bold text-white">{t('appName' as any)}</p>
          </NavLink>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-red-200 bg-white/10 text-sm font-semibold text-white overflow-hidden">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-2 transition ${lang === 'en' ? 'bg-white text-red-600' : 'hover:bg-red-500/30'}`}
            >
              ENG
            </button>
            <button
              type="button"
              onClick={() => setLanguage('am')}
              className={`px-3 py-2 transition ${lang === 'am' ? 'bg-white text-red-600' : 'hover:bg-red-500/30'}`}
            >
              አማ
            </button>
          </div>

          {/* Notification Bell (Hidden on Notification Page) */}
          {!location.pathname.endsWith('/notifications') && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-white hover:bg-red-700 transition rounded-full focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-yellow-400 border border-red-600 flex items-center justify-center text-[10px] text-red-900 font-bold">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 text-gray-800 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">{t('notifications' as any)}</h3>
                    <span className="text-xs text-red-600 font-medium hover:underline cursor-pointer">{t('markAllRead' as any)}</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-3 text-center text-sm text-gray-500">
                        {t('noNewNotifications' as any)}
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`px-4 py-3 transition cursor-pointer border-b border-gray-50 last:border-0 ${notif.isRead ? 'bg-gray-50' : 'hover:bg-gray-50'
                            }`}
                        >
                          <div className="flex justify-between items-start">
                            <p className={`text-sm font-medium ${notif.isRead ? 'text-gray-500' : 'text-gray-900'}`}>
                              {notif.type.replace('STAFF_', '').replace('_', ' ')}
                            </p>
                            {notif.isRead && <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{t('seen' as any)}</span>}
                          </div>
                          <p className={`text-sm mt-0.5 ${notif.isRead ? 'text-gray-400' : 'text-gray-700'}`}>{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleTimeString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 text-center">
                    <NavLink
                      to={getNotificationPath()}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowNotifications(false)}
                      className="text-sm text-red-600 font-medium hover:text-red-700"
                    >
                      {t('viewAllNotifications' as any)}
                    </NavLink>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-700 transition text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {t('logout' as any)}
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

