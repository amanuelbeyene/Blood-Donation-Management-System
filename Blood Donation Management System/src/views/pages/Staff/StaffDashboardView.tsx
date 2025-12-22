import React from 'react';
import { Link } from 'react-router-dom';

const StaffDashboardView = () => {
    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Welcome, Staff Member</h2>
                <p className="mt-2 text-gray-600">Access your daily tasks and management tools below.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Manage Donors Card */}
                <Link to="/staff/view-donors" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Manage Donors</h3>
                        <div className="p-3 bg-rose-100 rounded-full text-rose-600">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-gray-500">View, add, edit, and manage registered donors.</p>
                </Link>

                {/* Manage Hospitals Card */}
                <Link to="/staff/view-hospitals" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Manage Hospitals</h3>
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-gray-500">View and manage hospital partnerships and requests.</p>
                </Link>

                {/* Appointments Card */}
                <Link to="/staff/appointments" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Appointments</h3>
                        <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-gray-500">Track and manage upcoming blood donation appointments.</p>
                </Link>
            </div>
        </div>
    );
};

export default StaffDashboardView;
