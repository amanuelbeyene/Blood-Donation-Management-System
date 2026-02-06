import { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { fetchDonors } from '../../../controllers/donorController';
import { Donor } from '../../../models/Donor';

const DonorActivityView = () => {
    const { t } = useLanguage();
    const [donors, setDonors] = useState<Donor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDonors = async () => {
            try {
                const data = await fetchDonors();
                setDonors(data);
            } catch (error) {
                console.error("Failed to fetch donors", error);
            } finally {
                setLoading(false);
            }
        };
        loadDonors();
    }, []);

    if (loading) return <div className="p-6">Loading donor activity...</div>;

    // Calculate Aggregates
    const activeDonorsCount = donors.filter(d => d.status === 'Active' || d.status?.toLowerCase() === 'active').length;
    const totalDonationsCount = donors.reduce((sum, d) => sum + (d.totalDonations || 0), 0);

    // Impact Score Calculation (if not present) implies 1 donation = ~3 lives or similar metrics
    // Ideally use d.impactScore from backend if available

    // Sort by recent activity or impact
    const sortedDonors = [...donors].sort((a, b) => (b.totalDonations || 0) - (a.totalDonations || 0));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Donor Activity Monitor</h2>
                    <p className="text-gray-600 mt-1">Track donor engagement, total donations, and system usage.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <span className="flex-1 sm:flex-none px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium text-center">
                        Active Donors: {activeDonorsCount}
                    </span>
                    <span className="flex-1 sm:flex-none px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium text-center">
                        Total Donors: {donors.length}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-100 p-6 rounded-xl shadow-sm border border-red-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-gray-600 text-sm font-medium uppercase">Total Donations Made</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {totalDonationsCount}
                            </p>
                        </div>
                        <div className="bg-red-200 p-3 rounded-lg">
                            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-gray-600 text-sm font-medium uppercase">Active Donors</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {activeDonorsCount}
                            </p>
                        </div>
                        <div className="bg-blue-200 p-3 rounded-lg">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-green-100 p-6 rounded-xl shadow-sm border border-green-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-gray-600 text-sm font-medium uppercase">Avg. Time on System</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
                        </div>
                        <div className="bg-green-200 p-3 rounded-lg">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Detailed Donor Activity Logs</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Donor Name</th>
                                <th className="px-6 py-4">Blood Type</th>
                                <th className="px-6 py-4">Total Donations</th>
                                <th className="px-6 py-4">Last Donation</th>
                                <th className="px-6 py-4">Time on System</th>
                                <th className="px-6 py-4">Last Active</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {sortedDonors.map((donor) => (
                                <tr key={donor.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">
                                                {donor.fullName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{donor.fullName}</div>
                                                <div className="text-xs text-gray-500">Score: {donor.impactScore || 0}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                            {donor.bloodType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-sm font-bold text-gray-900">{donor.totalDonations || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm text-gray-900">--</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        --
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${(donor.status?.toLowerCase() === 'active') ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'}`}>
                                            <span className={`w-2 h-2 mr-1.5 rounded-full 
                                                ${(donor.status?.toLowerCase() === 'active') ? 'bg-green-400' :
                                                    'bg-gray-400'}`}></span>
                                            {donor.status || 'Unknown'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DonorActivityView;
