import { useEffect, useState } from 'react';
import { fetchDashboardStats, fetchDonationHistory } from '../../../controllers/adminController';
import type { DashboardStats } from '../../../models/Stats';
import type { DonationRecord } from '../../../models/Donation';

const SuperAdminDashboardView = () => {
    const [stats, setStats] = useState<DashboardStats>();
    const [donations, setDonations] = useState<DonationRecord[]>([]);

    useEffect(() => {
        fetchDashboardStats().then(setStats);
        fetchDonationHistory().then(setDonations);
    }, []);

    // Mock data for pie chart
    const bloodGroupData = [
        { type: 'AB+', percentage: 18.2, volume: 3380, color: 'bg-blue-500' },
        { type: 'AB-', percentage: 18.2, volume: 1110, color: 'bg-orange-500' },
        { type: 'B+', percentage: 9.1, volume: 470, color: 'bg-red-500' },
        { type: 'B-', percentage: 18.2, volume: 8900, color: 'bg-green-500' },
        { type: 'O+', percentage: 27.3, volume: 955, color: 'bg-purple-500' },
        { type: 'O-', percentage: 9.1, volume: 920, color: 'bg-cyan-500' },
    ];

    const additionalBloodGroups = [
        { type: 'A+', volume: 1100 },
        { type: 'A-', volume: 2560 },
    ];

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
                            <p className="text-2xl font-bold text-gray-900">6</p>
                        </div>
                        <div className="bg-blue-200 rounded-full p-3">
                            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                    <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                        View Details
                    </button>
                </div>

                {/* Available Blood */}
                <div className="bg-green-100 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Available Blood</p>
                            <p className="text-2xl font-bold text-gray-900">11</p>
                        </div>
                        <div className="bg-green-200 rounded-full p-3">
                            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>
                    <button className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">
                        View Details
                    </button>
                </div>

                {/* Announcement */}
                <div className="bg-purple-100 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Announcement</p>
                            <p className="text-2xl font-bold text-gray-900">2</p>
                        </div>
                        <div className="bg-purple-200 rounded-full p-3">
                            <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                        </div>
                    </div>
                    <button className="mt-4 w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
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
                    <button className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">
                        Donate Blood Now!
                    </button>
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
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="45.8 205.2" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="20" strokeDasharray="45.8 205.2" strokeDashoffset="-45.8" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray="22.9 228.1" strokeDashoffset="-91.6" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="20" strokeDasharray="45.8 205.2" strokeDashoffset="-114.5" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#a855f7" strokeWidth="20" strokeDasharray="68.6 182.4" strokeDashoffset="-160.3" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#06b6d4" strokeWidth="20" strokeDasharray="22.9 228.1" strokeDashoffset="-228.9" />
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
                {[...bloodGroupData, ...additionalBloodGroups].map((item) => (
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

            {/* Summary Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-sm text-gray-600">Available Donors</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">24</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <p className="text-sm text-gray-600">Total Requests</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">17</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <p className="text-sm text-gray-600">Total Blood Unit (ml)</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">11415 ml</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-sm text-gray-600">Approved Requests</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">25</p>
                </div>
            </div>

            {/* Blood Donation Details Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Blood Donation Details</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor's Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disease</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {donations.slice(0, 3).map((donation, index) => {
                                const mockData = [
                                    { name: 'Christine', disease: 'Nothing', age: 25, bloodGroup: 'AB+', unit: 440, date: 'June 7, 2021', status: 'Approved' },
                                    { name: 'Larry', disease: 'Nothing', age: 29, bloodGroup: 'O-', unit: 470, date: 'June 7, 2021', status: 'Approved' },
                                    { name: 'Diane', disease: 'Nothing', age: 28, bloodGroup: 'B-', unit: 480, date: 'June 7, 2021', status: 'Rejected' },
                                ];
                                const data = mockData[index] || { name: donation.donorName, disease: 'Nothing', age: 25, bloodGroup: donation.bloodType, unit: donation.units, date: new Date(donation.donationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), status: 'Approved' };
                                const isApproved = data.status === 'Approved';
                                return (
                                    <tr key={donation.id || index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.disease}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.age}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.bloodGroup}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.unit}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {data.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button className={`px-3 py-1 text-xs font-semibold rounded ${isApproved ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                                {isApproved ? `${data.unit} Unit Added To Stock` : '0 Unit Added To Stock'}
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
