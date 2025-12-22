import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';

const SuperAdminSidebar = () => {
    const location = useLocation();
    const { t } = useLanguage();
    const { logout } = useAuth();
    const [expandedSections, setExpandedSections] = useState<string[]>(['admins']);

    const toggleSection = (section: string) => {
        setExpandedSections((prev) =>
            prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
        );
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
            <nav className="p-4 space-y-2 flex-1">
                <div className="px-4 py-3 mb-4">
                    <h2 className="text-xl font-bold text-purple-400">Super Admin</h2>
                </div>

                {/* Home */}
                <NavLink
                    to="/super-admin"
                    end
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-purple-600 text-white' : 'hover:bg-gray-800 text-white'
                        }`
                    }
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="font-medium">{t('home')}</span>
                </NavLink>

                {/* Admin Management Section */}
                <div>
                    <button
                        onClick={() => toggleSection('admins')}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-800 transition"
                    >
                        <div className="flex items-center gap-3">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span className="font-medium">Admin</span>
                        </div>
                        <svg
                            className={`h-4 w-4 transition-transform ${expandedSections.includes('admins') ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {expandedSections.includes('admins') && (
                        <div className="ml-8 mt-2 space-y-1">
                            <NavLink
                                to="/super-admin/add-admin"
                                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Add Admin
                            </NavLink>
                            <NavLink
                                to="/super-admin/view-admins"
                                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Admin Details
                            </NavLink>
                            <NavLink
                                to="/super-admin/edit-admin"
                                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Admin Details
                            </NavLink>
                            <NavLink
                                to="/super-admin/delete-admin"
                                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Admin Details
                            </NavLink>
                            <NavLink
                                to="/super-admin/manage-admins"
                                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                {t('manageAdmins' as any)}
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Donations */}
                <NavLink
                    to="/super-admin/donations"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/super-admin/donations')
                        ? 'bg-purple-600 text-white'
                        : 'hover:bg-gray-800 text-white'
                        }`}
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-medium">{t('donations')}</span>
                </NavLink>

                {/* Blood Requests Section */}
                <div>
                    <button
                        onClick={() => toggleSection('blood-requests')}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-800 transition"
                    >
                        <div className="flex items-center gap-3">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="font-medium">{t('bloodRequests')}</span>
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
                                to="/super-admin/blood-requests"
                                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {t('bloodRequests')}
                            </NavLink>
                            <NavLink
                                to="/super-admin/request-history"
                                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {t('requestHistory')}
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Blood Stock */}
                <NavLink
                    to="/super-admin/blood-stock"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/super-admin/blood-stock')
                        ? 'bg-purple-600 text-white'
                        : 'hover:bg-gray-800 text-white'
                        }`}
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="font-medium">{t('bloodStock')}</span>
                </NavLink>

                <button
                    onClick={() => {
                        logout();
                        window.location.href = '/login';
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
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

export default SuperAdminSidebar;
