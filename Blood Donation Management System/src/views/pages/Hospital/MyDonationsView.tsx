import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { fetchDonations, updateDonation } from '../../../controllers/donationController';
import type { DonationRecord } from '../../../models/Donation';

const MyDonationsView = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [donations, setDonations] = useState<DonationRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(true);
            fetchDonations().then(data => {
                console.log("All Donations Fetched:", data);
                console.log("Current User:", user);

                // Filter donations for this hospital
                // Try to match by ID first (more robust), then Name
                const myDonations = data.filter(d => {
                    const record = d as any; // Cast to access potential hospitalId from backend
                    const idMatch = record.hospitalId && record.hospitalId === user.id;
                    const nameMatch = d.hospital === user.name;
                    // Filter out Rejected
                    const notRejected = d.status !== 'Rejected' && d.status !== 'rejected';
                    return (idMatch || nameMatch) && notRejected;
                });

                console.log("Filtered Donations:", myDonations);
                setDonations(myDonations);
            }).catch(err => {
                console.error(err);
                if (toast) toast.error("Failed to load donations");
                setDonations([]);
            }).finally(() => {
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleDonate = async (donation: DonationRecord) => {
        try {
            await updateDonation(donation.id, { status: 'completed' });
            toast.success("Donation marked as Completed");
            // Refresh local state
            setDonations(prev => prev.map(d => d.id === donation.id ? { ...d, status: 'completed' } : d));
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    const handleClear = async (donation: DonationRecord) => {
        // "Clear the choose only" -> Revert "Donate" action
        try {
            if (donation.status === 'completed' || donation.status === 'Completed') {
                await updateDonation(donation.id, { status: 'in_progress' });
                toast.success("Status reverted to In Progress");
                setDonations(prev => prev.map(d => d.id === donation.id ? { ...d, status: 'in_progress' } : d));
            }
            // Do not delete/reject if In Progress, as per user request
        } catch (error) {
            console.error(error);
            toast.error("Failed to clear action");
        }
    };

    const statusBadge = (status: string) => {
        if (status === 'in_progress') return 'bg-blue-100 text-blue-800';
        return status === 'completed' || status === 'Completed'
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800';
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl bg-white border border-slate-200 p-8 shadow-lg">
                <h1 className="text-2xl font-bold text-slate-900">My Donations</h1>
                <p className="mt-2 text-slate-600">View all donations received by your hospital.</p>

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : donations.length === 0 ? (
                    <div className="mt-12 flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                            <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">No Donations Found</h2>
                        <p className="mt-2 text-slate-600">
                            Your hospital hasn't received any donations yet.
                        </p>
                    </div>
                ) : (
                    <div className="mt-8 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                                    <th className="py-3 font-medium">Donor Name</th>
                                    <th className="py-3 font-medium">Blood Type</th>
                                    <th className="py-3 font-medium">Units</th>
                                    <th className="py-3 font-medium">Date</th>
                                    <th className="py-3 font-medium">Status</th>
                                    <th className="py-3 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {donations.map((donation) => (
                                    <tr key={donation.id} className="text-sm hover:bg-slate-50">
                                        <td className="py-3 font-medium text-slate-900">{donation.donorName}</td>
                                        <td className="py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                {donation.bloodType}
                                            </span>
                                        </td>
                                        <td className="py-3 text-slate-600">{donation.units}</td>
                                        <td className="py-3 text-slate-500">
                                            {new Date(donation.donationDate).toLocaleDateString()}
                                        </td>
                                        <td className="py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusBadge(donation.status)}`}>
                                                {donation.status === 'in_progress' ? 'In Progress' : donation.status}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                {donation.status === 'in_progress' ? (
                                                    <button
                                                        onClick={() => handleDonate(donation)}
                                                        className="px-3 py-1 rounded text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition"
                                                    >
                                                        Donate
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleClear(donation)}
                                                        className="px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 transition"
                                                    >
                                                        Clear
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyDonationsView;
