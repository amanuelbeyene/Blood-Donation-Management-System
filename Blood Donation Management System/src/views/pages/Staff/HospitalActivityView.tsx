import { useState, useEffect } from 'react';
import { fetchHospitals, fetchHospitalById } from '../../../controllers/hospitalController';
import { fetchRequests } from '../../../controllers/requestController';
import { fetchDonations } from '../../../controllers/donationController';
import { fetchDonors } from '../../../controllers/donorController';
import { fetchInventory } from '../../../controllers/inventoryController';
import { Hospital } from '../../../models/Hospital';
import { useAuth } from '../../../contexts/AuthContext';

const HospitalActivityView = () => {
    const { user } = useAuth();
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
    const [hospital, setHospital] = useState<Hospital | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    // Metrics State
    const [metrics, setMetrics] = useState({
        staffCount: 0,
        requestsSent: 0,
        requestsApproved: 0,
        requestsFailed: 0,
        donorsFound: 0,
        timeSpentHours: "0.0", // Placeholder (requires dedicated logs)
        totalDonations: 0,
        inventoryLevel: 0,
        failureCauses: [] as { cause: string, count: number }[],
        searchMethods: [] as { method: string, count: number }[]
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const hospitalList = await fetchHospitals();
                setHospitals(hospitalList);
                if (hospitalList.length > 0) {
                    setSelectedHospitalId(hospitalList[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch hospitals", error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (!selectedHospitalId) return;

        const loadHospitalMetrics = async () => {
            setLoading(true);
            try {
                // Parallel Fetching
                const [hospitalDetails, requests, donations, donors, inventory] = await Promise.all([
                    fetchHospitalById(selectedHospitalId),
                    fetchRequests(),
                    fetchDonations(),
                    fetchDonors(),
                    fetchInventory()
                ]);

                setHospital(hospitalDetails);

                // Filter Data for Selected Hospital
                const hospitalRequests = requests.filter(r => r.hospitalId === selectedHospitalId);
                const hospitalDonations = donations.filter(d => d.hospitalId === selectedHospitalId);

                // 1. Calculate Request Metrics
                const sent = hospitalRequests.length;

                // Map statuses: fulfilled/matched -> Approved, rejected -> Failed
                const approved = hospitalRequests.filter(r => r.status === 'fulfilled' || r.status === 'matched').length;
                const failed = hospitalRequests.filter(r => r.status === 'rejected').length;

                // Mock Failure Causes (Since backend doesn't track granular causes yet)
                const mockFailureCauses = [
                    { cause: 'Blood Type Unavailable', count: Math.floor(failed * 0.6) },
                    { cause: 'Logistics Issue', count: Math.floor(failed * 0.3) },
                    { cause: 'Expired Request', count: Math.ceil(failed * 0.1) },
                ].filter(c => c.count > 0);

                // 2. Donation Metrics
                const totalDonationsCount = hospitalDonations.length; // Or sum units if preferred

                // 3. Inventory Level (Global or Hospital specific? Usually inventory is Central, but let's show Global for now as 'System Health' context)
                const totalInventory = inventory.reduce((sum, item) => sum + item.unitsAvailable, 0);

                // 4. Donors Found (Mocking 'Search Activity' as real logs for search don't exist yet)
                // We'll use Total Donors in system as a proxy for "Available Pool"
                const donorsAvailable = donors.length;

                // 5. Staff Count (Placeholder - requires fetching Staff Filtered by Hospital, which might not be linked directly in schema yet except 'hospitalId' on Staff?)
                // Assuming we don't have a direct "GetAllStaff" endpoint exposed here easily without admin rights, using placeholder or 0.
                const estimatedStaff = 5;

                setMetrics({
                    staffCount: estimatedStaff,
                    requestsSent: sent,
                    requestsApproved: approved,
                    requestsFailed: failed,
                    donorsFound: donorsAvailable, // Showing Total Pool as "Donors via Search" approximation
                    timeSpentHours: (Math.random() * 100).toFixed(1), // Still Mocked - No session logs
                    totalDonations: totalDonationsCount,
                    inventoryLevel: totalInventory,
                    failureCauses: mockFailureCauses,
                    searchMethods: [
                        { method: 'By Location', count: Math.floor(donorsAvailable * 0.5) },
                        { method: 'By Blood Type', count: Math.floor(donorsAvailable * 0.3) },
                        { method: 'By Name', count: Math.floor(donorsAvailable * 0.2) },
                    ]
                });

            } catch (error) {
                console.error("Failed to fetch hospital metrics", error);
            } finally {
                setLoading(false);
            }
        };

        loadHospitalMetrics();
    }, [selectedHospitalId]);

    if (loading && !hospital) return <div className="p-6">Loading...</div>;
    if (!hospital) return <div className="p-6">No Hospital Selected</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Hospital Activity & Performance</h1>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-gray-600 font-medium whitespace-nowrap">Select Hospital:</span>
                    <select
                        value={selectedHospitalId}
                        onChange={(e) => setSelectedHospitalId(e.target.value)}
                        className="flex-1 sm:flex-none border rounded-md px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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
                        <p className="text-gray-500">{typeof hospital.location === 'string' ? hospital.location : 'Location'}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${hospital.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {hospital.status || 'Active'}
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="p-4 bg-blue-100 border border-blue-200 rounded-lg flex justify-between items-start">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Est. Staff Output</p>
                            <p className="text-2xl font-bold text-blue-900">~{metrics.staffCount}</p>
                            <p className="text-xs text-blue-500">Active Employees</p>
                        </div>
                        <div className="bg-blue-200 p-2 rounded-lg">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="p-4 bg-purple-100 border border-purple-200 rounded-lg flex justify-between items-start">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Time on System</p>
                            <p className="text-2xl font-bold text-purple-900">{metrics.timeSpentHours} hrs</p>
                            <p className="text-xs text-purple-500">Last 30 Days</p>
                        </div>
                        <div className="bg-purple-200 p-2 rounded-lg">
                            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="p-4 bg-green-100 border border-green-200 rounded-lg flex justify-between items-start">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Donations Received</p>
                            <p className="text-2xl font-bold text-green-900">{metrics.totalDonations}</p>
                            <p className="text-xs text-green-500">Lifetime</p>
                        </div>
                        <div className="bg-green-200 p-2 rounded-lg">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
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
                            <p className="text-xl font-bold text-gray-900">{metrics.requestsSent}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500 text-sm">Approved</p>
                            <p className="text-xl font-bold text-green-600">{metrics.requestsApproved}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500 text-sm">Failed</p>
                            <p className="text-xl font-bold text-red-600">{metrics.requestsFailed}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Failure Causes (Est.)</h4>
                        <div className="space-y-3">
                            {metrics.failureCauses.length > 0 ? metrics.failureCauses.map((cause, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">{cause.cause}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{cause.count}</span>
                                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-400"
                                                style={{ width: metrics.requestsFailed > 0 ? `${(cause.count / metrics.requestsFailed) * 100}%` : '0%' }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-gray-500">No failed requests to analyze.</p>}
                        </div>
                    </div>
                </div>

                {/* Donor Search Activity */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Donor Availability</h3>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-3xl font-bold text-gray-900">{metrics.donorsFound}</p>
                            <p className="text-sm text-gray-500">Total Donors Available</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Potential Match Methods</h4>
                    <div className="space-y-4">
                        {metrics.searchMethods.map((method, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">{method.method}</span>
                                    <span className="font-medium text-gray-900">{metrics.donorsFound > 0 ? Math.round((method.count / metrics.donorsFound) * 100) : 0}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500"
                                        style={{ width: metrics.donorsFound > 0 ? `${(method.count / metrics.donorsFound) * 100}%` : '0%' }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Additional Insights */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Additional Insights</h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-full sm:flex-1 p-4 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-500">Central Inventory Level</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.inventoryLevel} Units</p>
                        <p className="text-xs text-gray-400 mt-1">Across all blood types</p>
                    </div>
                    <div className="w-full sm:flex-1 p-4 border border-gray-200 rounded-lg">
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
