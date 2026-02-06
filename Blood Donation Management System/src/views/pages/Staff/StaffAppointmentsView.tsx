import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchDonors } from '../../../controllers/donorController';
import { Donor } from '../../../models/Donor';
import { useLanguage } from '../../../contexts/LanguageContext';
import LaboratoryTestModal from '../../components/modals/LaboratoryTestModal';
import { useToast } from '../../../contexts/ToastContext';
import axios from 'axios';

const StaffAppointmentsView = () => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const location = useLocation();
    const isMedicalStaff = location.pathname.includes('/medical-staff');

    const [donors, setDonors] = useState<Donor[]>([]);
    const [searchName, setSearchName] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [searchBloodType, setSearchBloodType] = useState('');

    // Test Modal State
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [selectedDonorForTest, setSelectedDonorForTest] = useState<Donor | null>(null);

    const loadDonors = async () => {
        try {
            const data = await fetchDonors();
            const activeWithAppointments = data.filter(d =>
                d.status === 'Active' &&
                d.donationAppointmentDate &&
                new Date(d.donationAppointmentDate).getTime() > 0
            );
            setDonors(activeWithAppointments);
        } catch (error) {
            console.error("Failed to fetch donors", error);
        }
    };

    useEffect(() => {
        loadDonors();
    }, []);

    const filteredDonors = donors.filter(donor =>
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

    const handleResetTest = async (donor: Donor) => {
        if (!confirm(`Are you sure you want to clear the test result for ${donor.fullName}?`)) return;

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
    };

    const handleProcessClick = async (donor: Donor) => {
        if (confirm(`Are you sure you want to complete the donation for ${donor.fullName}? This will update the blood stock.`)) {
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
        }
    };

    const handleRemoveClick = async (donor: Donor) => {
        if (!confirm(`Are you sure you want to remove ${donor.fullName} from the appointment list?`)) return;

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
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Appointment List</h2>
                <p className="text-gray-600 mt-1">Track and manage upcoming blood donation appointments for approved donors.</p>
            </div>

            {/* Search inputs ... */}
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notify</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remove</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredDonors.length > 0 ? (
                            filteredDonors.map((donor) => (
                                <tr key={donor.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{donor.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {donor.medicalCondition || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                            {donor.bloodType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.appointmentRegion || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.appointmentPlace || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(donor.donationAppointmentDate)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.appointmentTime || '-'}</td>

                                    {isMedicalStaff && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {donor.availability === 'Passed_Test' ? (
                                                    <div className="flex items-center space-x-2">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Pass
                                                        </span>
                                                        <button onClick={() => handleResetTest(donor)} className="text-gray-400 hover:text-red-500" title="Clear Result">
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : donor.availability === 'Failed_Test' ? (
                                                    <div className="flex items-center space-x-2">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            Fail
                                                        </span>
                                                        <button onClick={() => handleResetTest(donor)} className="text-gray-400 hover:text-red-500" title="Clear Result">
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : donor.availability === 'resting' ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                        Donated
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleTestClick(donor)}
                                                        className="text-white bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-md text-xs transition"
                                                    >
                                                        Test
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleProcessClick(donor)}
                                                    disabled={donor.availability !== 'Passed_Test'}
                                                    className={`px-3 py-1 rounded-md text-xs transition text-white ${donor.availability === 'Passed_Test'
                                                        ? 'bg-blue-600 hover:bg-blue-700'
                                                        : 'bg-gray-400 cursor-not-allowed'
                                                        }`}
                                                >
                                                    Donate
                                                </button>
                                            </td>
                                        </>
                                    )}

                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                                        <button className="text-blue-600 hover:text-blue-800 mr-1">SMS</button>
                                        <span className="text-gray-300">|</span>
                                        <button className="text-blue-600 hover:text-blue-800 ml-1">Email</button>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleRemoveClick(donor)}
                                            className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-xs transition"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={isMedicalStaff ? 11 : 9} className="px-6 py-12 text-center text-gray-500">
                                    No active appointments found.
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
        </div >
    );
};

export default StaffAppointmentsView;
