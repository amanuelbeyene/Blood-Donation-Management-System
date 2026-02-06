import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchDashboardStats, fetchDonationHistory } from '../../../controllers/adminController';
import { useAuth } from '../../../contexts/AuthContext';

const StaffDashboardView = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchDashboardStats().then(setStats);
    }, []);

    const isMedical = user?.role === 'medical_staff';

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Welcome, {user?.fullName || (isMedical ? 'Medical Staff' : 'Staff Member')}</h2>
                    <p className="mt-1 text-gray-600">
                        {isMedical
                            ? "Manage medical screenings, lab tests, and donor health records."
                            : "Here's your daily overview and quick management tools."}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate(isMedical ? '/medical-staff/add-donor' : '/staff/add-donor')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Donor
                    </button>
                    <button
                        onClick={() => navigate(isMedical ? '/medical-staff/add-hospital' : '/staff/add-hospital')}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Hospital
                    </button>
                </div>
            </div>

            {/* Summary Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Donors */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Donors</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalDonors || 0}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Total Hospitals */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Hospitals</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalHospitals || 0}</h3>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Upcoming Appointments (or Tests for Medical) */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{isMedical ? 'Pending Tests' : 'Upcoming Appointments'}</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalAppointments || 0}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Available Blood Units */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Blood Units (Stock)</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats?.availableBloodUnits || 0}</h3>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Medical Staff Specific Section */}
            {isMedical && (
                <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 bg-gradient-to-r from-purple-50 to-white">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </span>
                        Medical Operations Center
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link to="/medical-staff/appointments" className="flex items-center gap-4 p-4 bg-white border border-purple-200 rounded-lg hover:shadow-md transition group">
                            <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Medical Health Screening</h4>
                                <p className="text-sm text-gray-500">Test donors for eligibility & health status.</p>
                            </div>
                            <span className="ml-auto text-purple-600 font-medium text-sm">Start Testing →</span>
                        </Link>
                        <Link to="/medical-staff/appointments" className="flex items-center gap-4 p-4 bg-white border border-red-200 rounded-lg hover:shadow-md transition group">
                            <div className="p-3 bg-red-100 rounded-full group-hover:bg-red-200 transition">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Blood Testing Laboratory</h4>
                                <p className="text-sm text-gray-500">Process and verify donor blood samples.</p>
                            </div>
                            <span className="ml-auto text-red-600 font-medium text-sm">Go to Lab →</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Quick Actions Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Donor Management */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </span>
                        Manage Donors
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to={isMedical ? "/medical-staff/view-donors" : "/staff/view-donors"} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            <span className="text-gray-900 font-medium">View All Donors</span>
                            <span className="text-xs text-gray-500 mt-1">Full Directory</span>
                        </Link>
                        <Link to={isMedical ? "/medical-staff/find-donor" : "/staff/find-donor"} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            <span className="text-gray-900 font-medium">Find Donor</span>
                            <span className="text-xs text-gray-500 mt-1">By Location/Phone</span>
                        </Link>
                        <Link to={isMedical ? "/medical-staff/donor-approval" : "/staff/donor-approval"} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            <span className="text-gray-900 font-medium">Approvals</span>
                            <span className="text-xs text-gray-500 mt-1">Pending Requests</span>
                        </Link>
                        <Link to={isMedical ? "/medical-staff/appointments" : "/staff/appointments"} className="flex flex-col items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition">
                            <span className="font-medium">Notify Donors</span>
                            <span className="text-xs opacity-75 mt-1">Send SMS/Email</span>
                        </Link>
                    </div>
                </div>

                {/* Hospital Management */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="p-2 bg-orange-100 rounded-lg text-orange-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </span>
                        Manage Hospitals
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to={isMedical ? "/medical-staff/view-hospitals" : "/staff/view-hospitals"} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            <span className="text-gray-900 font-medium">View Hospitals</span>
                            <span className="text-xs text-gray-500 mt-1">Directory & Stock</span>
                        </Link>
                        <Link to={isMedical ? "/medical-staff/find-hospital" : "/staff/find-hospital"} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            <span className="text-gray-900 font-medium">Find Hospital</span>
                            <span className="text-xs text-gray-500 mt-1">By Location/Phone</span>
                        </Link>
                        <Link to={isMedical ? "/medical-staff/hospital-approval" : "/staff/hospital-approval"} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            <span className="text-gray-900 font-medium">Approvals</span>
                            <span className="text-xs text-gray-500 mt-1">New Registrations</span>
                        </Link>
                        <Link to={isMedical ? "/medical-staff/hospital-activity" : "/staff/hospital-activity"} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            <span className="text-gray-900 font-medium">Activity Log</span>
                            <span className="text-xs text-gray-500 mt-1">Track Changes</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Upcoming Appointments Quick View */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Appointment & Notification Center</h3>
                        <p className="text-sm text-gray-500">Manage upcoming donor appointments.</p>
                    </div>
                    <Link to={isMedical ? "/medical-staff/appointments" : "/staff/appointments"} className="text-sm text-purple-600 font-medium hover:text-purple-800 hover:underline">
                        View All Appointments
                    </Link>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                        Use the <b>Find Donor</b> feature to look up donors by phone or location, or manage confirmed appointments below.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate(isMedical ? "/medical-staff/find-donor" : "/staff/find-donor")}
                            className="flex-1 bg-gray-50 text-gray-700 py-3 rounded-lg border border-dashed border-gray-300 font-medium hover:bg-gray-100 hover:border-gray-400 transition"
                        >
                            🔍 Search Donor to Notify
                        </button>
                        <button
                            onClick={() => navigate(isMedical ? "/medical-staff/appointments" : "/staff/appointments")}
                            className="flex-1 bg-gray-50 text-gray-700 py-3 rounded-lg border border-dashed border-gray-300 font-medium hover:bg-gray-100 hover:border-gray-400 transition"
                        >
                            📅 View Today's Schedule
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboardView;
