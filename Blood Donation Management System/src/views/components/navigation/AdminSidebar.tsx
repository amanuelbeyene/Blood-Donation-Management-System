import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { logout } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>(['donors', 'hospitals', 'donor-status', 'hospital-status']);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  return (
    <aside className="w-64 bg-gray-800 text-white h-full overflow-y-auto flex-shrink-0">
      <nav className="p-4 space-y-2">
        {/* Home */}
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-white text-gray-900' : 'hover:bg-gray-700 text-white'
            }`
          }
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="font-medium">{t('home')}</span>
        </NavLink>

        {/* Staff Section */}
        <div>
          <button
            onClick={() => toggleSection('staff')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="font-medium">{t('staff' as any)}</span>
            </div>
            <svg
              className={`h-4 w-4 transition-transform ${expandedSections.includes('staff') ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.includes('staff') && (
            <div className="ml-8 mt-2 space-y-1">
              <NavLink
                to="/admin/add-staff"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('addStaff' as any)}
              </NavLink>
              <NavLink
                to="/admin/view-staff"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {t('viewStaffDetails' as any)}
              </NavLink>
              <NavLink
                to="/admin/edit-staff"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t('editStaffDetails' as any)}
              </NavLink>
              <NavLink
                to="/admin/delete-staff"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {t('deleteStaffDetails' as any)}
              </NavLink>
              <NavLink
                to="/admin/manage-staff"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {t('manageStaff' as any)}
              </NavLink>
            </div>
          )}
        </div>

        {/* Donors and Hospitals sections moved to Staff Sidebar by Request */}

        {/* Donor Status Section */}
        <div>
          <button
            onClick={() => toggleSection('donor-status')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Donor Status</span>
            </div>
            <svg
              className={`h-4 w-4 transition-transform ${expandedSections.includes('donor-status') ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.includes('donor-status') && (
            <div className="ml-8 mt-2 space-y-1">
              <NavLink
                to="/admin/donor-approval"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Pending Donor
              </NavLink>
              <NavLink
                to="/admin/approve-donor"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve Donor
              </NavLink>
              <NavLink
                to="/admin/reject-donor"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject Donor
              </NavLink>
            </div>
          )}
        </div>

        {/* Hospital Status Section */}
        <div>
          <button
            onClick={() => toggleSection('hospital-status')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-medium">Hospital Status</span>
            </div>
            <svg
              className={`h-4 w-4 transition-transform ${expandedSections.includes('hospital-status') ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.includes('hospital-status') && (
            <div className="ml-8 mt-2 space-y-1">
              <NavLink
                to="/admin/hospital-approval"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Pending Hospital
              </NavLink>
              <NavLink
                to="/admin/approve-hospital"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve Hospital
              </NavLink>
              <NavLink
                to="/admin/reject-hospital"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject Hospital
              </NavLink>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-gray-700 transition mt-auto"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium">Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
