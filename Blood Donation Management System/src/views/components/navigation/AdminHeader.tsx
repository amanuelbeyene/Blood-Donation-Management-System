import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';

const AdminHeader = () => {
  const { lang, setLanguage, t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-red-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <NavLink to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-semibold text-red-600">
          B
        </div>
        <p className="font-display text-lg font-semibold">BDMS</p>
      </NavLink>
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
            AMH
          </button>
        </div>
        {/* Notification Bell */}
        <button className="relative p-2 text-white hover:bg-red-700 transition rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-white border-2 border-red-600"></span>
        </button>
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
    </header>
  );
};

export default AdminHeader;

