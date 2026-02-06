import { useEffect, useState } from 'react';
import { fetchDashboardStats, fetchDonationHistory } from '../../../controllers/adminController';
import type { DashboardStats } from '../../../models/Stats';
import type { DonationRecord } from '../../../models/Donation';

import { useNavigate } from 'react-router-dom';

const SuperAdminDashboardView = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null); // Use existing DashboardStats interface if suitable, or any for now
    const [donations, setDonations] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardStats().then(setStats).catch(err => console.error("Stats fetch failed", err));
        fetchDonationHistory().then(setDonations).catch(err => console.error("Donation fetch failed", err));
    }, []);

    // Calculate blood group data for charts
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const actualTotalVolume = stats?.availableBloodUnits || 0;
    const totalVolume = actualTotalVolume === 0 ? 1 : actualTotalVolume; // Prevent division by zero

    const bloodGroupData = bloodTypes.map(type => {
        const units = stats?.bloodGroups?.[type] || 0;
        // Mocking colors for each type
        const colors: { [key: string]: string } = {
            'A+': 'bg-blue-500', 'A-': 'bg-blue-300',
            'B+': 'bg-red-500', 'B-': 'bg-red-300',
            'AB+': 'bg-purple-500', 'AB-': 'bg-purple-300',
            'O+': 'bg-green-500', 'O-': 'bg-green-300'
        };
        return {
            type,
            percentage: ((units / totalVolume) * 100).toFixed(1),
            volume: units * 450, // Convert to ml for display if units are bags
            color: colors[type] || 'bg-gray-500'
        };
    });

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h2>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Donors */}
                <div className="bg-blue-100 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Donors</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.totalDonors || 0}</p>
                        </div>
                        <div className="bg-blue-200 rounded-full p-3">
                            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/super-admin/view-donors')}
                        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                        View Details
                    </button>
                </div>

                {/* Available Blood */}
                <div className="bg-green-100 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Available Blood (Units)</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.availableBloodUnits || 0}</p>
                        </div>
                        <div className="bg-green-200 rounded-full p-3">
                            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/super-admin/blood-stock')}
                        className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                    >
                        View Details
                    </button>
                </div>

                {/* Announcement */}
                <div className="bg-purple-100 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Announcement</p>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                        <div className="bg-purple-200 rounded-full p-3">
                            <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/super-admin/notifications')}
                        className="mt-4 w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
                    >
                        View Details
                    </button>
                </div>

                {/* Donate Blood */}
                <div className="bg-red-100 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Donate Blood</p>
                        </div>
                        <div className="bg-red-200 rounded-full p-3">
                            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/super-admin/donations')}
                        className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
                    >
                        Donate Blood Now!
                    </button>
                </div>
            </div>

            {/* Administration Console */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Admin Management */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">System Administration</h3>
                        <div className="p-2 bg-indigo-100 rounded-full">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Manage system administrators, permissions, and roles.</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => navigate('/super-admin/add-admin')} className="flex items-center justify-center gap-2 p-2 bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 border border-gray-200 hover:border-indigo-200 rounded-lg transition text-sm font-medium">
                            <span className="text-lg">+</span> Add Admin
                        </button>
                        <button onClick={() => navigate('/super-admin/manage-admins')} className="flex items-center justify-center gap-2 p-2 bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 border border-gray-200 hover:border-indigo-200 rounded-lg transition text-sm font-medium">
                            Manage Admins
                        </button>
                        <button onClick={() => navigate('/super-admin/manage-admins')} className="col-span-2 flex items-center justify-center gap-2 p-2 bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 border border-gray-200 hover:border-indigo-200 rounded-lg transition text-sm font-medium">
                            View Activity Logs
                        </button>
                    </div>
                </div>

                {/* Blood Request Management */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Blood Request Management</h3>
                        <div className="p-2 bg-red-100 rounded-full">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Oversee and process blood requests from hospitals.</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => navigate('/super-admin/blood-requests')} className="flex items-center justify-center gap-2 p-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg transition text-sm font-medium">
                            Approve Request
                        </button>
                        <button onClick={() => navigate('/super-admin/blood-requests')} className="flex items-center justify-center gap-2 p-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition text-sm font-medium">
                            Reject Request
                        </button>
                        <button onClick={() => navigate('/super-admin/request-history')} className="col-span-2 flex items-center justify-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg transition text-sm font-medium">
                            See All Request History
                        </button>
                    </div>
                </div>
            </div>

            {/* Pie Chart Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Total Available Blood According to Blood Groups</h3>
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 flex items-center justify-center">
                        <div className="relative w-64 h-64">
                            {/* Pie Chart */}
                            <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                                {bloodGroupData.map((item, index) => {
                                    const circumference = 2 * Math.PI * 40; // r=40
                                    const percent = parseFloat(item.percentage) || 0;
                                    const strokeLength = (percent / 100) * circumference;
                                    const gapLength = circumference - strokeLength;

                                    // Calculate offset based on previous items
                                    let offset = 0;
                                    for (let i = 0; i < index; i++) {
                                        const prevPercent = parseFloat(bloodGroupData[i].percentage) || 0;
                                        offset += (prevPercent / 100) * circumference;
                                    }

                                    // Colors map from tailwind classes to hex for stroke
                                    const colorMap: { [key: string]: string } = {
                                        'A+': '#3b82f6', 'A-': '#93c5fd', // blue-500, blue-300
                                        'B+': '#ef4444', 'B-': '#fca5a5', // red-500, red-300
                                        'AB+': '#a855f7', 'AB-': '#d8b4fe', // purple-500, purple-300
                                        'O+': '#22c55e', 'O-': '#86efac'  // green-500, green-300
                                    };

                                    return (
                                        <circle
                                            key={item.type}
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke={colorMap[item.type] || '#d1d5db'}
                                            strokeWidth="20"
                                            strokeDasharray={`${strokeLength} ${gapLength}`}
                                            strokeDashoffset={-offset}
                                        />
                                    );
                                })}
                                {/* Background circle if total is 0 to show empty state */}
                                {actualTotalVolume === 0 && (
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                                )}
                            </svg>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="space-y-3">
                            {bloodGroupData.map((item) => (
                                <div key={item.type} className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded ${item.color}`}></div>
                                    <span className="text-sm font-medium text-gray-700">{item.type}</span>
                                    <span className="text-sm text-gray-600 ml-auto font-semibold">{item.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Blood Group Volume Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {bloodGroupData.map((item) => (
                    <div key={item.type} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold text-gray-900">{item.type}</span>
                            <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{item.volume}ml</p>
                    </div>
                ))}
            </div>

            {/* Blood Donation Details Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Blood Donation Details</h3>
                    <button
                        onClick={() => navigate('/super-admin/donations')}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                        View All History
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Donor</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Medical Info</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Group</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Unit (ml)</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {donations.slice(0, 5).map((donation, index) => {
                                const isApproved = donation.status === 'Completed' || donation.status === 'Approved';
                                return (
                                    <tr key={donation.id || index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{donation.donorName}</span>
                                                <span className="text-xs text-gray-500">Age: {donation.donor?.age || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                {donation.donor?.medicalCondition || 'None'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{donation.bloodType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donation.units || '450'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(donation.donationDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {donation.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button className={`px-3 py-1.5 text-xs font-bold rounded shadow-sm border ${isApproved ? 'bg-white text-green-700 border-green-200' : 'bg-white text-gray-400 border-gray-200 cursor-not-allowed'}`}>
                                                {isApproved ? 'Added to Stock' : 'Pending/Rejected'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboardView;
