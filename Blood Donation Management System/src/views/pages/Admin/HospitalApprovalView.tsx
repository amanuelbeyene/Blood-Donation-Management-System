
import { useState } from 'react';
import { useMockData } from '../../../contexts/MockDataContext';
import { Hospital } from '../../../models/Hospital';

const HospitalApprovalView = () => {
    const { hospitals, updateHospitalStatus } = useMockData();
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
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
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {hospital.hospitalType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openViewModal(hospital)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
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

            {isModalOpen && selectedHospital && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Hospital Details</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                    <span className="sr-only">Close</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><p className="text-sm text-gray-500">Hospital Name</p><p className="font-medium">{selectedHospital.name}</p></div>
                                    <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{selectedHospital.email}</p></div>
                                    <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{selectedHospital.phone}</p></div>
                                    <div><p className="text-sm text-gray-500">Hospital Type</p><p className="font-medium">{selectedHospital.hospitalType}</p></div>
                                    <div><p className="text-sm text-gray-500">Contact Doctor</p><p className="font-medium">{selectedHospital.contactDoctorName}</p></div>
                                    <div><p className="text-sm text-gray-500">Doctor Phone</p><p className="font-medium">{selectedHospital.contactDoctorPhone}</p></div>
                                    <div><p className="text-sm text-gray-500">Location</p><p className="font-medium">{selectedHospital.location}</p></div>
                                    <div><p className="text-sm text-gray-500">Username</p><p className="font-medium">{selectedHospital.username}</p></div>
                                    <div><p className="text-sm text-gray-500">License Name</p><p className="font-medium">{selectedHospital.businessLicenseName}</p></div>
                                    <div><p className="text-sm text-gray-500">License Number</p><p className="font-medium">{selectedHospital.businessLicenseNumber}</p></div>
                                </div>
                                {selectedHospital.locationDetails && (
                                    <div className="mt-4 border-t pt-4">
                                        <h4 className="text-sm font-semibold mb-2">Detailed Address</h4>
                                        <p className="text-sm">{selectedHospital.locationDetails.region}, {selectedHospital.locationDetails.city}</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {isRejectModalOpen && selectedHospital && (
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
            )}
        </div>
    );
};

export default HospitalApprovalView;

