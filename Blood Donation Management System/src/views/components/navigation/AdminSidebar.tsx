import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

const AdminSidebar = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<string[]>(['donors', 'hospitals', 'donor-status', 'hospital-status']);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen">
      <nav className="p-4 space-y-2">
        {/* Home */}
        <NavLink
          to="/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/dashboard')
            ? 'bg-white text-gray-900'
            : 'hover:bg-gray-700 text-white'
            }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="font-medium">{t('home')}</span>
        </NavLink>

        {/* Donors Section */}
        <div>
          <button
            onClick={() => toggleSection('donors')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">{t('donors')}</span>
            </div>
            <svg
              className={`h-4 w-4 transition-transform ${expandedSections.includes('donors') ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.includes('donors') && (
            <div className="ml-8 mt-2 space-y-1">
              <NavLink
                to="/admin/find-donor"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7a4 4 0 118 0v1h1a3 3 0 013 3v3a1 1 0 01-1 1h-1l-2 4H9l-2-4H6a1 1 0 01-1-1v-3a3 3 0 013-3h1V7z" />
                </svg>
                {t('findDonor')}
              </NavLink>
              <NavLink
                to="/admin/add-donor"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('addDonor')}
              </NavLink>
              <NavLink
                to="/admin/view-donors"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {t('viewDonorDetails')}
              </NavLink>
              <NavLink
                to="/admin/edit-donor"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t('editDonorDetails')}
              </NavLink>
              <NavLink
                to="/admin/delete-donor"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {t('deleteDonorDetails')}
              </NavLink>
            </div>
          )}
        </div>

        {/* Hospitals Section */}
        <div>
          <button
            onClick={() => toggleSection('hospitals')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-medium">{t('hospitals')}</span>
            </div>
            <svg
              className={`h-4 w-4 transition-transform ${expandedSections.includes('hospitals') ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.includes('hospitals') && (
            <div className="ml-8 mt-2 space-y-1">
              <NavLink
                to="/admin/find-hospital"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7a4 4 0 118 0v1h1a3 3 0 013 3v3a1 1 0 01-1 1h-1l-2 4H9l-2-4H6a1 1 0 01-1-1v-3a3 3 0 013-3h1V7z" />
                </svg>
                {t('findHospital')}
              </NavLink>
              <NavLink
                to="/admin/add-hospital"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('addHospital')}
              </NavLink>
              <NavLink
                to="/admin/view-hospitals"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {t('viewHospitalDetails')}
              </NavLink>
              <NavLink
                to="/admin/edit-hospital"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t('editHospitalDetails')}
              </NavLink>
              <NavLink
                to="/admin/delete-hospital"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {t('deleteHospitalDetails')}
              </NavLink>
            </div>
          )}
        </div>

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
                Approval Page
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
                Approval Page
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
      </nav>
    </aside>
  );
};


export default AdminSidebar;

