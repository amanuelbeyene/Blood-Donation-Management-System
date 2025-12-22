import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';

const donorNavItems = [
  { path: '/donor-dashboard', labelKey: 'dashboard' },
  { path: '/register', labelKey: 'register' },
  { path: '/awards', labelKey: 'awards' },
];

const hospitalNavItems = [
  { path: '/hospital', labelKey: 'dashboard' },
  { path: '/hospital/emergency-request', labelKey: 'emergencyRequest' },
  { path: '/hospital/find-donors', labelKey: 'findDonor' },
  { path: '/hospital/my-requests', labelKey: 'myRequests' },
];

const MainNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { lang, toggleLanguage, t, setLanguage } = useLanguage();
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  // Show "Donor Mode" only on specific donor dashboard pages, NOT on public pages like register/awards
  const isDonorPage = location.pathname.startsWith('/donor-dashboard') || (isAuthenticated && location.pathname.startsWith('/donors'));

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
      return `px-4 py-2 text-sm font-medium transition rounded-lg ${isActive
        ? 'bg-blue-600 text-white'
        : 'text-slate-700 hover:bg-blue-50'
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

  // State for Notifications
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock Notifications
  const notifications = [
    { id: 1, title: 'Urgent Request', message: 'O+ blood needed at Black Lion Hospital', time: '10m ago', unread: true },
    { id: 2, title: 'Appointment Confirmed', message: 'Your donation is scheduled for tomorrow', time: '1h ago', unread: false },
    { id: 3, title: 'System Update', message: 'Maintenance scheduled for tonight', time: '5h ago', unread: false },
  ];

  return (
    <header className={`border-b border-white/60 bg-white/70 backdrop-blur ${stickyClass}`}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <NavLink to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold text-white ${isHospitalPage ? 'bg-blue-600 shadow-sm' : 'bg-primary'
                }`}
            >
              B
            </div>
            <p className="font-display text-lg font-semibold text-slate-900">BDMS Ethiopia</p>
          </NavLink>
          {isDonorPage && (
            <div className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
              Donor Mode
            </div>
          )}
          {isHospitalPage && (
            <div className="hidden sm:flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              Hospital Portal
            </div>
          )}
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            // On main page, Dashboard should be highlighted but not navigate
            if (isMainPage && item.labelKey === 'dashboard') {
              return (
                <button
                  key={item.path}
                  type="button"
                  className={`px-4 py-2 text-sm font-medium transition rounded-full ${isHospitalPage ? 'bg-blue-600 text-white shadow-sm' : 'bg-primary text-white'
                    }`}
                >
                  {t(item.labelKey as any)}
                </button>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => {
                  if (isHospitalPage) {
                    return `px-4 py-2 text-sm font-medium transition rounded-full ${isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                      }`;
                  }
                  return linkClasses({ isActive });
                }}
                state={isDonorContext ? { fromDonorContext: true } : undefined}
              >
                {t(item.labelKey as any)}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
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
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-600 border-2 border-white"></span>
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                      <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                      <span className="text-xs text-primary font-medium cursor-pointer">Mark all read</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className={`px-4 py-3 hover:bg-slate-50 transition cursor-pointer border-b border-slate-50 last:border-0 ${n.unread ? 'bg-blue-50/50' : ''}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-sm font-semibold ${n.unread ? 'text-slate-900' : 'text-slate-700'}`}>{n.title}</span>
                            <span className="text-xs text-slate-400">{n.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">{n.message}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-center rounded-b-xl">
                      <NavLink
                        to="/notifications"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShowNotifications(false)}
                        className="text-sm font-medium text-primary hover:text-primary-dark transition"
                      >
                        View All Notifications
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
                  Edit Profile
                </NavLink>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
                      alert('Profile delete request submitted.');
                    }
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete Profile
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
          className="md:hidden rounded-full border border-primary/30 p-2 text-primary-dark"
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
              Viewing: {location.pathname || '/'}
            </p>
          </div>
        )
      }
    </header >
  );
};

export default MainNav;

