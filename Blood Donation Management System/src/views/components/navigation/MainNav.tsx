import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import ConfirmationModal from '../common/ConfirmationModal';

const donorNavItems = [
  { path: '/donor-dashboard', labelKey: 'dashboard' },
  { path: '/register', labelKey: 'register' },
  { path: '/awards', labelKey: 'awards' },
];

const hospitalNavItems = [
  {
    path: '/hospital',
    labelKey: 'dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    )
  },
  {
    path: '/hospital/emergency-request',
    labelKey: 'emergencyRequest',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    )
  },
  {
    path: '/hospital/find-donors',
    labelKey: 'findDonor',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    )
  },
  {
    path: '/hospital/my-requests',
    labelKey: 'myRequests',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
    )
  },
  {
    path: '/hospital/my-donations',
    labelKey: 'myDonations',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
    )
  },
];

const MainNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, lang, setLanguage } = useLanguage();
  const { toast } = useToast();
  const { user, logout, isAuthenticated } = useAuth();

  const location = useLocation();

  // Confirmation Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info' | 'success';
    confirmLabel?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    type: 'danger'
  });

  const openConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' | 'success' = 'danger',
    confirmLabel: string = 'Confirm'
  ) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      onConfirm,
      type,
      confirmLabel
    });
  };

  // Show "Donor Mode" only on specific donor dashboard pages, NOT on public pages like register/awards
  const isDonorPage = location.pathname.startsWith('/donor-dashboard') || (user && location.pathname.startsWith('/donors'));

  // Show "Hospital Mode" on hospital pages
  // Determine if we are in a "Donor Context"
  const isDonorContext =
    location.pathname === '/donor-dashboard' ||
    location.pathname === '/requests' ||
    location.pathname === '/inventory' ||
    location.pathname === '/history' ||
    location.pathname === '/edit-donor' ||
    location.pathname === '/donor-awards' ||
    (location.state as any)?.fromDonorContext ||
    (location.pathname === '/notifications' && (user as any)?.role === 'donor');

  // Show "Hospital Mode" on hospital pages OR if on notifications page as hospital
  const isHospitalPage = location.pathname.startsWith('/hospital') ||
    (location.pathname === '/notifications' && (user as any)?.role === 'hospital');

  // Use appropriate nav items based on page type
  let navItems = isHospitalPage ? hospitalNavItems : donorNavItems;

  // Remove "Register" button if we are in Donor Context (Dashboard)
  if (isDonorContext) {
    navItems = navItems.filter(item => item.path !== '/register');
    // Redirect Awards to Donor Awards in this context
    navItems = navItems.map(item =>
      item.path === '/awards' ? { ...item, path: '/donor-awards' } : item
    );
  }

  // If we are NOT in donor context (e.g. browsing public pages from Home or Login), Dashboard -> Main Page
  if (!isHospitalPage && !isDonorContext && (location.pathname === '/login' || location.pathname.startsWith('/register') || location.pathname.startsWith('/awards') || location.pathname.startsWith('/donors'))) {
    navItems = navItems.map(item =>
      item.labelKey === 'dashboard' ? { ...item, path: '/' } : item
    );
  }

  const linkClasses = ({ isActive }: { isActive: boolean }) => {
    if (isHospitalPage) {
      // Premium Soft-Pill Design for Hospital
      return `flex items-center gap-2.5 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-full group ${isActive
        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200/50'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        }`;
    }
    return `px-4 py-2 text-sm font-medium transition rounded-lg ${isActive
      ? 'bg-primary text-white'
      : 'text-slate-700 hover:bg-slate-100'
      }`;
  };

  // On main page, Dashboard button should be active
  const isMainPage = location.pathname === '/';

  // Make nav sticky on register and login pages
  const isRegisterPage = location.pathname === '/register';
  const isLoginPage = location.pathname === '/login';
  const stickyClass = (isRegisterPage || isLoginPage) ? 'sticky top-0 z-50' : '';

  // Check if hospital is pending
  const isHospitalPending = isHospitalPage && user?.role === 'hospital' && user?.status !== 'Active';

  // State for Notifications
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch Notifications
  useEffect(() => {
    if (isAuthenticated && (isDonorContext || isHospitalPage)) {
      const fetchNotifs = async () => {
        try {
          // Dynamically import to avoid circular dependencies if any, or just standard import
          const { fetchNotifications } = await import('../../../controllers/notificationController');
          const userId = user?.id;
          const role = user?.role || 'donor';

          if (userId) {
            const data = await fetchNotifications(role, userId);
            if (Array.isArray(data)) {
              setNotifications(data);
              setUnreadCount(data.filter((n: any) => !n.isRead).length);
            } else {
              console.error("Notifications data is not an array:", data);
              setNotifications([]);
              setUnreadCount(0);
            }
          }
        } catch (error) {
          console.error("Failed to fetch notifications", error);
        }
      };

      fetchNotifs();
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifs, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isDonorContext, isHospitalPage, user]);

  const handleMarkAllRead = async () => {
    try {
      const { markNotificationAsRead } = await import('../../../controllers/notificationController');
      await Promise.all(notifications.filter(n => !n.isRead).map(n => markNotificationAsRead(n.id)));

      // Optimistically update UI
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  return (
    <header className={`border-b border-white/60 bg-white/80 backdrop-blur-md shadow-sm transition-all duration-300 ${stickyClass}`}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <NavLink to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className={`h-11 w-11 rounded-full flex items-center justify-center overflow-hidden shadow-sm ring-2 ring-offset-2 ${isHospitalPage ? 'bg-gradient-to-br from-blue-500 to-indigo-600 ring-blue-100' : 'bg-red-50 ring-red-50'}`}>
              <img
                src="/logo.png"
                alt="BDMS Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="hidden lg:block">
              <div className="flex items-center gap-2">
                <p className="font-display text-lg font-bold text-slate-900 tracking-tight leading-none">BDMS Ethiopia</p>
                {isHospitalPage && (
                  <div className="flex flex-col items-start">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-bold text-blue-600 uppercase tracking-wider border border-blue-100">
                      {t('hospitalPortal' as any)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </NavLink>
          {isDonorPage && (
            <div className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
              {t('donorMode' as any)}
            </div>
          )}
        </div>

        <nav className="hidden items-center gap-2 xl:flex bg-slate-50/50 p-1.5 rounded-full border border-slate-100">
          {navItems.map((item) => {
            // Check if item should be disabled for pending hospitals
            // Dashboard is always enabled. Other items disabled if Pending.
            const isRestricted = isHospitalPending && item.path !== '/hospital';

            // On main page, Dashboard should be highlighted but not navigate
            if (isMainPage && item.labelKey === 'dashboard') {
              return (
                <button
                  key={item.path}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-full ${isHospitalPage ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-primary text-white'
                    }`}
                >
                  {(item as any).icon}
                  {t(item.labelKey as any)}
                </button>
              );
            }

            if (isRestricted) {
              return (
                <button
                  key={item.path}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-full group whitespace-nowrap text-slate-400 cursor-not-allowed opacity-60`}
                  title="Account pending approval"
                >
                  <span className="grayscale">{(item as any).icon}</span>
                  {t(item.labelKey as any)}
                </button>
              )
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/hospital' || item.path === '/'}
                className={({ isActive }) => {
                  if (isHospitalPage) {
                    return `flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-full group whitespace-nowrap ${isActive
                      ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-100'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                      }`;
                  }
                  return linkClasses({ isActive });
                }}
                state={isDonorContext ? { fromDonorContext: true } : undefined}
              >
                <span className={`transition-transform duration-300 group-hover:scale-110`}>{(item as any).icon}</span>
                {t(item.labelKey as any)}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <div className="flex rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 overflow-hidden">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-2 transition ${lang === 'en' ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}
            >
              ENG
            </button>
            <button
              type="button"
              onClick={() => setLanguage('am')}
              className={`px-3 py-2 transition ${lang === 'am' ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}
            >
              AMH
            </button>
          </div>

          {/* Notification Popover */}
          {isAuthenticated && (isDonorContext || isHospitalPage) && location.pathname !== '/notifications' && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-primary transition rounded-full hover:bg-slate-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-bounce-subtle">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                      <span className="font-semibold text-slate-900 text-sm">{t('notifications' as any)}</span>
                      <span onClick={handleMarkAllRead} className="text-xs text-primary font-medium cursor-pointer hover:underline">{t('markAllRead' as any)}</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-slate-400 text-sm">
                          {t('noNotifications' as any)}
                        </div>
                      ) : (
                        (Array.isArray(notifications) ? notifications : []).map((n) => (
                          <div key={n.id} className={`px-4 py-3 hover:bg-slate-50 transition cursor-pointer border-b border-slate-50 last:border-0 ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                            <div className="flex justify-between items-start mb-1">
                              <span className={`text-sm font-semibold ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>{n.type.replace(/_/g, ' ')}</span>
                              <span className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-center rounded-b-xl">
                      <NavLink
                        to="/notifications"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShowNotifications(false)}
                        className="text-sm font-medium text-primary hover:text-primary-dark transition"
                      >
                        {t('viewAllNotifications' as any)}
                      </NavLink>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Settings Menu for Donors & Hospitals */}
          {isAuthenticated && (isDonorContext || isHospitalPage) && (
            <div className="relative group">
              <button className="p-2 text-slate-500 hover:text-primary transition rounded-full hover:bg-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-top-right z-50">
                <NavLink
                  to={isHospitalPage ? "/hospital/edit-profile" : "/edit-donor"}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary"
                >
                  {t('editProfile' as any)}
                </NavLink>
                <button
                  onClick={() => {
                    openConfirmation(
                      t('deleteProfile' as any),
                      t('deleteProfileConfirmation' as any),
                      () => {
                        toast.info(t('deleteProfileSubmitted' as any));
                      },
                      'danger',
                      t('deleteProfile' as any)
                    );
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  {t('deleteProfile' as any)}
                </button>
              </div>
            </div>
          )}
          {!isAuthenticated ? (
            <NavLink
              to="/login"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              {t('login' as any)}
            </NavLink>
          ) : (
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              {t('logout' as any)}
            </button>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          className="xl:hidden rounded-full border border-primary/30 p-2 text-primary-dark"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {
        isOpen && (
          <div className="border-t border-white/60 bg-white px-4 py-4 md:hidden">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => {
                // Check if item should be disabled for pending hospitals
                const isRestricted = isHospitalPending && item.path !== '/hospital';

                // On main page, Dashboard should be highlighted but not navigate
                if (isMainPage && item.labelKey === 'dashboard') {
                  return (
                    <button
                      key={item.path}
                      type="button"
                      className="px-4 py-2 text-sm font-medium transition rounded-lg bg-primary text-white text-left"
                      onClick={() => setIsOpen(false)}
                    >
                      {t(item.labelKey as any)}
                    </button>
                  );
                }

                if (isRestricted) {
                  return (
                    <button
                      key={item.path}
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-400 bg-gray-50 rounded-lg cursor-not-allowed"
                      onClick={() => toast.error('Account pending approval')}
                    >
                      {(item as any).icon}
                      {t(item.labelKey as any)} (Pending)
                    </button>
                  )
                }

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={linkClasses}
                    onClick={() => setIsOpen(false)}
                    state={isDonorContext ? { fromDonorContext: true } : undefined}
                  >
                    {t(item.labelKey as any)}
                  </NavLink>
                );
              })}

              <div className="flex rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-2 transition ${lang === 'en' ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}
                >
                  ENG
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('am')}
                  className={`px-3 py-2 transition ${lang === 'am' ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}
                >
                  AMH
                </button>
              </div>

              {!isAuthenticated ? (
                <NavLink
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-red-700 transition"
                >
                  {t('login' as any)}
                </NavLink>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                    window.location.href = '/login';
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-red-700 transition"
                >
                  {t('logout' as any)}
                </button>
              )}
            </nav>
            <p className="mt-4 text-xs uppercase text-slate-400">
              {t('viewing' as any)}: {location.pathname || '/'}
            </p>
          </div>
        )
      }


      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmLabel={modalConfig.confirmLabel}
      />
    </header >
  );
};

export default MainNav;

