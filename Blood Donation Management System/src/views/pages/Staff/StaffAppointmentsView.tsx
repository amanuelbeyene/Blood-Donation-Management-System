import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchDonors } from '../../../controllers/donorController';
import { Donor } from '../../../models/Donor';
import { useLanguage } from '../../../contexts/LanguageContext';
import LaboratoryTestModal from '../../components/modals/LaboratoryTestModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToast } from '../../../contexts/ToastContext';
import axios from 'axios';

const StaffAppointmentsView = () => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const location = useLocation();
    const isMedicalStaff = location.pathname.includes('/medical-staff');

    const [activeTab, setActiveTab] = useState<'active' | 'reset'>('active');
    const [donors, setDonors] = useState<Donor[]>([]);
    const [resetCandidates, setResetCandidates] = useState<Donor[]>([]);
    const [searchName, setSearchName] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [searchBloodType, setSearchBloodType] = useState('');

    // Test Modal State
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [selectedDonorForTest, setSelectedDonorForTest] = useState<Donor | null>(null);

    // Confirmation Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: 'danger' | 'warning' | 'info' | 'success';
        confirmLabel?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger'
    });

    const openConfirmation = (
        title: string,
        message: string,
        onConfirm: () => void,
        type: 'danger' | 'warning' | 'info' | 'success' = 'danger',
        confirmLabel: string = 'Confirm'
    ) => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            onConfirm,
            type,
            confirmLabel
        });
    };

    const loadDonors = async () => {
        try {
            const data = await fetchDonors();

            // Tab 1: Active Appointments
            const activeWithAppointments = data.filter(d =>
                (d.status === 'Active' || d.status === 'Pending') &&
                d.donationAppointmentDate &&
                new Date(d.donationAppointmentDate).getTime() > 0
            );
            setDonors(activeWithAppointments);

            // Tab 2: Reset Candidates (Resting donors)
            const candidates = data.filter(d =>
                d.availability === 'resting'
            );
            setResetCandidates(candidates);

        } catch (error) {
            console.error("Failed to fetch donors", error);
        }
    };

    useEffect(() => {
        loadDonors();
    }, []);

    const calculateDaysElapsed = (lastDonation?: string) => {
        if (!lastDonation) return 0;
        const diff = new Date().getTime() - new Date(lastDonation).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    const handleResetStatus = (donor: Donor) => {
        openConfirmation(
            "Reset Donor Status",
            `Are you sure you want to RESET ${donor.fullName} to 'Ready'?`,
            async () => {
                try {
                    await import('../../../controllers/donorController').then(mod => mod.updateDonor(donor.id, {
                        availability: 'ready' as any,
                        donationAppointmentDate: undefined // Clear any old appointment data if exists
                    }));
                    toast.success("Donor Reset to Ready");
                    loadDonors();
                } catch (error) {
                    console.error("Reset failed", error);
                    toast.error("Failed to reset donor");
                }
            },
            'warning',
            'Reset'
        );
    };

    const filteredDonors = (activeTab === 'active' ? donors : resetCandidates).filter(donor =>
        (searchName === '' || donor.fullName.toLowerCase().includes(searchName.toLowerCase())) &&
        (searchPhone === '' || (donor.phone && donor.phone.includes(searchPhone))) &&
        (searchBloodType === '' || donor.bloodType.toLowerCase().includes(searchBloodType.toLowerCase()))
    );

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    const handleTestClick = (donor: Donor) => {
        setSelectedDonorForTest(donor);
        setIsTestModalOpen(true);
    };

    const handleTestConfirm = async (result: { passed: boolean; reason?: string }) => {
        if (!selectedDonorForTest) return;

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            await axios.post('http://localhost:5000/api/donations/test-result', {
                donorId: selectedDonorForTest.id,
                testResult: result.passed ? 'Pass' : 'Fail',
                failureReason: result.reason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(result.passed ? "Test Passed" : "Donation Rejected");
            setIsTestModalOpen(false);
            setSelectedDonorForTest(null);
            loadDonors();
        } catch (error) {
            console.error("Test recording failed", error);
            toast.error("Failed to record test result");
        }
    };

    const handleResetTest = (donor: Donor) => {
        openConfirmation(
            "Clear Test Result",
            `Are you sure you want to clear the test result for ${donor.fullName}?`,
            async () => {
                try {
                    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                    await axios.post('http://localhost:5000/api/donations/reset-test', {
                        donorId: donor.id
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    toast.success("Test Result Cleared");
                    loadDonors();
                } catch (error) {
                    console.error("Reset failed", error);
                    toast.error("Failed to reset test result");
                }
            },
            'warning',
            'Clear Result'
        );
    };

    const handleProcessClick = (donor: Donor) => {
        openConfirmation(
            "Complete Donation",
            `Are you sure you want to complete the donation for ${donor.fullName}? This will update the blood stock.`,
            async () => {
                try {
                    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                    await axios.post('http://localhost:5000/api/donations/complete', {
                        donorId: donor.id,
                        units: 1
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    toast.success("Donation Completed & Stock Updated");
                    loadDonors();
                } catch (error) {
                    console.error("Completion failed", error);
                    toast.error("Failed to complete donation");
                }
            },
            'success',
            'Complete Donation'
        );
    };

    const handleRemoveClick = (donor: Donor) => {
        openConfirmation(
            "Remove Appointment",
            `Are you sure you want to remove ${donor.fullName} from the appointment list?`,
            async () => {
                try {
                    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                    await axios.post('http://localhost:5000/api/donations/remove-appointment', {
                        donorId: donor.id
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    toast.success("Appointment Removed");
                    loadDonors();
                } catch (error) {
                    console.error("Remove failed", error);
                    toast.error("Failed to remove appointment");
                }
            },
            'danger',
            'Remove'
        );
    };

    const handleBloodTypeUpdate = async (donor: Donor, newBloodType: string) => {
        if (!newBloodType || newBloodType === donor.bloodType) return;

        openConfirmation(
            "Update Blood Type",
            `Are you sure you want to change ${donor.fullName}'s blood type from ${donor.bloodType} to ${newBloodType}? This will affect the entire system.`,
            async () => {
                // Optimistic Update: Update local state immediately
                setDonors(prevDonors => prevDonors.map(d =>
                    d.id === donor.id ? { ...d, bloodType: newBloodType as any } : d
                ));

                try {
                    await import('../../../controllers/donorController').then(mod => mod.updateDonor(donor.id, { bloodType: newBloodType as any }));
                    toast.success(`Blood Type updated to ${newBloodType}`);
                } catch (error) {
                    console.error("Failed to update blood type", error);
                    toast.error("Failed to update blood type");
                    // Revert
                    setDonors(prevDonors => prevDonors.map(d =>
                        d.id === donor.id ? { ...d, bloodType: donor.bloodType } : d
                    ));
                    const select = document.getElementById(`blood-type-${donor.id}`) as HTMLSelectElement;
                    if (select) select.value = donor.bloodType;
                }
            },
            'warning',
            'Update Blood Type'
        );
    };

    const handleNotifyClick = async (donor: Donor) => {
        if (!donor.donationAppointmentDate || !donor.appointmentTime) {
            toast.error("Donor missing appointment details");
            return;
        }

        const isComplete = donor.availability === 'resting';
        const modalTitle = isComplete ? "Send Completion Thank You" : "Send Appointment Reminder";
        const modalMessage = isComplete
            ? `Send 'Thank You' notification to ${donor.fullName} for completing their donation?`
            : `Send appointment reminder to ${donor.fullName} via Email and SMS?`;

        const notificationType = isComplete ? 'donation_completed' : 'appointment_reminder';

        openConfirmation(
            modalTitle,
            modalMessage,
            async () => {
                try {
                    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                    await axios.post(`http://localhost:5000/api/donors/${donor.id}/notify`, {
                        type: notificationType
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    toast.success("Notification & Email sent successfully");
                } catch (error: any) {
                    console.error("Notify failed", error);
                    toast.error(error.response?.data?.message || "Failed to send notification");
                }
            },
            isComplete ? 'success' : 'info',
            'Send Notification'
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Appointment List</h2>
                <p className="text-gray-600 mt-1">Track and manage upcoming blood donation appointments for approved donors.</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-gray-200 pb-1">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'active'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-900 bg-transparent'
                        }`}
                >
                    New Donor Appointment
                </button>
                <button
                    onClick={() => setActiveTab('reset')}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'reset'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-900 bg-transparent'
                        }`}
                >
                    Reset Donor Appointment
                </button>
            </div>

            {/* Search inputs */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                    type="text"
                    placeholder="Search by Name"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Search by Phone"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                />
                <select
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={searchBloodType}
                    onChange={(e) => setSearchBloodType(e.target.value)}
                >
                    <option value="">Search by Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                </select>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor Name</th>
                            {activeTab === 'active' ? (
                                <>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medical Condition</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appt. Region</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appt. Place</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appt. Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appt. Time</th>
                                    {isMedicalStaff && (
                                        <>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test / Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notify</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remove</th>
                                </>
                            ) : (
                                // Reset Columns
                                <>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Donation</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Elapsed</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reset Eligibility</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reset</th>
                                    {isMedicalStaff && (
                                        <>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test / Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notify</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remove</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredDonors.length > 0 ? (
                            filteredDonors.map((donor) => (
                                <tr key={donor.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <div className="flex items-center">
                                            {donor.profilePicture ? (
                                                <img
                                                    src={donor.profilePicture.startsWith('data:') || donor.profilePicture.startsWith('http') ? donor.profilePicture : `data:image/jpeg;base64,${donor.profilePicture}`}
                                                    alt=""
                                                    className="h-8 w-8 rounded-full object-cover mr-3"
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                                                />
                                            ) : null}
                                            <div className={`h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs mr-3 ${donor.profilePicture ? 'hidden' : ''}`}>
                                                {donor.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <div>{donor.fullName}</div>
                                                <div className="text-xs text-gray-500">{donor.phone}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {activeTab === 'active' ? (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.medicalCondition || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {isMedicalStaff ? (
                                                    <select
                                                        id={`blood-type-${donor.id}`}
                                                        className={`px-2 py-1 rounded-full text-xs font-semibold border-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${donor.bloodType === 'unknown' ? 'bg-red-100 text-red-800' : 'bg-green-50 text-green-700'}`}
                                                        value={donor.bloodType}
                                                        onChange={(e) => handleBloodTypeUpdate(donor, e.target.value)}
                                                    >
                                                        <option value="unknown">Unknown</option>
                                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                                            <option key={type} value={type}>{type}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        {donor.bloodType}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.appointmentRegion || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.appointmentPlace || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(donor.donationAppointmentDate)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.appointmentTime || '-'}</td>

                                            {isMedicalStaff && (
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        {/* Medical Staff Actions (Test/Clear) */}
                                                        {donor.availability === 'Passed_Test' ? (
                                                            <div className="flex items-center space-x-2">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Pass</span>
                                                                <button onClick={() => handleResetTest(donor)} className="text-gray-400 hover:text-red-500" title="Clear Result">✕</button>
                                                            </div>
                                                        ) : donor.availability === 'Failed_Test' ? (
                                                            <div className="flex items-center space-x-2">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Fail</span>
                                                                <button onClick={() => handleResetTest(donor)} className="text-gray-400 hover:text-red-500" title="Clear Result">✕</button>
                                                            </div>
                                                        ) : donor.availability === 'resting' ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">Donated</span>
                                                        ) : (
                                                            <button onClick={() => handleTestClick(donor)} className="text-white bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-md text-xs transition">Test</button>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => handleProcessClick(donor)}
                                                            disabled={donor.availability !== 'Passed_Test'}
                                                            className={`px-3 py-1 rounded-md text-xs transition text-white ${donor.availability === 'Passed_Test' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                                                        >
                                                            Donate
                                                        </button>
                                                    </td>
                                                </>
                                            )}

                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {donor.status === 'Active' ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Approved
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {/* Status Badges */}
                                                {donor.availability === 'resting' ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">Complete</span>
                                                ) : donor.availability === 'Failed_Test' ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">Reject</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">In Progress</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => handleNotifyClick(donor)}
                                                        className="p-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                                                        title="Send Appointment Reminder (Email & SMS)"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                            <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button onClick={() => handleRemoveClick(donor)} className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-xs transition">Remove</button>
                                            </td>
                                        </>
                                    ) : (
                                        // Tab 2 Row Cells: Reset
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {calculateDaysElapsed(donor.lastDonation)} Days
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {calculateDaysElapsed(donor.lastDonation) >= 90 ? (
                                                    <span className="text-green-600 font-bold flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                        Ready
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-600 font-medium">Waiting ({90 - calculateDaysElapsed(donor.lastDonation)} days left)</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleResetStatus(donor)}
                                                    className={`px-3 py-1 rounded-md text-xs transition text-white ${calculateDaysElapsed(donor.lastDonation) >= 90 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 opacity-50'
                                                        }`}
                                                    disabled={calculateDaysElapsed(donor.lastDonation) < 90}
                                                >
                                                    Reset to Ready
                                                </button>
                                            </td>
                                            {isMedicalStaff && (
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        {donor.availability === 'resting' ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">Donated</span>
                                                        ) : (
                                                            <button className="text-white bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-md text-xs transition opacity-50 cursor-not-allowed">Test</button>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            disabled
                                                            className="px-3 py-1 rounded-md text-xs transition text-white bg-gray-400 cursor-not-allowed"
                                                        >
                                                            Donate
                                                        </button>
                                                    </td>
                                                </>
                                            )}
                                            {/* New Columns: Notify, Status, Remove */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                                                    Complete
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-3">
                                                    <button className="p-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100" title="Send SMS">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button onClick={() => handleRemoveClick(donor)} className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-xs transition">Remove</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={12} className="px-6 py-12 text-center text-gray-500">
                                    {activeTab === 'active'
                                        ? "No active appointments found."
                                        : "No donors currently in resting (post-donation) state."
                                    }
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <LaboratoryTestModal
                isOpen={isTestModalOpen}
                onClose={() => setIsTestModalOpen(false)}
                onConfirm={handleTestConfirm}
                donorName={selectedDonorForTest?.fullName || ''}
            />

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmLabel={modalConfig.confirmLabel}
            />
        </div>
    );
};

export default StaffAppointmentsView;
