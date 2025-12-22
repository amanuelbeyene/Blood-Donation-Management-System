import React, { useState } from 'react';
import { useMockData } from '../../../contexts/MockDataContext';
import { useLanguage } from '../../../contexts/LanguageContext';

const StaffAppointmentsView = () => {
    const { donors } = useMockData();
    const { t } = useLanguage();
    const [searchName, setSearchName] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [searchBloodType, setSearchBloodType] = useState('');

    // Filter only donors who have appointment details.
    // Note: Assuming "active" donors or just anyone with appointment info.
    // Given the request is "Appointment List", showing all donors with appointment info seems correct.
    const appointmentDonors = donors.filter(donor =>
        (donor.appointmentRegion || donor.appointmentPlace || donor.donationAppointmentDate) &&
        (searchName === '' || donor.fullName.toLowerCase().includes(searchName.toLowerCase())) &&
        (searchPhone === '' || donor.phone.includes(searchPhone)) &&
        (searchBloodType === '' || donor.bloodType.toLowerCase().includes(searchBloodType.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Appointment List</h2>

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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition & Disabilities</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appt. Region</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appt. Place</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appt. Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appt. Time</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {appointmentDonors.length > 0 ? (
                            appointmentDonors.map((donor) => (
                                <tr key={donor.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{donor.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.age || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {donor.locationDetails ? (
                                            <>
                                                {donor.locationDetails.region}, {donor.locationDetails.city}
                                                {/* Add more details if space permits or tooltip */}
                                            </>
                                        ) : donor.location}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                            {donor.bloodType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex flex-col">
                                            <span className="font-medium">Med: {donor.medicalCondition || 'None'}</span>
                                            {donor.hasDisability === 'Yes' && (
                                                <span className="text-xs text-orange-600">Disability: {donor.disabilityType}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.appointmentRegion || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.appointmentPlace || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.donationAppointmentDate || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.appointmentTime || '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                                    No appointments found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StaffAppointmentsView;
