import { useState } from 'react';
import { useMockData } from '../../../contexts/MockDataContext';
import { Hospital } from '../../../models/Hospital';

interface PendingEdit {
    id: string;
    originalId: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    hospitalType: string;
    source: string;
    auditLog: string;
    status: string;
    changes: {
        field: string;
        oldValue: string;
        newValue: string;
    }[];
}

const HospitalApprovalView = () => {
    const { hospitals, updateHospitalStatus } = useMockData();
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    // State for Pending Edits
    const [pendingEdits, setPendingEdits] = useState<PendingEdit[]>([
        {
            id: 'edit-hosp-1',
            originalId: 'hosp-123',
            name: 'City General Hospital',
            email: 'admin@citygeneral.com',
            phone: '+251 11 123 4567',
            location: 'Addis Ababa',
            hospitalType: 'Government Hospital',
            source: 'Self',
            auditLog: 'License updated (15m ago)',
            status: 'Active',
            changes: [
                { field: 'Business License', oldValue: 'LIC-OLD-123', newValue: 'LIC-NEW-789' },
                { field: 'Phone', oldValue: '+251 11 123 0000', newValue: '+251 11 123 4567' }
            ]
        }
    ]);

    const [selectedEdit, setSelectedEdit] = useState<PendingEdit | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const pendingHospitals = hospitals.filter(h => h.status === 'Pending');

    const handleApprove = (id: string) => {
        if (confirm('Are you sure you want to approve this hospital?')) {
            updateHospitalStatus(id, 'Active');
        }
    };

    const handleReject = () => {
        if (selectedHospital && rejectionReason.trim()) {
            updateHospitalStatus(selectedHospital.id, 'Rejected', rejectionReason);
            setIsRejectModalOpen(false);
            setSelectedHospital(null);
            setRejectionReason('');
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

    // --- Edit Approval Handlers ---
    const openEditModal = (edit: PendingEdit) => {
        setSelectedEdit(edit);
        setIsEditModalOpen(true);
    };

    const handleEditApprove = (id: string) => {
        if (confirm('Are you sure you want to approve these changes?')) {
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
            <h2 className="text-2xl font-bold text-gray-900">Hospital Approval</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {pendingHospitals.length === 0 ? (
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
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                // Mock logic: randomly assign source based on ID or just default to Self for now
                                                (hospital.id.includes('stf') || parseInt(hospital.id) % 2 === 0) ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {(hospital.id.includes('stf') || parseInt(hospital.id) % 2 === 0) ? 'Staff' : 'Self'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {hospital.hospitalType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                            <div><span className="font-semibold">Registered:</span> 1d ago</div>
                                            {(hospital.id.includes('stf')) && <div><span className="font-semibold">By:</span> Dr. House</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openViewModal(hospital)}
                                                className="text-purple-600 hover:text-purple-900 mr-4"
                                                title="View Details"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </button>
                                            <button
                                                onClick={() => handleApprove(hospital.id)}
                                                className="text-green-600 hover:text-green-900 mr-4"
                                                title="Approve"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </button>
                                            <button
                                                onClick={() => openRejectModal(hospital)}
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

            {/* Edit Hospital Approval Section */}
            <h2 className="text-2xl font-bold text-gray-900 pt-8">Edit Hospital Approval</h2>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pendingEdits.map((hospital) => (
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
                                            <div className="text-sm text-gray-500">{hospital.location}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {hospital.source}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                {hospital.hospitalType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                            <div className="font-semibold bg-gray-100 px-2 py-1 rounded inline-block">Updated</div>
                                            <div className="mt-1 text-gray-400 text-xs">Requested: 15m ago</div>
                                            <div className="text-gray-500 line-clamp-1">Change: {hospital.changes[0].field}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openEditModal(hospital)}
                                                className="text-purple-600 hover:text-purple-900 mr-4"
                                                title="View Changes"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </button>
                                            <button
                                                onClick={() => handleEditApprove(hospital.id)}
                                                className="text-green-600 hover:text-green-900 mr-4"
                                                title="Approve Changes"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </button>
                                            <button
                                                onClick={() => handleEditReject(hospital.id)}
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
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(selectedHospital.id.includes('stf') || parseInt(selectedHospital.id) % 2 === 0) ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {(selectedHospital.id.includes('stf') || parseInt(selectedHospital.id) % 2 === 0) ? 'Staff Register' : 'Self Register'}
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

            {/* Edit Comparison Modal */}
            {isEditModalOpen && selectedEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6 border-b pb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Review Changes</h3>
                                    <p className="text-sm text-gray-500 mt-1">Review the changes requested by {selectedEdit.name}</p>
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
        </div >
    );
};

export default HospitalApprovalView;
