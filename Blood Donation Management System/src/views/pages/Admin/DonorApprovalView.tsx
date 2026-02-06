import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../../../contexts/ToastContext';
import { useMockData } from '../../../contexts/MockDataContext'; // Kept for updateDonorStatus if strictly needed, but we are moving away
import { fetchDonors, updateDonor } from '../../../controllers/donorController';
import { Donor } from '../../../models/Donor';



const DonorApprovalView = () => {
    // const { donors, updateDonorStatus } = useMockData(); // Removed mock usage
    const { toast } = useToast();
    const [donors, setDonors] = useState<Donor[]>([]);
    const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(true);

    // Initial load
    useEffect(() => {
        loadDonors();
    }, []);

    const loadDonors = async () => {
        try {
            setLoading(true);
            const data = await fetchDonors();
            setDonors(data);
        } catch (error) {
            console.error("Failed to load donors", error);
        } finally {
            setLoading(false);
        }
    };





    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

    useEffect(() => {
        if (location.pathname.includes('approve-donor')) {
            setActiveTab('approved');
        } else if (location.pathname.includes('reject-donor')) {
            setActiveTab('rejected');
        } else {
            setActiveTab('pending');
        }
    }, [location.pathname]);

    // Filter local state based on API data
    const pendingDonors = donors.filter(d => !d.status || d.status.toLowerCase() === 'pending');
    const approvedDonors = donors.filter(d => d.status?.toLowerCase() === 'active');
    const rejectedDonors = donors.filter(d => d.status?.toLowerCase() === 'rejected');

    const handleApprove = async (id: string) => {
        if (confirm('Are you sure you want to approve this donor?')) {
            try {
                await updateDonor(id, { status: 'Active' });
                // Optimistic Update: Remove from list immediately
                // setDonors(prev => prev.filter(d => d.id !== id)); // Don't filter out, let it move to approved tab
                setDonors(prev => prev.map(d => d.id === id ? { ...d, status: 'Active' } : d));
                toast.success("Donor approved successfully");
                // loadDonors(); // No need to reload if optimistic update works
            } catch (error) {
                console.error("Approval failed", error);
                toast.error("Failed to approve donor");
            }
        }
    };

    const handleReject = async () => {
        if (selectedDonor && rejectionReason.trim()) {
            try {
                await updateDonor(selectedDonor.id, { status: 'Rejected', rejectionReason } as any);
                setDonors(prev => prev.map(d => d.id === selectedDonor.id ? { ...d, status: 'Rejected', rejectionReason } : d));
                toast.success("Donor rejected");

                setIsRejectModalOpen(false);
                setSelectedDonor(null);
                setRejectionReason('');
            } catch (error) {
                console.error("Rejection failed", error);
                toast.error("Failed to reject donor");
            }
        }
    };

    const handleClear = async (id: string) => {
        if (confirm('Are you sure you want to clear this status and move back to pending?')) {
            try {
                await updateDonor(id, { status: 'Pending', rejectionReason: null } as any);
                setDonors(prev => prev.map(d => d.id === id ? { ...d, status: 'Pending', rejectionReason: undefined } : d));
                toast.success("Status cleared, moved to Pending");
            } catch (error) {
                console.error("Clear failed", error);
                toast.error("Failed to clear status");
            }
        }
    };

    const openRejectModal = (donor: Donor) => {
        setSelectedDonor(donor);
        setIsRejectModalOpen(true);
    };

    const openViewModal = (donor: Donor) => {
        setSelectedDonor(donor);
        setIsModalOpen(true);
    };



    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Donor Approval</h2>
                <div className="flex gap-2">
                    <button
                        onClick={loadDonors}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`${activeTab === 'pending'
                            ? 'border-purple-500 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                    >
                        Pending Donors
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${activeTab === 'pending' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-900'}`}>
                            {pendingDonors.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('approved')}
                        className={`${activeTab === 'approved'
                            ? 'border-green-500 text-green-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                    >
                        Approved Donors
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${activeTab === 'approved' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-900'}`}>
                            {approvedDonors.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('rejected')}
                        className={`${activeTab === 'rejected'
                            ? 'border-red-500 text-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                    >
                        Rejected Donors
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${activeTab === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-900'}`}>
                            {rejectedDonors.length}
                        </span>
                    </button>
                </nav>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* PENDING TABLE */}
                {activeTab === 'pending' && (
                    pendingDonors.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No pending donor approvals.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pendingDonors.map((donor) => (
                                        <tr key={donor.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{donor.fullName}</div>
                                                        <div className="text-sm text-gray-500">{donor.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{donor.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{donor.location}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {donor.bloodType} / {donor.age} yrs
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Self
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                <div><span className="font-semibold">Registered:</span> {donor.createdAt ? new Date(donor.createdAt).toLocaleDateString() : 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openViewModal(donor)} className="text-purple-600 hover:text-purple-900 mr-4" title="View Details">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                                <button onClick={() => handleApprove(donor.id)} className="text-green-600 hover:text-green-900 mr-4" title="Approve">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                </button>
                                                <button onClick={() => openRejectModal(donor)} className="text-red-600 hover:text-red-900" title="Reject">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                {/* APPROVED TABLE */}
                {activeTab === 'approved' && (
                    approvedDonors.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No approved donors yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {approvedDonors.map((donor) => (
                                        <tr key={donor.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{donor.fullName}</div>
                                                        <div className="text-sm text-gray-500">{donor.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{donor.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                {donor.createdAt ? new Date(donor.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openViewModal(donor)} className="text-purple-600 hover:text-purple-900 mr-4">View</button>
                                                {/* Clear Button */}
                                                <button
                                                    onClick={() => handleClear(donor.id)}
                                                    className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-xs transition-colors"
                                                    title="Move back to Pending"
                                                >
                                                    Clear Status
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                {/* REJECTED TABLE */}
                {activeTab === 'rejected' && (
                    rejectedDonors.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No rejected donors.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rejection Reason</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {rejectedDonors.map((donor) => (
                                        <tr key={donor.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{donor.fullName}</div>
                                                        <div className="text-sm text-gray-500">{donor.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{donor.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 truncate max-w-xs" title={donor.rejectionReason}>
                                                    {donor.rejectionReason || 'No reason provided'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                {donor.createdAt ? new Date(donor.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openViewModal(donor)} className="text-purple-600 hover:text-purple-900 mr-4">View</button>
                                                {/* Clear Button */}
                                                <button
                                                    onClick={() => handleClear(donor.id)}
                                                    className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-xs transition-colors"
                                                    title="Move back to Pending"
                                                >
                                                    Clear Status
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>




            {/* Modal for View Details */}
            {isModalOpen && selectedDonor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6 border-b pb-4">
                                <h3 className="text-2xl font-bold text-gray-900">Donor Details</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                    <span className="sr-only">Close</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Header with Profile Picture */}
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-gray-100 pb-6">
                                    <div className="flex-shrink-0">
                                        {selectedDonor.profilePicture ? (
                                            <img
                                                src={selectedDonor.profilePicture}
                                                alt={selectedDonor.fullName}
                                                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                                            />
                                        ) : (
                                            <div className="h-32 w-32 rounded-full bg-blue-50 flex items-center justify-center border-4 border-white shadow-lg">
                                                <span className="text-4xl font-bold text-blue-300">
                                                    {selectedDonor.fullName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-center sm:text-left pt-2">
                                        <h4 className="text-2xl font-bold text-gray-900">{selectedDonor.fullName}</h4>
                                        <p className="text-gray-500 font-medium">{selectedDonor.username}</p>
                                        <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                {selectedDonor.bloodType}
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                                FAN: {selectedDonor.fanNumber || 'N/A'}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedDonor.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                                Status: {selectedDonor.status || 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Information */}
                                <div>
                                    <h4 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-100 pb-1">Personal Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                                        <div><p className="text-xs text-gray-500 uppercase tracking-wide">Full Name</p><p className="font-semibold text-gray-900">{selectedDonor.fullName}</p></div>
                                        <div><p className="text-xs text-gray-500 uppercase tracking-wide">Email</p><p className="font-medium text-gray-800">{selectedDonor.email}</p></div>
                                        <div><p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p><p className="font-medium text-gray-800">{selectedDonor.phone}</p></div>
                                        <div><p className="text-xs text-gray-500 uppercase tracking-wide">Birth Date</p><p className="font-medium text-gray-800">{selectedDonor.birthDate || 'N/A'}</p></div>
                                        <div><p className="text-xs text-gray-500 uppercase tracking-wide">Age</p><p className="font-medium text-gray-800">{selectedDonor.age || 'N/A'} years</p></div>
                                        <div><p className="text-xs text-gray-500 uppercase tracking-wide">Blood Type</p><p className="font-medium text-gray-800">{selectedDonor.bloodType}</p></div>
                                        <div><p className="text-xs text-gray-500 uppercase tracking-wide">Unique FAN ID</p><p className="font-mono bg-gray-100 px-2 py-1 rounded inline-block text-gray-800">{selectedDonor.fanNumber || 'Pending'}</p></div>
                                        <div><p className="text-xs text-gray-500 uppercase tracking-wide">Username</p><p className="font-medium text-gray-800">{selectedDonor.username}</p></div>
                                        <div><p className="text-xs text-gray-500 uppercase tracking-wide">Source</p>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(selectedDonor.id.includes('stf') || parseInt(selectedDonor.id) % 2 === 0) ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {(selectedDonor.id.includes('stf') || parseInt(selectedDonor.id) % 2 === 0) ? 'Staff Register' : 'Self Register'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information */}
                                {selectedDonor.locationDetails && (
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-100 pb-1">Address & Location</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                                            <div><p className="text-xs text-gray-500 uppercase tracking-wide">Region</p><p className="font-medium text-gray-800">{selectedDonor.locationDetails.region}</p></div>
                                            <div><p className="text-xs text-gray-500 uppercase tracking-wide">City</p><p className="font-medium text-gray-800">{selectedDonor.locationDetails.city}</p></div>
                                            <div><p className="text-xs text-gray-500 uppercase tracking-wide">Sub City</p><p className="font-medium text-gray-800">{selectedDonor.locationDetails.subCity || '-'}</p></div>
                                            <div><p className="text-xs text-gray-500 uppercase tracking-wide">Woreda</p><p className="font-medium text-gray-800">{selectedDonor.locationDetails.woreda || '-'}</p></div>
                                            <div><p className="text-xs text-gray-500 uppercase tracking-wide">Kebele</p><p className="font-medium text-gray-800">{selectedDonor.locationDetails.kebele || '-'}</p></div>
                                            <div><p className="text-xs text-gray-500 uppercase tracking-wide">Home Number</p><p className="font-medium text-gray-800">{selectedDonor.locationDetails.homeNumber || '-'}</p></div>
                                            <div><p className="text-xs text-gray-500 uppercase tracking-wide">Street</p><p className="font-medium text-gray-800">{selectedDonor.locationDetails.street || '-'}</p></div>
                                            <div className="md:col-span-3">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">GPS Location</p>
                                                <p className="font-medium text-gray-800">{selectedDonor.location || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Medical Information */}
                                <div>
                                    <h4 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-100 pb-1">Medical Profile</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                                        <div><p className="text-xs text-gray-500 uppercase tracking-wide">Medical Condition</p><p className="font-medium text-gray-800">{selectedDonor.medicalCondition || 'None declared'}</p></div>
                                        <div><p className="text-xs text-gray-500 uppercase tracking-wide">Has Disability</p><p className="font-medium text-gray-800">{selectedDonor.hasDisability === 'Yes' ? 'Yes' : 'No'}</p></div>
                                        {selectedDonor.hasDisability === 'Yes' && (
                                            <div><p className="text-xs text-gray-500 uppercase tracking-wide">Disability Type</p><p className="font-medium text-gray-800">{selectedDonor.disabilityType}</p></div>
                                        )}
                                    </div>
                                </div>

                                {/* ID Cards */}
                                {(selectedDonor.idCardFront || selectedDonor.idCardBack) && (
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-100 pb-1 pt-4">ID Cards</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {selectedDonor.idCardFront && (
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Front Side</p>
                                                    <img
                                                        src={selectedDonor.idCardFront}
                                                        alt="Front ID"
                                                        className="w-full h-auto object-contain rounded-lg border border-gray-200 bg-gray-50"
                                                    />
                                                </div>
                                            )}
                                            {selectedDonor.idCardBack && (
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Back Side</p>
                                                    <img
                                                        src={selectedDonor.idCardBack}
                                                        alt="Back ID"
                                                        className="w-full h-auto object-contain rounded-lg border border-gray-200 bg-gray-50"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex justify-end gap-3 border-t pt-4">
                                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}



            {/* Reject Modal */}
            {isRejectModalOpen && selectedDonor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Registration</h3>
                        <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejecting {selectedDonor.fullName}'s registration.</p>
                        <textarea
                            className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                            rows={4}
                            placeholder="Enter rejection reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectionReason.trim()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonorApprovalView;
