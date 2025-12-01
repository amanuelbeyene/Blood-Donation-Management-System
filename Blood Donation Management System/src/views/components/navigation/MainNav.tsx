import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const donorNavItems = [
  { path: '/donor-dashboard', label: 'Dashboard' },
  { path: '/register', label: 'Register' },
  { path: '/donors', label: 'Find Donors' },
];

const hospitalNavItems = [
  { path: '/hospital', label: 'Dashboard' },
  { path: '/hospital/emergency-request', label: 'Emergency Request' },
  { path: '/hospital/find-donors', label: 'Find Donors' },
  { path: '/hospital/my-requests', label: 'My Requests' },
];

const MainNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Show "Donor Mode" only on donor pages, not on main page
  const isDonorPage = location.pathname !== '/' && 
    (location.pathname.startsWith('/donor') || 
     location.pathname.startsWith('/register') || 
     location.pathname.startsWith('/donors'));

  // Show "Hospital Mode" on hospital pages
  const isHospitalPage = location.pathname.startsWith('/hospital');

  // Use appropriate nav items based on page type
  const navItems = isHospitalPage ? hospitalNavItems : donorNavItems;

  const linkClasses = ({ isActive }: { isActive: boolean }) => {
    if (isHospitalPage) {
      return `px-4 py-2 text-sm font-medium transition rounded-lg ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-slate-700 hover:bg-blue-50'
      }`;
    }
    return `px-4 py-2 text-sm font-medium transition rounded-lg ${
      isActive
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

  return (
    <header className={`border-b border-white/60 bg-white/70 backdrop-blur ${stickyClass}`}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <NavLink to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold text-white ${
                isHospitalPage ? 'bg-blue-600' : 'bg-primary'
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
            <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              Hospital Mode
            </div>
          )}
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            // On main page, Dashboard should be highlighted but not navigate
            if (isMainPage && item.label === 'Dashboard') {
              return (
                <button
                  key={item.path}
                  type="button"
                  className="px-4 py-2 text-sm font-medium transition rounded-lg bg-primary text-white"
                >
                  {item.label}
                </button>
              );
            }
            return (
              <NavLink key={item.path} to={item.path} className={linkClasses}>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isMainPage ? (
            <NavLink
              to="/login"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              Log In
            </NavLink>
          ) : (
            <NavLink
              to="/"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              Log Out
            </NavLink>
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

      {isOpen && (
        <div className="border-t border-white/60 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col space-y-3">
            {navItems.map((item) => {
              // On main page, Dashboard should be highlighted but not navigate
              if (isMainPage && item.label === 'Dashboard') {
                return (
                  <button
                    key={item.path}
                    type="button"
                    className="px-4 py-2 text-sm font-medium transition rounded-lg bg-primary text-white text-left"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </button>
                );
              }
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={linkClasses}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </NavLink>
              );
            })}
            {isMainPage ? (
              <NavLink
                to="/login"
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                Log In
              </NavLink>
            ) : (
              <NavLink
                to="/"
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                Log Out
              </NavLink>
            )}
          </nav>
          <p className="mt-4 text-xs uppercase text-slate-400">
            Viewing: {location.pathname || '/'}
          </p>
        </div>
      )}
    </header>
  );
};

export default MainNav;

