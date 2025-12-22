import React, { useState, useEffect } from 'react';
import { hospitals } from '../../../controllers/mockData';
import { Hospital } from '../../../models/Hospital';

const HospitalActivityView = () => {
    const [selectedHospitalId, setSelectedHospitalId] = useState<string>(hospitals[0]?.id || '');
    const [hospital, setHospital] = useState<Hospital | undefined>(undefined);

    useEffect(() => {
        const found = hospitals.find((h) => h.id === selectedHospitalId);
        setHospital(found);
    }, [selectedHospitalId]);

    if (!hospital) return <div className="p-6">Loading...</div>;

    // Mock Metrics Logic
    // In a real app, these would be fetched from API based on hospital ID
    const staffCount = Math.floor(Math.random() * 50) + 10;
    const requestsSent = Math.floor(Math.random() * 100) + 20;
    const requestsApproved = Math.floor(requestsSent * 0.8);
    const requestsFailed = requestsSent - requestsApproved;
    const failureCauses = [
        { cause: 'Blood Type Unavailable', count: Math.floor(requestsFailed * 0.6) },
        { cause: 'Logistics Issue', count: Math.floor(requestsFailed * 0.3) },
        { cause: 'Expired Request', count: Math.ceil(requestsFailed * 0.1) },
    ];

    const donorsFound = Math.floor(Math.random() * 500) + 50;
    const searchMethods = [
        { method: 'By Location', count: Math.floor(donorsFound * 0.5) },
        { method: 'By Blood Type', count: Math.floor(donorsFound * 0.3) },
        { method: 'By Name', count: Math.floor(donorsFound * 0.2) },
    ];

    const timeSpentHours = (Math.random() * 100).toFixed(1);
    const totalDonations = Math.floor(Math.random() * 1000) + 100;
    const inventoryLevel = Math.floor(Math.random() * 200) + 20;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Hospital Activity & Performance</h1>
                <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">Select Hospital:</span>
                    <select
                        value={selectedHospitalId}
                        onChange={(e) => setSelectedHospitalId(e.target.value)}
                        className="border rounded-md px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        {hospitals.map((h) => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Overview Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-2xl">
                        {hospital.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{hospital.name}</h2>
                        <p className="text-gray-500">{hospital.location}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${hospital.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {hospital.status || 'Active'}
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Total Staff</p>
                        <p className="text-2xl font-bold text-blue-900">{staffCount}</p>
                        <p className="text-xs text-blue-500">Active Employees</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-600 font-medium">Time on System</p>
                        <p className="text-2xl font-bold text-purple-900">{timeSpentHours} hrs</p>
                        <p className="text-xs text-purple-500">Last 30 Days</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Total Donations Received</p>
                        <p className="text-2xl font-bold text-green-900">{totalDonations}</p>
                        <p className="text-xs text-green-500">Lifetime</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Blood Requests Analysis */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Blood Requests Analysis</h3>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                            <p className="text-gray-500 text-sm">Sent</p>
                            <p className="text-xl font-bold text-gray-900">{requestsSent}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500 text-sm">Approved</p>
                            <p className="text-xl font-bold text-green-600">{requestsApproved}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500 text-sm">Failed</p>
                            <p className="text-xl font-bold text-red-600">{requestsFailed}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Failure Causes</h4>
                        <div className="space-y-3">
                            {failureCauses.map((cause, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">{cause.cause}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{cause.count}</span>
                                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-400"
                                                style={{ width: `${(cause.count / requestsFailed) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Donor Search Activity */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Donor Search Activity</h3>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-3xl font-bold text-gray-900">{donorsFound}</p>
                            <p className="text-sm text-gray-500">Donors Found via Search</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Search Methods Used</h4>
                    <div className="space-y-4">
                        {searchMethods.map((method, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">{method.method}</span>
                                    <span className="font-medium text-gray-900">{Math.round((method.count / donorsFound) * 100)}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500"
                                        style={{ width: `${(method.count / donorsFound) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Inventory & Essential Things */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Additional Insights</h3>
                <div className="flex items-center gap-6">
                    <div className="flex-1 p-4 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-500">Current Inventory Level</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{inventoryLevel} Units</p>
                        <p className="text-xs text-gray-400 mt-1">Across all blood types</p>
                    </div>
                    <div className="flex-1 p-4 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-500">Contact Doctor</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">{hospital.contactDoctorName || 'N/A'}</p>
                        <p className="text-xs text-gray-400 mt-1">{hospital.contactDoctorPhone}</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default HospitalActivityView;
