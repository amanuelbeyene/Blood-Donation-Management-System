import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const StaffSidebar = ({ isOpen = false, onClose }: SidebarProps) => {
    const location = useLocation();
    const { t } = useLanguage();
    const { logout, user } = useAuth();
    const [expandedSections, setExpandedSections] = useState<string[]>([]);

    // Determine base path based on user role (medical_staff -> /medical-staff, staff -> /staff)
    // Default to /staff if role is undefined (though it should be defined here)
    const basePath = user?.role === 'medical_staff' ? '/medical-staff' : '/staff';

    const toggleSection = (section: string) => {
        setExpandedSections((prev) =>
            prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
        );
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white min-h-screen flex flex-col transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:static lg:h-screen lg:overflow-y-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-4 mb-4 flex items-center gap-3 border-b border-gray-800">
                    {user?.profilePicture ? (
                        <img
                            src={user.profilePicture}
                            alt="Profile"
                            className="h-10 w-10 rounded-full object-cover border-2 border-red-500"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-lg">
                            {user?.name?.charAt(0) || 'S'}
                        </div>
                    )}
                    <div>
                        <h2 className="text-sm font-bold text-red-500">{user?.role === 'medical_staff' ? 'Medical Staff Portal' : 'Staff Portal'}</h2>
                        <p className="text-xs text-gray-400 truncate w-32">{user?.name || 'Staff'}</p>
                    </div>
                </div>

                <nav className="p-4 space-y-2 flex-1">
                    {/* Dashboard */}
                    <NavLink
                        to={basePath}
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-red-600 text-white' : 'hover:bg-gray-800 text-white'
                            }`
                        }
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="font-medium">Dashboard</span>
                    </NavLink>

                    {/* Donors Section */}
                    <div>
                        <button
                            onClick={() => toggleSection('donors')}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-800 transition"
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
                                    to={`${basePath}/find-donor`}
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm text-gray-300"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7a4 4 0 118 0v1h1a3 3 0 013 3v3a1 1 0 01-1 1h-1l-2 4H9l-2-4H6a1 1 0 01-1-1v-3a3 3 0 013-3h1V7z" />
                                    </svg>
                                    {t('findDonor')}
                                </NavLink>
                                <NavLink
                                    to={`${basePath}/add-donor`}
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm text-gray-300"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    {t('addDonor')}
                                </NavLink>
                                <NavLink
                                    to={`${basePath}/view-donors`}
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm text-gray-300"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    {t('viewDonorDetails')}
                                </NavLink>
                                <NavLink
                                    to={`${basePath}/edit-donor`}
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm text-gray-300"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    {t('editDonorDetails')}
                                </NavLink>
                                <NavLink
                                    to={`${basePath}/delete-donor`}
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm text-gray-300"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    {t('deleteDonorDetails')}
                                </NavLink>
                                <NavLink
                                    to={`${basePath}/manage-donors`}
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm text-gray-300"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    {t('manageDonors' as any)}
                                </NavLink>

                            </div>
                        )}
                    </div>

                    {/* Hospitals Section */}
                    <div>
                        <button
                            onClick={() => toggleSection('hospitals')}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-800 transition"
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
                                    to={`${basePath}/find-hospital`}
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm text-gray-300"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7a4 4 0 118 0v1h1a3 3 0 013 3v3a1 1 0 01-1 1h-1l-2 4H9l-2-4H6a1 1 0 01-1-1v-3a3 3 0 013-3h1V7z" />
                                    </svg>
                                    {t('findHospital')}
                                </NavLink>
                                <NavLink
                                    to={`${basePath}/add-hospital`}
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm text-gray-300"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    {t('addHospital')}
                                </NavLink>
                                <NavLink
                                    to={`${basePath}/view-hospitals`}
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm text-gray-300"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    {t('viewHospitalDetails')}
                                </NavLink>
                                <NavLink
                                    to={`${basePath}/edit-hospital`}
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm text-gray-300"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    {t('editHospitalDetails')}
                                </NavLink>
                                <NavLink
                                    to={`${basePath}/delete-hospital`}
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm text-gray-300"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    {t('deleteHospitalDetails')}
                                </NavLink>
                                <NavLink
                                    to={`${basePath}/hospital-activity`}
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm text-gray-300"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Manage Hospital (Activity)
                                </NavLink>

                            </div>
                        )}
                    </div>

                    {/* Appointments */}
                    <NavLink
                        to={`${basePath}/appointments`}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-red-600 text-white' : 'hover:bg-gray-800 text-white'
                            }`
                        }
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">Appointments</span>
                    </NavLink>

                    <button
                        onClick={() => {
                            logout();
                            window.location.href = '/login';
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Log Out</span>
                    </button>
                </nav>
            </aside>
        </>
    );
};

export default StaffSidebar;
