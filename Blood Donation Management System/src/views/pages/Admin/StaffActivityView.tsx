import { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { fetchStaff, Staff } from '../../../controllers/staffController';

import { fetchDonors, Donor } from '../../../controllers/donorController';
import { fetchHospitals, Hospital } from '../../../controllers/hospitalController';
import { ActivityTracker } from '../../../utils/ActivityTracker';

// Interface matching AdminActivityLog structure but for Staff
export interface StaffActivityLog {
    id: string;
    staffId: string;
    actionType: 'REGISTER_DONOR' | 'MATCH_DONOR' | 'VIEW_DONOR' | 'UPDATE_DONOR' | 'DELETE_DONOR' | 'UPDATE_STAFF' | 'REGISTER_HOSPITAL' | 'UPDATE_HOSPITAL' | 'DELETE_HOSPITAL' | 'VIEW_HOSPITAL';
    targetId: string;
    targetName: string;
    targetProfilePicture?: string | null;
    details: string;
    createdAt: string;
    staff?: Staff;
}

// Generate Mock Logs based on REAL staff and REAL donor data
// Generate Logs: Combine Real Local Logs + Inferred Historical Registration
const generateLogs = (staffList: Staff[], donorList: Donor[]): StaffActivityLog[] => {
    if (staffList.length === 0) return [];

    // 1. Get Real Logs from LocalStorage (Actions performed in this session/browser)
    let localLogs = ActivityTracker.getLogs();

    // Filter to ONLY show Staff actions (ignore Admin actions e.g. from Meskerem)
    localLogs = localLogs.filter(log =>
        log.staff?.role?.toLowerCase() === 'staff'
    );

    // NOTE: We have removed the "Inferred" historical data generation logic.
    // The user requested to remove it because attributing historical donors to random staff (or hashing)
    // caused confusion when they knew who actually added them.
    // Now, ONLY locally tracked actions (performed by the currently logged-in user on this device) are shown.

    const logs: StaffActivityLog[] = [...localLogs];
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

import { useSearchParams, useLocation } from 'react-router-dom';

const StaffActivityView = () => {
    const { t } = useLanguage();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [activities, setActivities] = useState<Staff[]>([]);
    const [donors, setDonors] = useState<Donor[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [totalDonors, setTotalDonors] = useState(0);
    const [logs, setLogs] = useState<StaffActivityLog[]>([]);

    // Initialize tab from URL query param, default to 'donor'
    const queryTab = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState<'donor' | 'hospital'>(
        (queryTab === 'hospital') ? 'hospital' : 'donor'
    );

    // Modal State
    const [selectedLogs, setSelectedLogs] = useState<StaffActivityLog[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalType, setModalType] = useState<'SIMPLE' | 'DETAILED'>('SIMPLE');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [staffData, donorData, hospitalData] = await Promise.all([
                    fetchStaff(),
                    fetchDonors(),
                    fetchHospitals()
                ]);

                // Ensure status is correctly typed or defaulted if missing from backend response (though controller defines it)
                const mappedStaff = staffData.map(s => ({
                    ...s,
                    status: s.status || 'Active' // Fallback
                }));
                setActivities(mappedStaff);
                setDonors(donorData);
                setHospitals(hospitalData);
                setTotalDonors(donorData.length);
                setLogs(generateLogs(mappedStaff, donorData));
            } catch (error) {
                console.error("Failed to load staff or donors", error);
            }
        };
        loadData();
        loadData();
    }, []);

    // Highlighting Logic
    useEffect(() => {
        if (location.state?.highlightId && logs.length > 0) {
            const id = location.state.highlightId;
            setTimeout(() => {
                // Find all rows with this staff ID
                const elements = document.querySelectorAll(`[data-staff-id="${id}"]`);
                if (elements.length > 0) {
                    // Scroll to the first one
                    elements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });

                    // Immediate Highlight ON
                    elements.forEach(el => el.classList.add('bg-gray-200'));

                    // Flash 3 times (slower: 1000ms toggle)
                    let flashCount = 0;
                    const flashInterval = setInterval(() => {
                        elements.forEach(el => el.classList.toggle('bg-gray-200'));
                        flashCount++;
                        // Toggle ON/OFF. Started ON. 
                        // 1s -> OFF (1)
                        // 2s -> ON (2)
                        // 3s -> OFF (3)
                        // 4s -> ON (4)
                        // 5s -> OFF (5) - Remove
                        if (flashCount >= 5) {
                            clearInterval(flashInterval);
                            elements.forEach(el => el.classList.remove('bg-yellow-200'));
                        }
                    }, 1000); // Slower blink
                }
            }, 100);
        }
    }, [location.state, logs]);

    const openDetails = (title: string, logs: StaffActivityLog[], type: 'SIMPLE' | 'DETAILED') => {
        setModalTitle(title);
        setSelectedLogs(logs);
        setModalType(type);
        setIsModalOpen(true);
    };

    // Group logs by Staff
    const groupLogsByStaff = (type: string) => {
        const activeDonorIds = new Set(donors.map(d => d.id));
        const activeHospitalIds = new Set(hospitals.map(h => h.id));

        const filtered = logs.filter(l =>
            l.actionType === type &&
            // Filter logs if target donor is deleted (not in active list)
            ((['REGISTER_DONOR', 'MATCH_DONOR', 'UPDATE_DONOR', 'VIEW_DONOR'].includes(type)) ? activeDonorIds.has(l.targetId) : true) &&
            // Filter logs if target hospital is deleted (not in active list)
            ((['REGISTER_HOSPITAL', 'UPDATE_HOSPITAL', 'VIEW_HOSPITAL'].includes(type)) ? activeHospitalIds.has(l.targetId) : true)
        );
        const grouped: { [key: string]: StaffActivityLog[] } = {};

        filtered.forEach(log => {
            if (!grouped[log.staffId]) grouped[log.staffId] = [];
            grouped[log.staffId].push(log);
        });

        return Object.values(grouped).map(group => {
            const staffId = group[0].staffId;
            const foundStaff = activities.find(s => s.id === staffId);

            return {
                staff: foundStaff || group[0].staff,
                count: group.length,
                latest: group[0].createdAt,
                logs: group
            };
        });
    };

    const registerDonorLogs = groupLogsByStaff('REGISTER_DONOR');
    const matchDonorLogs = groupLogsByStaff('MATCH_DONOR');
    const updateDonorLogs = groupLogsByStaff('UPDATE_DONOR'); // Edit Activity
    const viewDonorLogs = groupLogsByStaff('VIEW_DONOR');

    const deleteDonorLogs = groupLogsByStaff('DELETE_DONOR');

    // Hospital Logs
    const registerHospitalLogs = groupLogsByStaff('REGISTER_HOSPITAL');
    const updateHospitalLogs = groupLogsByStaff('UPDATE_HOSPITAL');
    const deleteHospitalLogs = groupLogsByStaff('DELETE_HOSPITAL');
    const viewHospitalLogs = groupLogsByStaff('VIEW_HOSPITAL');

    // Recent Activity (Flattened)
    const recentActivities = logs.slice(0, 10);

    const getLastActiveText = (dateStr?: string) => {
        if (!dateStr) return 'No activity';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins} mins ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} hours ago`;
        return `${Math.floor(hours / 24)} days ago`;
    };

    const calculateTimeOnSystem = (status: string) => {
        // Mock calculation based on status for demo
        if (status === 'online') return 'Active now';
        return 'Offline';
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Staff Activity Monitor</h2>
                <p className="text-gray-600 mt-1">Track staff performance, donor registrations, and system usage.</p>
            </div>
            {/* Toggle Buttons */}
            {/* Toggle Buttons */}
            <div className="flex justify-center mb-6">
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('donor')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'donor'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Staff Donor Activity
                    </button>
                    <button
                        onClick={() => setActiveTab('hospital')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'hospital'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Staff Hospital Activity
                    </button>
                </div>
            </div>
            <div className="flex gap-3">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Online: {activities.filter(a => (a.status || '').toLowerCase() === 'active' || (a.status || '').toLowerCase() === 'online').length}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    Total Staff: {activities.length}
                </span>
            </div>


            {/* Conditional Rendering */}
            {
                activeTab === 'hospital' ? (
                    <>
                        {/* Metrics Cards - Hospital */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Hospitals Registered</h3>
                                <div className="text-3xl font-bold text-gray-900">
                                    {hospitals.length}
                                </div>
                                <div className="w-16 h-1 mt-4 bg-purple-500 rounded-full"></div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Active Staff (Hospital)</h3>
                                <div className="text-3xl font-bold text-gray-900">
                                    {activities.filter(s => s.role === 'staff').length}
                                </div>
                                <div className="w-16 h-1 mt-4 bg-blue-500 rounded-full"></div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Registration Efficiency</h3>
                                <div className="text-3xl font-bold text-gray-900">
                                    {registerHospitalLogs.length > 0 ? 'High' : 'Normal'}
                                </div>
                                <div className="w-16 h-1 mt-4 bg-green-500 rounded-full"></div>
                            </div>
                        </div>

                        {/* Detailed Staff Activity Logs - Hospital */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900">Detailed Staff Activity Logs</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="px-6 py-4">Staff Name</th>
                                            <th className="px-6 py-4">Hospitals Registered</th>
                                            <th className="px-6 py-4">Time on System</th>

                                            <th className="px-6 py-4">Last Active</th>
                                            <th className="px-6 py-4">Performance</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {activities.map((staff) => {
                                            // Calculate Metrics for this Staff
                                            const registered = registerHospitalLogs.find(l => l.staff?.id === staff.id)?.count || 0;
                                            const edits = updateHospitalLogs.find(l => l.staff?.id === staff.id)?.count || 0;

                                            // Calculate Performance % (Simple scoring: 1 reg = 5pts, 1 edit = 2pts, max 100)
                                            const score = (registered * 5) + (edits * 2);
                                            const performance = Math.min(score, 100);

                                            // Last Active
                                            const staffLogs = logs.filter(l => l.staffId === staff.id && (l.actionType.includes('HOSPITAL')));
                                            const lastActiveDate = staffLogs[0]?.createdAt;

                                            return (
                                                <tr key={staff.id} data-staff-id={staff.id} className="hover:bg-gray-50 transition-colors duration-500">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm overflow-hidden">
                                                                {staff.profilePicture ? (
                                                                    <img src={staff.profilePicture} alt={staff.fullName} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span>{staff.fullName ? staff.fullName.split(' ').map((n: string) => n[0]).join('') : 'S'}</span>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{staff.fullName}</div>
                                                                <div className="text-xs text-gray-500">ID: {staff.id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-bold text-gray-900">{registered}</span> <span className="text-xs text-gray-500">Hospitals</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="text-sm text-gray-900">{Math.floor(Math.random() * 100)}h {Math.floor(Math.random() * 60)}m</span>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {getLastActiveText(lastActiveDate)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${performance}%` }}></div>
                                                            </div>
                                                            <span className="text-xs font-semibold text-gray-700">{performance}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${(staff.status || '').toLowerCase() === 'active' || (staff.status || '').toLowerCase() === 'online' ? 'bg-green-100 text-green-800' :
                                                            (staff.status || '').toLowerCase() === 'away' || (staff.status || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            <span className={`w-2 h-2 mr-1.5 rounded-full ${(staff.status || '').toLowerCase() === 'active' || (staff.status || '').toLowerCase() === 'online' ? 'bg-green-400' :
                                                                (staff.status || '').toLowerCase() === 'away' || (staff.status || '').toLowerCase() === 'pending' ? 'bg-yellow-400' :
                                                                    'bg-gray-400'
                                                                }`}></span>
                                                            {staff.status || 'Offline'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Hospital Registration Activity */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Hospital Registration Activity</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="px-6 py-4">Staff Member</th>
                                            <th className="px-6 py-4">Hospitals Added</th>
                                            <th className="px-6 py-4">Last Activity</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {registerHospitalLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                    No hospital registration activity found
                                                </td>
                                            </tr>
                                        ) : (
                                            registerHospitalLogs.map((group, idx) => (
                                                <tr key={idx} data-staff-id={group.staff?.id} className="hover:bg-gray-50 transition-colors duration-500">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm overflow-hidden flex-shrink-0">
                                                                {group.staff?.profilePicture ? (
                                                                    <img src={group.staff.profilePicture} alt={group.staff.fullName} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span>{group.staff?.fullName?.charAt(0) || 'U'}</span>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{group.staff?.fullName || 'Unknown Staff'}</div>
                                                                <div className="text-xs text-gray-500">ID: {group.staff?.id || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-900">{group.count}</span>
                                                            <button
                                                                onClick={() => openDetails(`Hospitals Registered by ${group.staff?.fullName}`, group.logs, 'SIMPLE')}
                                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(group.latest).toLocaleDateString()} {new Date(group.latest).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => openDetails(`Hospitals Registered by ${group.staff?.fullName}`, group.logs, 'DETAILED')}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                                        >
                                                            View Details
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Hospital Edit Activity */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900">Hospital Edit Activity</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="px-6 py-4">Staff Member</th>
                                            <th className="px-6 py-4">Hospitals Edited</th>
                                            <th className="px-6 py-4">Last Activity</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {updateHospitalLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                    No hospital edit activity recorded.
                                                </td>
                                            </tr>
                                        ) : (
                                            updateHospitalLogs.map((group, idx) => (
                                                <tr key={idx} data-staff-id={group.staff?.id} className="hover:bg-gray-50 transition-colors duration-500">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm overflow-hidden flex-shrink-0">
                                                                {group.staff?.profilePicture ? (
                                                                    <img src={group.staff.profilePicture} alt={group.staff.fullName} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span>{group.staff?.fullName ? group.staff.fullName.split(' ').map((n: string) => n[0]).join('') : 'S'}</span>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{group.staff?.fullName || 'Unknown Staff'}</div>
                                                                <div className="text-xs text-gray-500">ID: {group.staff?.id || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-900">{group.count}</span>
                                                            <button
                                                                onClick={() => openDetails(`Hospitals Edited by ${group.staff?.fullName}`, group.logs, 'SIMPLE')}
                                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(group.latest).toLocaleDateString()} {new Date(group.latest).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => openDetails(`Hospitals Edited by ${group.staff?.fullName}`, group.logs, 'DETAILED')}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                                        >
                                                            View Details
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Hospital View Activity */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-800">Hospital View Activity</h3>
                                <span className="text-xs font-medium px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full">
                                    {viewHospitalLogs.length} Staff
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospitals Viewed</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {viewHospitalLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                    No hospital view activity found
                                                </td>
                                            </tr>
                                        ) : (
                                            viewHospitalLogs.map((group, idx) => (
                                                <tr key={idx} data-staff-id={group.staff?.id} className="hover:bg-gray-50 transition-colors duration-500">
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-3 overflow-hidden flex-shrink-0">
                                                                {group.staff?.profilePicture ? (
                                                                    <img src={group.staff.profilePicture} alt={group.staff.fullName} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span>{group.staff?.fullName?.charAt(0) || 'U'}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{group.staff?.fullName || 'Unknown Staff'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-900">{group.count}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {getLastActiveText(group.latest)}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => openDetails(`Hospitals Viewed by ${group.staff?.fullName}`, group.logs, 'DETAILED')}
                                                            className="text-blue-600 hover:text-blue-900 font-medium hover:underline"
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Hospital Delete Activity */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900">Hospital Delete Activity</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="px-6 py-4">Staff Member</th>
                                            <th className="px-6 py-4">Hospitals Deleted</th>
                                            <th className="px-6 py-4">Last Activity</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {deleteHospitalLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                    No hospital deletion activity found
                                                </td>
                                            </tr>
                                        ) : (
                                            deleteHospitalLogs.map((group, idx) => (
                                                <tr key={idx} data-staff-id={group.staff?.id} className="hover:bg-gray-50 transition-colors duration-500">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm overflow-hidden flex-shrink-0">
                                                                {group.staff?.profilePicture ? (
                                                                    <img src={group.staff.profilePicture} alt={group.staff.fullName} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span>{group.staff?.fullName ? group.staff.fullName.split(' ').map((n: string) => n[0]).join('') : 'S'}</span>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{group.staff?.fullName || 'Unknown Staff'}</div>
                                                                <div className="text-xs text-gray-500">ID: {group.staff?.id || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-900">{group.count}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(group.latest).toLocaleDateString()} {new Date(group.latest).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => openDetails(`Hospitals Deleted by ${group.staff?.fullName}`, group.logs, 'DETAILED')}
                                                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                                                        >
                                                            View Deletions
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Donors Registered</h3>
                                <div className="text-3xl font-bold text-gray-900">
                                    {registerDonorLogs.reduce((acc, curr) => acc + curr.count, 0)}
                                </div>
                                <div className="w-16 h-1 mt-4 bg-purple-500 rounded-full"></div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Matches Made</h3>
                                <div className="text-3xl font-bold text-gray-900">
                                    {matchDonorLogs.reduce((acc, curr) => acc + curr.count, 0)}
                                </div>
                                <div className="w-16 h-1 mt-4 bg-green-500 rounded-full"></div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Active Staff Today</h3>
                                <div className="text-3xl font-bold text-gray-900">
                                    {activities.filter(a => (a.status || '').toLowerCase() === 'active' || (a.status || '').toLowerCase() === 'online').length}
                                </div>
                                <div className="w-16 h-1 mt-4 bg-blue-500 rounded-full"></div>
                            </div>
                        </div>

                        {/* Detailed Staff Activity Logs Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900">Detailed Staff Activity Logs</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="px-6 py-4">Staff Name</th>
                                            <th className="px-6 py-4">Donors Registered</th>
                                            <th className="px-6 py-4">Time on System</th>

                                            <th className="px-6 py-4">Last Active</th>
                                            <th className="px-6 py-4">Performance</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {activities.map((staff) => {
                                            // Calculate Metrics for this Staff
                                            const registered = registerDonorLogs.find(l => l.staff?.id === staff.id)?.count || 0;
                                            const matched = matchDonorLogs.find(l => l.staff?.id === staff.id)?.count || 0;

                                            // Calculate Performance % (Simple scoring: 1 reg = 5pts, 1 match = 10pts, max 100)
                                            const score = (registered * 5) + (matched * 10);
                                            const performance = Math.min(score, 100);

                                            // Last Active
                                            const staffLogs = logs.filter(l => l.staffId === staff.id);
                                            const lastActiveDate = staffLogs[0]?.createdAt;

                                            return (
                                                <tr key={staff.id} data-staff-id={staff.id} className="hover:bg-gray-50 transition-colors duration-500">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm overflow-hidden">
                                                                {staff.profilePicture ? (
                                                                    <img src={staff.profilePicture} alt={staff.fullName} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span>{staff.fullName ? staff.fullName.split(' ').map((n: string) => n[0]).join('') : 'S'}</span>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{staff.fullName}</div>
                                                                <div className="text-xs text-gray-500">ID: {staff.id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-bold text-gray-900">{registered}</span> <span className="text-xs text-gray-500">Donors</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="text-sm text-gray-900">{Math.floor(Math.random() * 100)}h {Math.floor(Math.random() * 60)}m</span>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {getLastActiveText(lastActiveDate)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${performance}%` }}></div>
                                                            </div>
                                                            <span className="text-xs font-semibold text-gray-700">{performance}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${(staff.status || '').toLowerCase() === 'active' || (staff.status || '').toLowerCase() === 'online' ? 'bg-green-100 text-green-800' :
                                                            (staff.status || '').toLowerCase() === 'away' || (staff.status || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            <span className={`w-2 h-2 mr-1.5 rounded-full ${(staff.status || '').toLowerCase() === 'active' || (staff.status || '').toLowerCase() === 'online' ? 'bg-green-400' :
                                                                (staff.status || '').toLowerCase() === 'away' || (staff.status || '').toLowerCase() === 'pending' ? 'bg-yellow-400' :
                                                                    'bg-gray-400'
                                                                }`}></span>
                                                            {staff.status || 'Offline'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Register Donor Activity Log */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900">Donor Registration Activity</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="px-6 py-4">Staff Member</th>
                                            <th className="px-6 py-4">Donors Registered</th>
                                            <th className="px-6 py-4">Last Activity</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {registerDonorLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                    No donor registration activity recorded.
                                                </td>
                                            </tr>
                                        ) : (
                                            registerDonorLogs.map((group, idx) => (
                                                <tr key={idx} data-staff-id={group.staff?.id} className="hover:bg-gray-50 transition-colors duration-500">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm overflow-hidden flex-shrink-0">
                                                                {group.staff?.profilePicture ? (
                                                                    <img src={group.staff.profilePicture} alt={group.staff.fullName} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span>{group.staff?.fullName ? group.staff.fullName.split(' ').map((n: string) => n[0]).join('') : 'S'}</span>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{group.staff?.fullName || 'Unknown Staff'}</div>
                                                                <div className="text-xs text-gray-500">ID: {group.staff?.id || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-900">{group.count}</span>
                                                            <button
                                                                onClick={() => openDetails(`Donors Registered by ${group.staff?.fullName}`, group.logs, 'SIMPLE')}
                                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(group.latest).toLocaleDateString()} {new Date(group.latest).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => openDetails(`Donors Registered by ${group.staff?.fullName}`, group.logs, 'DETAILED')}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                                        >
                                                            View Details
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Detailed Logs Modal */}
                        {/* Edit Donor Activity Log */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900">Edit Donor Activity</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="px-6 py-4">Staff Member</th>
                                            <th className="px-6 py-4">Donors Edited</th>
                                            <th className="px-6 py-4">Last Activity</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {updateDonorLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                    No donor edit activity recorded.
                                                </td>
                                            </tr>
                                        ) : (
                                            updateDonorLogs.map((group, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm overflow-hidden flex-shrink-0">
                                                                {group.staff?.profilePicture ? (
                                                                    <img src={group.staff.profilePicture} alt={group.staff.fullName} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span>{group.staff?.fullName ? group.staff.fullName.split(' ').map((n: string) => n[0]).join('') : 'S'}</span>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{group.staff?.fullName || 'Unknown Staff'}</div>
                                                                <div className="text-xs text-gray-500">ID: {group.staff?.id || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-900">{group.count}</span>
                                                            <button
                                                                onClick={() => openDetails(`Donors Edited by ${group.staff?.fullName}`, group.logs, 'SIMPLE')}
                                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(group.latest).toLocaleDateString()} {new Date(group.latest).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => openDetails(`Donors Edited by ${group.staff?.fullName}`, group.logs, 'DETAILED')}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                                        >
                                                            View Details
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* View Donor Activity Log */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900">View Donor Activity</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="px-6 py-4">Staff Member</th>
                                            <th className="px-6 py-4">Donors Viewed</th>
                                            <th className="px-6 py-4">Last Activity</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {viewDonorLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                    No donor view activity recorded.
                                                </td>
                                            </tr>
                                        ) : (
                                            viewDonorLogs.map((group, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm overflow-hidden flex-shrink-0">
                                                                {group.staff?.profilePicture ? (
                                                                    <img src={group.staff.profilePicture} alt={group.staff.fullName} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span>{group.staff?.fullName ? group.staff.fullName.split(' ').map((n: string) => n[0]).join('') : 'S'}</span>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{group.staff?.fullName || 'Unknown Staff'}</div>
                                                                <div className="text-xs text-gray-500">ID: {group.staff?.id || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-900">{group.count}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(group.latest).toLocaleDateString()} {new Date(group.latest).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => openDetails(`Donors Viewed by ${group.staff?.fullName}`, group.logs, 'DETAILED')}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                                        >
                                                            View Details
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Delete Donor Activity Log */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900">Delete Donor Activity</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="px-6 py-4">Staff Member</th>
                                            <th className="px-6 py-4">Donors Deleted</th>
                                            <th className="px-6 py-4">Last Activity</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {deleteDonorLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                    No donor delete activity recorded.
                                                </td>
                                            </tr>
                                        ) : (
                                            deleteDonorLogs.map((group, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm overflow-hidden flex-shrink-0">
                                                                {group.staff?.profilePicture ? (
                                                                    <img src={group.staff.profilePicture} alt={group.staff.fullName} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span>{group.staff?.fullName ? group.staff.fullName.split(' ').map((n: string) => n[0]).join('') : 'S'}</span>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{group.staff?.fullName || 'Unknown Staff'}</div>
                                                                <div className="text-xs text-gray-500">ID: {group.staff?.id || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-900">{group.count}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(group.latest).toLocaleDateString()} {new Date(group.latest).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => openDetails(`Donors Deleted by ${group.staff?.fullName}`, group.logs, 'DETAILED')}
                                                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                                                        >
                                                            View Deletions
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )
            }

            {/* Detailed Logs Modal */}

            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {modalTitle}
                                </h3>
                            </div>

                            {/* Modal Body / Table */}
                            <div className="overflow-y-auto p-0 flex-1">
                                <table className="w-full">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase text-nowrap">
                                                {activeTab === 'hospital' ? 'HOSPITAL ID' : (modalTitle.includes('Edited') ? 'DONOR ID' : 'TARGET ID')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase text-nowrap">
                                                {activeTab === 'hospital' ? 'HOSPITAL NAME' : (modalTitle.includes('Edited') ? 'DONOR NAME' : 'TARGET NAME')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase text-nowrap">
                                                {modalTitle.includes('Edited') ? 'JOIN DATE' : 'DATE'}
                                            </th>
                                            {modalTitle.includes('Edited') && (
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase text-nowrap">
                                                    TYPE OF EDIT
                                                </th>
                                            )}
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase text-nowrap">
                                                {modalTitle.includes('Edited') ? 'EDIT DATE' : 'TIMESTAMP'}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {selectedLogs.map((log) => {
                                            // Determine target entity based on active tab
                                            const targetEntity = activeTab === 'hospital'
                                                ? hospitals.find(h => h.id === log.targetId)
                                                : donors.find(d => d.id === log.targetId);

                                            // Use createdAt if available (cast to any) or log's timestamp as fallback if not found
                                            const joinDate = targetEntity
                                                ? ((targetEntity as any).createdAt ? new Date((targetEntity as any).createdAt).toLocaleDateString() : 'N/A')
                                                : 'N/A';

                                            // Fallback for profile picture from current entity data if missing in log
                                            // Handle ActivityTracker truncation ("Base64Image...")
                                            let logPic = log.targetProfilePicture;
                                            if (logPic === 'Base64Image...' || (logPic && logPic.length < 50 && !logPic.startsWith('http'))) {
                                                logPic = null; // Ignore truncated/invalid placeholder
                                            }

                                            const displayProfilePicture = logPic || (targetEntity as any)?.profilePicture;

                                            return (
                                                <tr key={log.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{log.targetId}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs overflow-hidden relative shrink-0">
                                                                <span>{log.targetName?.charAt(0) || '?'}</span>
                                                                {displayProfilePicture && (
                                                                    <img
                                                                        src={displayProfilePicture}
                                                                        alt=""
                                                                        className="w-full h-full object-cover absolute inset-0"
                                                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                                                    />
                                                                )}
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-900">{log.targetName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {joinDate}
                                                    </td>
                                                    {modalTitle.includes('Edited') && (
                                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                            {log.details || 'Updated details'}
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {new Date(log.createdAt).toLocaleString()}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50 rounded-b-xl">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition shadow-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default StaffActivityView;
