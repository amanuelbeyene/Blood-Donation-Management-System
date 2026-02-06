import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMockData } from '../../../contexts/MockDataContext'; // Kept for updateHospitalStatus if needed during transition
import { fetchHospitals, updateHospital } from '../../../controllers/hospitalController';
import { Hospital } from '../../../models/Hospital';



import { useToast } from '../../../contexts/ToastContext';
import { validatePassword } from '../../../utils/validation';

// const { hospitals, updateHospitalStatus } = useMockData(); // Mock removed
const HospitalApprovalView = () => {
    const { toast } = useToast();
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [hospitalToApprove, setHospitalToApprove] = useState<Hospital | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(true);

    // Initial load
    useEffect(() => {
        loadHospitals();
    }, []);

    const loadHospitals = async () => {
        try {
            setLoading(true);
            const data = await fetchHospitals();
            setHospitals(data);
        } catch (error) {
            console.error("Failed to load hospitals", error);
            toast.error("Failed to load hospitals");
        } finally {
            setLoading(false);
        }
    };



    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

    useEffect(() => {
        // Prioritize notification redirect (always go to pending if highlighting)
        if (location.state?.highlightId) {
            setActiveTab('pending');
            return;
        }

        if (location.pathname.includes('approve-hospital')) {
            setActiveTab('approved');
        } else if (location.pathname.includes('reject-hospital')) {
            setActiveTab('rejected');
        } else {
            setActiveTab('pending');
        }
    }, [location.pathname, location.state]);

    // Highlighting Logic
    useEffect(() => {
        if (location.state?.highlightId && hospitals.length > 0) {
            const id = location.state.highlightId;
            setTimeout(() => {
                // Find row
                const element = document.querySelector(`tr[data-hospital-id="${id}"]`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    // Immediate Highlight ON
                    element.classList.add('bg-gray-400', 'text-white');

                    // Flash 3 times (slower: 1000ms interval)
                    let flashCount = 0;
                    const flashInterval = setInterval(() => {
                        element.classList.toggle('bg-gray-400'); // Stronger highlight
                        element.classList.toggle('text-white');
                        flashCount++;
                        if (flashCount >= 6) {
                            clearInterval(flashInterval);
                            element.classList.remove('bg-gray-400', 'text-white');
                        }
                    }, 500);
                }
            }, 100);
        }
    }, [location.state, hospitals]);

    // Filter local state based on API data
    // Filter local state based on API data

    const pendingHospitals = hospitals.filter(h => !h.status || h.status.trim().toLowerCase() === 'pending');
    const approvedHospitals = hospitals.filter(h => h.status?.trim().toLowerCase() === 'active');
    const rejectedHospitals = hospitals.filter(h => h.status?.trim().toLowerCase() === 'rejected');

    const openApproveModal = (hospital: Hospital) => {
        setHospitalToApprove(hospital);
        setIsApproveModalOpen(true);
    };

    const confirmApprove = async () => {
        if (hospitalToApprove) {
            try {
                await updateHospital(hospitalToApprove.id, { status: 'Active' });
                // Optimistic Update
                setHospitals(prev => prev.map(h => h.id === hospitalToApprove.id ? { ...h, status: 'Active' } : h));
                toast.success('Hospital approved successfully');
                setIsApproveModalOpen(false);
                setHospitalToApprove(null);
            } catch (error) {
                console.error("Approval failed", error);
                toast.error("Failed to approve hospital");
            }
        }
    };

    const handleReject = async () => {
        if (selectedHospital && rejectionReason.trim()) {
            try {
                await updateHospital(selectedHospital.id, { status: 'Rejected', rejectionReason } as any);
                setHospitals(prev => prev.map(h => h.id === selectedHospital.id ? { ...h, status: 'Rejected', rejectionReason } : h));

                setIsRejectModalOpen(false);
                setSelectedHospital(null);
                setRejectionReason('');
                toast.success('Hospital rejected successfully');
            } catch (error) {
                console.error("Rejection failed", error);
                toast.error("Failed to reject hospital");
            }
        }
    };

    const handleClear = async (id: string) => {
        if (confirm('Are you sure you want to clear this status and move back to pending?')) {
            try {
                await updateHospital(id, { status: 'Pending', rejectionReason: null } as any);
                setHospitals(prev => prev.map(h => h.id === id ? { ...h, status: 'Pending', rejectionReason: undefined } : h));
                toast.success("Status cleared, moved to Pending");
            } catch (error) {
                console.error("Clear failed", error);
                toast.error("Failed to clear status");
            }
        }
    };

    const openRejectModal = (hospital: Hospital) => {
        setSelectedHospital(hospital);
        setIsRejectModalOpen(true);
    };

    const openViewModal = (hospital: Hospital) => {
        setSelectedHospital(hospital);
        setIsModalOpen(true);
    };



    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Hospital Approval</h2>
                <button
                    onClick={loadHospitals}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                    <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
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
                        Pending Hospitals
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${activeTab === 'pending' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-900'}`}>
                            {pendingHospitals.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('approved')}
                        className={`${activeTab === 'approved'
                            ? 'border-green-500 text-green-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                    >
                        Approved Hospitals
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${activeTab === 'approved' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-900'}`}>
                            {approvedHospitals.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('rejected')}
                        className={`${activeTab === 'rejected'
                            ? 'border-red-500 text-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                    >
                        Rejected Hospitals
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${activeTab === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-900'}`}>
                            {rejectedHospitals.length}
                        </span>
                    </button>
                </nav>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* PENDING TABLE */}
                {activeTab === 'pending' && (
                    pendingHospitals.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No pending hospital approvals.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audit Log</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pendingHospitals.map((hospital) => (
                                        <tr key={hospital.id} data-hospital-id={hospital.id} className="hover:bg-gray-50 transition-colors duration-500">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{hospital.name}</div>
                                                        <div className="text-sm text-gray-500">{hospital.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{hospital.phone}</div>
                                                <div className="text-xs text-gray-500">{hospital.contactDoctorName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{hospital.location}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${hospital.source === 'Staff' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                    {hospital.source || 'Self'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {hospital.hospitalType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                <div><span className="font-semibold">Registered:</span> {hospital.createdAt ? new Date(hospital.createdAt).toLocaleDateString() : 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openViewModal(hospital)} className="text-purple-600 hover:text-purple-900 mr-4" title="View Details">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                                <button onClick={() => openApproveModal(hospital)} className="text-green-600 hover:text-green-900 mr-4" title="Approve">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                </button>
                                                <button onClick={() => openRejectModal(hospital)} className="text-red-600 hover:text-red-900" title="Reject">
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
                    approvedHospitals.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No approved hospitals yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {approvedHospitals.map((hospital) => (
                                        <tr key={hospital.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{hospital.name}</div>
                                                        <div className="text-sm text-gray-500">{hospital.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{hospital.phone}</div>
                                                <div className="text-xs text-gray-500">{hospital.contactDoctorName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{hospital.location}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {hospital.hospitalType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${hospital.source === 'Staff' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                    {hospital.source || 'Self'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                {hospital.createdAt ? new Date(hospital.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openViewModal(hospital)} className="text-purple-600 hover:text-purple-900 mr-4">View</button>
                                                {/* Clear Button */}
                                                <button
                                                    onClick={() => handleClear(hospital.id)}
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
                    rejectedHospitals.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No rejected hospitals.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rejection Reason</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {rejectedHospitals.map((hospital) => (
                                        <tr key={hospital.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{hospital.name}</div>
                                                        <div className="text-sm text-gray-500">{hospital.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{hospital.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${hospital.source === 'Staff' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                    {hospital.source || 'Self'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                {hospital.createdAt ? new Date(hospital.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 truncate max-w-xs" title={hospital.rejectionReason}>
                                                    {hospital.rejectionReason || 'No reason provided'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openViewModal(hospital)} className="text-purple-600 hover:text-purple-900 mr-4">View</button>
                                                {/* Clear Button */}
                                                <button
                                                    onClick={() => handleClear(hospital.id)}
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




            {
                isModalOpen && selectedHospital && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6 border-b pb-4">
                                    <h3 className="text-2xl font-bold text-gray-900">Hospital Details</h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                        <span className="sr-only">Close</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    {/* Header with Profile Picture */}
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-gray-100 pb-6">
                                        <div className="flex-shrink-0">
                                            {selectedHospital.profilePicture ? (
                                                <img
                                                    src={selectedHospital.profilePicture}
                                                    alt={selectedHospital.name}
                                                    className="h-32 w-32 rounded-lg object-cover border-4 border-white shadow-lg"
                                                />
                                            ) : (
                                                <div className="h-32 w-32 rounded-lg bg-green-50 flex items-center justify-center border-4 border-white shadow-lg">
                                                    <svg className="h-16 w-16 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-center sm:text-left pt-2">
                                            <h4 className="text-2xl font-bold text-gray-900">{selectedHospital.name}</h4>
                                            <p className="text-gray-500 font-medium">{selectedHospital.username}</p>
                                            <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                    {selectedHospital.hospitalType}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedHospital.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    Status: {selectedHospital.status || 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* General Information */}
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-100 pb-1">General Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                                            <div><p className="text-xs text-gray-500 uppercase tracking-wide">Hospital Name</p><p className="font-semibold text-gray-900">{selectedHospital.name}</p></div>
                                            <div><p className="text-xs text-gray-500 uppercase tracking-wide">Type</p><p className="font-medium text-gray-800">{selectedHospital.hospitalType}</p></div>
                                            <div><p className="text-xs text-gray-500 uppercase tracking-wide">Username</p><p className="font-medium text-gray-800">{selectedHospital.username}</p></div>
                                            <div><p className="text-xs text-gray-500 uppercase tracking-wide">Email</p><p className="font-medium text-gray-800">{selectedHospital.email}</p></div>
                                            <div><p className="text-xs text-gray-500 uppercase tracking-wide">Main Phone</p><p className="font-medium text-gray-800">{selectedHospital.phone}</p></div>
                                            <div><p className="text-xs text-gray-500 uppercase tracking-wide">Source</p>
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedHospital.source === 'Staff' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                    {selectedHospital.source || 'Self'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Documents & License */}
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-100 pb-1">Registered Documents</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                                            <div className="md:col-span-2">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Business License / Registration Document</p>
                                                {selectedHospital.businessLicenseImage ? (
                                                    <div className="border rounded-lg p-2 bg-gray-50 inline-block">
                                                        <img
                                                            src={selectedHospital.businessLicenseImage}
                                                            alt="Business License"
                                                            className="max-h-64 object-contain rounded"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-500 text-sm">
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                        No document uploaded or file not previewable.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Information */}
                                    {selectedHospital.locationDetails && (
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-100 pb-1">Address & Location</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                                                <div><p className="text-xs text-gray-500 uppercase tracking-wide">Region</p><p className="font-medium text-gray-800">{selectedHospital.locationDetails.region}</p></div>
                                                <div><p className="text-xs text-gray-500 uppercase tracking-wide">City</p><p className="font-medium text-gray-800">{selectedHospital.locationDetails.city}</p></div>
                                                <div><p className="text-xs text-gray-500 uppercase tracking-wide">Sub City</p><p className="font-medium text-gray-800">{selectedHospital.locationDetails.subCity || '-'}</p></div>
                                                <div><p className="text-xs text-gray-500 uppercase tracking-wide">Woreda</p><p className="font-medium text-gray-800">{selectedHospital.locationDetails.woreda || '-'}</p></div>
                                                <div><p className="text-xs text-gray-500 uppercase tracking-wide">Kebele</p><p className="font-medium text-gray-800">{selectedHospital.locationDetails.kebele || '-'}</p></div>
                                                <div><p className="text-xs text-gray-500 uppercase tracking-wide">Street</p><p className="font-medium text-gray-800">{selectedHospital.locationDetails.street || '-'}</p></div>
                                                <div className="md:col-span-3">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">GPS Location</p>
                                                    <p className="font-medium text-gray-800">{selectedHospital.location || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Professional & License Info */}
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-100 pb-1">Professional Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                                            <div><p className="text-xs text-gray-500 uppercase tracking-wide">Contact Doctor</p><p className="font-medium text-gray-800">{selectedHospital.contactDoctorName}</p></div>
                                            <div><p className="text-xs text-gray-500 uppercase tracking-wide">Doctor Phone</p><p className="font-medium text-gray-800">{selectedHospital.contactDoctorPhone}</p></div>
                                            <div><p className="text-xs text-gray-500 uppercase tracking-wide">Business License Name</p><p className="font-medium text-gray-800">{selectedHospital.businessLicenseName || 'N/A'}</p></div>
                                            <div><p className="text-xs text-gray-500 uppercase tracking-wide">License Number</p><p className="font-mono bg-gray-100 px-2 py-1 rounded inline-block text-gray-800">{selectedHospital.businessLicenseNumber || 'N/A'}</p></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end gap-3 border-t pt-4">
                                    <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }



            {/* Reject Modal */}
            {
                isRejectModalOpen && selectedHospital && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Registration</h3>
                            <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejecting {selectedHospital.name}'s registration.</p>
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
                )
            }
            {/* Approve Modal */}
            {
                isApproveModalOpen && hospitalToApprove && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Approve Registration</h3>
                            <p className="text-sm text-gray-600 text-center mb-6">
                                Are you sure you want to approve <span className="font-semibold text-gray-900">{hospitalToApprove.name}</span>? This will allow them to access the system.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setIsApproveModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmApprove}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm transition-colors"
                                >
                                    Approve Hospital
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default HospitalApprovalView;
