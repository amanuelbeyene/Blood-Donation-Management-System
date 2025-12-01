import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';

const AdminSidebar = () => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['donors', 'hospitals', 'blood-requests']);

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
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            isActive('/dashboard')
              ? 'bg-white text-gray-900'
              : 'hover:bg-gray-700 text-white'
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="font-medium">Home</span>
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
              <span className="font-medium">Donors</span>
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
                to="/admin/add-donor"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Donor
              </NavLink>
              <NavLink
                to="/admin/view-donors"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Donor Details
              </NavLink>
              <NavLink
                to="/admin/edit-donor"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Donor Details
              </NavLink>
              <NavLink
                to="/admin/delete-donor"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Donor Details
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
              <span className="font-medium">Hospitals</span>
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
                to="/admin/add-hospital"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Hospital
              </NavLink>
              <NavLink
                to="/admin/view-hospitals"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Hospital Details
              </NavLink>
              <NavLink
                to="/admin/edit-hospital"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Hospital Details
              </NavLink>
              <NavLink
                to="/admin/delete-hospital"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Hospital Details
              </NavLink>
            </div>
          )}
        </div>

        {/* Donations */}
        <NavLink
          to="/admin/donations"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            isActive('/admin/donations')
              ? 'bg-white text-gray-900'
              : 'hover:bg-gray-700 text-white'
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="font-medium">Donations</span>
        </NavLink>

        {/* Blood Requests Section */}
        <div>
          <button
            onClick={() => toggleSection('blood-requests')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="font-medium">Blood Requests</span>
            </div>
            <svg
              className={`h-4 w-4 transition-transform ${expandedSections.includes('blood-requests') ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.includes('blood-requests') && (
            <div className="ml-8 mt-2 space-y-1">
              <NavLink
                to="/admin/blood-requests"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Blood Requests
              </NavLink>
              <NavLink
                to="/admin/request-history"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Request History
              </NavLink>
            </div>
          )}
        </div>

        {/* Blood Stock */}
        <NavLink
          to="/admin/blood-stock"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            isActive('/admin/blood-stock')
              ? 'bg-white text-gray-900'
              : 'hover:bg-gray-700 text-white'
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="font-medium">Blood Stock</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;

