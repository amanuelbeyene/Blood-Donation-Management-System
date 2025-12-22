import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';

const AdminHeader = () => {
  const { lang, setLanguage, t } = useLanguage();

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
        <NavLink
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-700 transition"
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
        </NavLink>
      </div>
    </header>
  );
};

export default AdminHeader;

