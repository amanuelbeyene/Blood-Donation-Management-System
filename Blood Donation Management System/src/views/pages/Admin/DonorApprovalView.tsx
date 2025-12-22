import { useState } from 'react';
import { useMockData } from '../../../contexts/MockDataContext';
import { Donor } from '../../../models/Donor';

interface PendingEdit {
    id: string;
    originalId: string;
    fullName: string;
    email: string;
    phone: string;
    location: string;
    bloodType: string;
    age: number;
    source: string;
    auditLog: string;
    status: string;
    changes: {
        field: string;
        oldValue: string;
        newValue: string;
    }[];
}

const DonorApprovalView = () => {
    const { donors, updateDonorStatus } = useMockData();
    const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    // State for Pending Edits
    const [pendingEdits, setPendingEdits] = useState<PendingEdit[]>([
        {
            id: 'edit-1',
            originalId: 'donor-123',
            fullName: 'Pending User',
            email: 'pending@example.com',
            phone: '+251 91 400 0004',
            location: 'Adama',
            bloodType: 'A+',
            age: 25,
            source: 'Self',
            auditLog: 'Phone updated (10m ago)',
            status: 'Active',
            changes: [
                { field: 'Phone Number', oldValue: '+251 91 400 0000', newValue: '+251 91 400 0004' },
                { field: 'Location', oldValue: 'Addis Ababa', newValue: 'Adama' }
            ]
        }
    ]);

    const [selectedEdit, setSelectedEdit] = useState<PendingEdit | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const pendingDonors = donors.filter(d => d.status === 'Pending');

    const handleApprove = (id: string) => {
        if (confirm('Are you sure you want to approve this donor?')) {
            updateDonorStatus(id, 'Active');
        }
    };

    const handleReject = () => {
        if (selectedDonor && rejectionReason.trim()) {
            updateDonorStatus(selectedDonor.id, 'Rejected', rejectionReason);
            setIsRejectModalOpen(false);
            setSelectedDonor(null);
            setRejectionReason('');
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

    // --- Edit Approval Handlers ---
    const openEditModal = (edit: PendingEdit) => {
        setSelectedEdit(edit);
        setIsEditModalOpen(true);
    };

    const handleEditApprove = (id: string) => {
        if (confirm('Are you sure you want to approve these changes?')) {
            // In a real app, this would update the actual donor record
            setPendingEdits(prev => prev.filter(e => e.id !== id));
            setIsEditModalOpen(false);
        }
    };

    const handleEditReject = (id: string) => {
        if (confirm('Are you sure you want to reject these changes?')) {
            setPendingEdits(prev => prev.filter(e => e.id !== id));
            setIsEditModalOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Donor Approval</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {pendingDonors.length === 0 ? (
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audit Log</th>
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
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                // Mock logic: randomly assign source based on ID or just default to Self for now
                                                (donor.id.includes('stf') || parseInt(donor.id) % 2 === 0) ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {(donor.id.includes('stf') || parseInt(donor.id) % 2 === 0) ? 'Staff' : 'Self'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                            <div><span className="font-semibold">Registered:</span> 2h ago</div>
                                            {(donor.id.includes('stf')) && <div><span className="font-semibold">By:</span> Nurse Joy</div>}
                                            {/* Edits removed for Pending table */}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openViewModal(donor)}
                                                className="text-purple-600 hover:text-purple-900 mr-4"
                                                title="View Details"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </button>
                                            <button
                                                onClick={() => handleApprove(donor.id)}
                                                className="text-green-600 hover:text-green-900 mr-4"
                                                title="Approve"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </button>
                                            <button
                                                onClick={() => openRejectModal(donor)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Reject"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Donor Approval Section */}
            <h2 className="text-2xl font-bold text-gray-900 pt-8">Edit Donor Approval</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {pendingEdits.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No pending edits.</div>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pendingEdits.map((donor) => (
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
                                                {donor.source}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                            <div className="font-semibold bg-gray-100 px-2 py-1 rounded inline-block">Updated</div>
                                            <div className="mt-1 text-gray-400 text-xs">Requested: 10m ago</div>
                                            <div className="text-gray-500 line-clamp-1">Change: {donor.changes[0].field}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openEditModal(donor)}
                                                className="text-purple-600 hover:text-purple-900 mr-4"
                                                title="View Changes"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </button>
                                            <button
                                                onClick={() => handleEditApprove(donor.id)}
                                                className="text-green-600 hover:text-green-900 mr-4"
                                                title="Approve Changes"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </button>
                                            <button
                                                onClick={() => handleEditReject(donor.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Reject Changes"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                            </div>

                            <div className="mt-8 flex justify-end gap-3 border-t pt-4">
                                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Comparison Modal */}
            {isEditModalOpen && selectedEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6 border-b pb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Review Changes</h3>
                                    <p className="text-sm text-gray-500 mt-1">Review the changes requested by {selectedEdit.fullName}</p>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                    <span className="sr-only">Close</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="overflow-hidden border rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Original Value</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">New Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {selectedEdit.changes.map((change, idx) => (
                                            <tr key={idx}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{change.field}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 bg-red-50">{change.oldValue}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 bg-green-50 font-semibold">{change.newValue}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    onClick={() => handleEditReject(selectedEdit.id)}
                                    className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium"
                                >
                                    Reject Changes
                                </button>
                                <button
                                    onClick={() => handleEditApprove(selectedEdit.id)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                >
                                    Approve Changes
                                </button>
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
