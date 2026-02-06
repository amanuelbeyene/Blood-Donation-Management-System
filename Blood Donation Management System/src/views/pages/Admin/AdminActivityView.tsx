import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { fetchAdmins, Admin } from '../../../controllers/adminController';
import { fetchStaff, Staff } from '../../../controllers/staffController';
import { apiClient } from '../../../controllers/apiClient';

// Update interface
interface AdminActivityLog {
    id: string;
    adminId: string;
    actionType: 'ADD_STAFF' | 'EDIT_STAFF' | 'DELETE_STAFF' | 'VIEW_STAFF' | 'APPROVE_DONOR' | 'REJECT_DONOR' | 'APPROVE_HOSPITAL' | 'REJECT_HOSPITAL';
    targetId: string;
    targetName: string;
    targetProfilePicture?: string | null;
    targetJoinDate?: string | null;
    details: string;
    createdAt: string;
    admin?: {
        id: string;
        fullName: string;
        profilePicture: string | null;
    };
}

const AdminActivityView = () => {
    const { t } = useLanguage();
    const [activities, setActivities] = useState<Admin[]>([]);
    const [logs, setLogs] = useState<AdminActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedLogs, setSelectedLogs] = useState<AdminActivityLog[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalType, setModalType] = useState<'SIMPLE' | 'DETAILED'>('SIMPLE');

    const [staffList, setStaffList] = useState<Staff[]>([]); // To filter out deleted staff
    const location = useLocation();

    useEffect(() => {
        if (!loading && location.state?.highlightId && logs.length > 0) {
            const highlightId = location.state.highlightId;
            let targetElementId = '';

            // Find the log entry related to the notification
            const targetLog = logs.find(l => l.targetId === highlightId || l.adminId === highlightId);

            if (targetLog) {
                if (['ADD_STAFF', 'EDIT_STAFF', 'VIEW_STAFF', 'DELETE_STAFF'].includes(targetLog.actionType)) {
                    // For staff actions, we group by Admin, so highlight the Admin's row in the specific table
                    targetElementId = `${targetLog.actionType}-${targetLog.adminId}`;
                } else {
                    // For approvals, we list individual items, so highlight the specific item row
                    targetElementId = `${targetLog.actionType}-${targetLog.targetId}`;
                }
            }

            if (targetElementId) {
                // Small timeout to ensure DOM is ready
                setTimeout(() => {
                    const element = document.getElementById(targetElementId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.classList.add('bg-gray-200');

                        // Clean up
                        setTimeout(() => {
                            element.classList.remove('bg-gray-200');
                            // Clear state to prevent re-highlighting on simple re-renders (optional, but good practice)
                            window.history.replaceState({}, document.title);
                        }, 3000);
                    }
                }, 100);
            }
        }
    }, [loading, logs, location.state]);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch staff to know who is active
                const staffData = await fetchStaff();
                setStaffList(staffData);

                const adminData = await fetchAdmins();
                const filteredAdmins = adminData.filter(a =>
                    a.role.toLowerCase() !== 'super_admin' &&
                    a.role.toLowerCase() !== 'super admin' &&
                    !a.role.includes('super') &&
                    a.id !== 'SA0000001'
                );
                setActivities(filteredAdmins);

                // Fetch logs
                const logsResponse = await apiClient.get('/admins/activity-logs');
                setLogs(logsResponse.data);
            } catch (error) {
                console.error("Failed to load admin activities", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const openDetails = (title: string, logs: AdminActivityLog[], type: 'SIMPLE' | 'DETAILED') => {
        setModalTitle(title);
        setSelectedLogs(logs);
        setModalType(type);
        setIsModalOpen(true);
    };

    // Group logs by Admin
    // FILTERING LOGIC: Exclude logs where targetId (Staff ID) does not exist in currently fetched staff
    const groupLogsByAdmin = (type: string) => {
        const activeStaffIds = new Set(staffList.map(s => s.id));

        const filtered = logs.filter(l =>
            l.actionType === type &&
            l.adminId !== 'SA0000001' &&
            l.admin?.id !== 'SA0000001' &&
            // @ts-ignore
            l.admin?.role?.toLowerCase() !== 'super_admin' &&
            // For Staff-related actions, ensure target exists in staffList
            ((['ADD_STAFF', 'EDIT_STAFF', 'VIEW_STAFF'].includes(type)) ? activeStaffIds.has(l.targetId) : true)
        );
        const grouped: { [key: string]: AdminActivityLog[] } = {};

        filtered.forEach(log => {
            if (!grouped[log.adminId]) grouped[log.adminId] = [];
            grouped[log.adminId].push(log);
        });

        return Object.values(grouped).map(group => ({
            admin: group[0].admin,
            count: group.length,
            latest: group[0].createdAt,
            logs: group
        }));
    };

    const addStaffLogs = groupLogsByAdmin('ADD_STAFF');
    const editStaffLogs = groupLogsByAdmin('EDIT_STAFF');
    const deleteStaffLogs = groupLogsByAdmin('DELETE_STAFF');
    const viewStaffLogs = groupLogsByAdmin('VIEW_STAFF');

    // --- Split Approval Logs ---

    // Donor Approval Logs
    const donorApprovalLogs = logs.filter(l =>
        ['APPROVE_DONOR', 'REJECT_DONOR'].includes(l.actionType) &&
        l.adminId !== 'SA0000001'
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Hospital Approval Logs
    const hospitalApprovalLogs = logs.filter(l =>
        ['APPROVE_HOSPITAL', 'REJECT_HOSPITAL'].includes(l.actionType) &&
        l.adminId !== 'SA0000001'
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Admin Activity Monitor</h2>
                    <p className="text-gray-600 mt-1">Track admin performance and staff management activities.</p>
                </div>
                <div className="flex gap-3">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        Active Admins: {activities.filter(a => a.status === 'active').length}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        Total Admins: {activities.length}
                    </span>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Staff Registered</h3>
                    <div className="text-3xl font-bold text-gray-900">
                        {addStaffLogs.reduce((acc, curr) => acc + curr.count, 0)}
                    </div>
                    <div className="w-16 h-1 mt-4 bg-purple-500 rounded-full"></div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">High Performance Admins</h3>
                    <div className="text-3xl font-bold text-gray-900">
                        {activities.filter(a => {
                            const staffCount = addStaffLogs.find(l => l.admin?.id === a.id)?.count || 0;
                            return staffCount >= 5; // Threshold for high performance
                        }).length}
                    </div>
                    <div className="w-16 h-1 mt-4 bg-green-500 rounded-full"></div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Avg. Time on System</h3>
                    <div className="text-3xl font-bold text-gray-900">
                        ~{Math.round(activities.reduce((acc, curr) => {
                            const start = new Date(curr.createdAt || Date.now());
                            const now = new Date();
                            const diffHours = Math.abs(now.getTime() - start.getTime()) / (1000 * 60 * 60);
                            return acc + diffHours;
                        }, 0) / (activities.length || 1))}h
                    </div>
                    <div className="w-16 h-1 mt-4 bg-blue-500 rounded-full"></div>
                </div>
            </div>

            {/* Detailed Admin Activity Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Detailed Admin Activity Logs</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Admin Name</th>
                                <th className="px-6 py-4">Staff Registered</th>
                                <th className="px-6 py-4">Time on System</th>
                                <th className="px-6 py-4">Last Active</th>
                                <th className="px-6 py-4">Performance</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {activities.map((admin) => {
                                // Calculate Metrics for this Admin
                                const staffRegistered = addStaffLogs.find(l => l.admin?.id === admin.id)?.count || 0;

                                // Calculate Performance % (Relative to highest performer or fixed target e.g. 20)
                                const maxStaff = Math.max(...addStaffLogs.map(l => l.count), 20);
                                const performance = Math.min(Math.round((staffRegistered / maxStaff) * 100), 100);

                                // Last Active (Find latest log for this admin across all types)
                                const allAdminLogs = [
                                    ...(addStaffLogs.find(l => l.admin?.id === admin.id)?.logs || []),
                                    ...(editStaffLogs.find(l => l.admin?.id === admin.id)?.logs || [])
                                ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                                const lastActiveDate = allAdminLogs[0]?.createdAt;
                                const getLastActiveText = (dateStr?: string) => {
                                    if (!dateStr) return 'No activity';
                                    const diff = Date.now() - new Date(dateStr).getTime();
                                    const mins = Math.floor(diff / 60000);
                                    if (mins < 60) return `${mins} mins ago`;
                                    const hours = Math.floor(mins / 60);
                                    if (hours < 24) return `${hours} hours ago`;
                                    return `${Math.floor(hours / 24)} days ago`;
                                };

                                // Time on System Logic reuse
                                const calculateTimeOnSystem = (dateString?: string) => {
                                    if (!dateString) return 'N/A';
                                    const start = new Date(dateString);
                                    const now = new Date();
                                    const diffTime = Math.abs(now.getTime() - start.getTime());
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    const diffHours = Math.abs(now.getTime() - start.getTime()) / (36e5);

                                    return `${Math.floor(diffHours)}h ${Math.floor((diffHours % 1) * 60)}m`;
                                };

                                return (
                                    <tr key={admin.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm overflow-hidden">
                                                    {admin.profilePicture ? (
                                                        <img src={admin.profilePicture} alt={admin.fullName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{admin.fullName ? admin.fullName.split(' ').map(n => n[0]).join('') : 'A'}</span>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{admin.fullName}</div>
                                                    <div className="text-xs text-gray-500">ID: {admin.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-gray-900">{staffRegistered}</span> <span className="text-xs text-gray-500">Staff</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {calculateTimeOnSystem(admin.createdAt)}
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
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${admin.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                                <span className={`w-2 h-2 mr-1.5 rounded-full 
                                                ${admin.status === 'active' ? 'bg-green-400' :
                                                        'bg-gray-400'}`}></span>
                                                {admin.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>



            {/* Add Staff Members Log */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Add Staff Members Activity</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Admin ID & Name</th>
                                <th className="px-6 py-4">Staff Added</th>
                                <th className="px-6 py-4">Last Activity</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {addStaffLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No staff registration activity recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                addStaffLogs.map((group, idx) => (
                                    <tr key={idx} id={`ADD_STAFF-${group.admin?.id}`} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm overflow-hidden flex-shrink-0">
                                                    {group.admin?.profilePicture ? (
                                                        <img src={group.admin.profilePicture} alt={group.admin.fullName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{group.admin?.fullName ? group.admin.fullName.split(' ').map(n => n[0]).join('') : 'A'}</span>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{group.admin?.fullName || 'Unknown Admin'}</div>
                                                    <div className="text-xs text-gray-500">ID: {group.admin?.id || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-900">{group.count}</span>
                                                <button
                                                    onClick={() => openDetails(`Staff Added by ${group.admin?.fullName}`, group.logs, 'SIMPLE')}
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
                                                onClick={() => openDetails(`Staff Added by ${group.admin?.fullName}`, group.logs, 'DETAILED')}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                            >
                                                View Staff Info
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

            {/* Edit Staff Members Log */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Staff Members Activity</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Admin ID & Name</th>
                                <th className="px-6 py-4">Staff Edited</th>
                                <th className="px-6 py-4">Last Activity</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {editStaffLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No staff editing activity recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                editStaffLogs.map((group, idx) => (
                                    <tr key={idx} id={`EDIT_STAFF-${group.admin?.id}`} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm overflow-hidden flex-shrink-0">
                                                    {group.admin?.profilePicture ? (
                                                        <img src={group.admin.profilePicture} alt={group.admin.fullName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{group.admin?.fullName ? group.admin.fullName.split(' ').map(n => n[0]).join('') : 'A'}</span>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{group.admin?.fullName || 'Unknown Admin'}</div>
                                                    <div className="text-xs text-gray-500">ID: {group.admin?.id || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-900">{group.count}</span>
                                                <button
                                                    onClick={() => openDetails(`Staff Edited by ${group.admin?.fullName}`, group.logs, 'SIMPLE')}
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
                                                onClick={() => openDetails(`Staff Edited by ${group.admin?.fullName}`, group.logs, 'DETAILED')}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                            >
                                                View Staff Info
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

            {/* View Staff Members Log */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">View Staff Members Activity</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Admin ID & Name</th>
                                <th className="px-6 py-4">Staff Viewed</th>
                                <th className="px-6 py-4">Last Activity</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {viewStaffLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No staff view activity recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                viewStaffLogs.map((group, idx) => (
                                    <tr key={idx} id={`VIEW_STAFF-${group.admin?.id}`} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm overflow-hidden flex-shrink-0">
                                                    {group.admin?.profilePicture ? (
                                                        <img src={group.admin.profilePicture} alt={group.admin.fullName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{group.admin?.fullName ? group.admin.fullName.split(' ').map(n => n[0]).join('') : 'A'}</span>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{group.admin?.fullName || 'Unknown Admin'}</div>
                                                    <div className="text-xs text-gray-500">ID: {group.admin?.id || 'N/A'}</div>
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
                                                onClick={() => openDetails(`Staff Viewed by ${group.admin?.fullName}`, group.logs, 'DETAILED')}
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

            {/* Delete Staff Members Log */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Delete Staff Members Activity</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Admin ID & Name</th>
                                <th className="px-6 py-4">Staff Deleted</th>
                                <th className="px-6 py-4">Last Activity</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {deleteStaffLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No staff deletion activity recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                deleteStaffLogs.map((group, idx) => (
                                    <tr key={idx} id={`DELETE_STAFF-${group.admin?.id}`} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm overflow-hidden flex-shrink-0">
                                                    {group.admin?.profilePicture ? (
                                                        <img src={group.admin.profilePicture} alt={group.admin.fullName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{group.admin?.fullName ? group.admin.fullName.split(' ').map(n => n[0]).join('') : 'A'}</span>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{group.admin?.fullName || 'Unknown Admin'}</div>
                                                    <div className="text-xs text-gray-500">ID: {group.admin?.id || 'N/A'}</div>
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
                                                onClick={() => openDetails(`Staff Deleted by ${group.admin?.fullName}`, group.logs, 'DETAILED')}
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

            {/* Donor Approval & Rejection History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Donor Approval & Rejection History</h3>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{donorApprovalLogs.length} Records</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Admin</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Donor Name</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {donorApprovalLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No donor approval or rejection activity recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                donorApprovalLogs.map((log) => {
                                    const isRejection = log.actionType.includes('REJECT');

                                    return (
                                        <tr key={log.id} id={`${log.actionType}-${log.targetId}`} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs overflow-hidden flex-shrink-0">
                                                        {log.admin?.profilePicture ? (
                                                            <img src={log.admin.profilePicture} alt={log.admin.fullName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{log.admin?.fullName ? log.admin.fullName.split(' ').map(n => n[0]).join('') : 'A'}</span>
                                                        )}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">{log.admin?.fullName || 'Unknown Admin'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${isRejection ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {isRejection ? 'Rejected' : 'Approved'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-bold text-gray-900">{log.targetName}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={log.details}>
                                                {log.details}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Hospital Approval & Rejection History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Hospital Approval & Rejection History</h3>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{hospitalApprovalLogs.length} Records</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Admin</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Hospital Name</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {hospitalApprovalLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No hospital approval or rejection activity recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                hospitalApprovalLogs.map((log) => {
                                    const isRejection = log.actionType.includes('REJECT');

                                    return (
                                        <tr key={log.id} id={`${log.actionType}-${log.targetId}`} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs overflow-hidden flex-shrink-0">
                                                        {log.admin?.profilePicture ? (
                                                            <img src={log.admin.profilePicture} alt={log.admin.fullName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{log.admin?.fullName ? log.admin.fullName.split(' ').map(n => n[0]).join('') : 'A'}</span>
                                                        )}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">{log.admin?.fullName || 'Unknown Admin'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${isRejection ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {isRejection ? 'Rejected' : 'Approved'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-bold text-gray-900">{log.targetName}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={log.details}>
                                                {log.details}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detailed Logs Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle lg:max-w-4xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            {modalTitle}
                                        </h3>
                                        <div className="mt-4 max-h-96 overflow-y-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff ID</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Name</th>
                                                        {(modalTitle.includes('Edited') || (modalType === 'DETAILED' && selectedLogs.some(l => l.actionType === 'EDIT_STAFF'))) ? (
                                                            <>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type of edit</th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edit Date</th>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                                                                {modalType === 'DETAILED' && (
                                                                    <>
                                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {selectedLogs.map((log) => {
                                                        let typeOfEdit = 'General Update';
                                                        let isEditLog = log.actionType === 'EDIT_STAFF';

                                                        if (isEditLog) {
                                                            try {
                                                                if (log.details.startsWith('{')) {
                                                                    const parsed = JSON.parse(log.details);
                                                                    if (parsed.changes) {
                                                                        typeOfEdit = parsed.changes.map((c: any) => c.field).join(', ');
                                                                    } else if (parsed.text) {
                                                                        typeOfEdit = parsed.text;
                                                                    }
                                                                } else {
                                                                    typeOfEdit = log.details;
                                                                }
                                                            } catch (e) {
                                                                typeOfEdit = log.details;
                                                            }
                                                        }

                                                        const isEditView = modalTitle.includes('Edited') || (modalType === 'DETAILED' && isEditLog);

                                                        return (
                                                            <tr key={log.id}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    <div className="flex items-center">
                                                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs overflow-hidden flex-shrink-0 mr-3">
                                                                            {log.targetProfilePicture ? (
                                                                                <img src={log.targetProfilePicture} alt={log.targetName} className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <span>{log.targetName ? log.targetName.split(' ').map(n => n[0]).join('') : 'S'}</span>
                                                                            )}
                                                                        </div>
                                                                        {log.targetId}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.targetName}</td>

                                                                {isEditView ? (
                                                                    <>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                            {log.targetJoinDate ? new Date(log.targetJoinDate).toLocaleDateString() : 'N/A'}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                                            {typeOfEdit}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                            {new Date(log.createdAt).toLocaleString()}
                                                                        </td>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                            {new Date(log.createdAt).toLocaleString()}
                                                                        </td>
                                                                        {modalType === 'DETAILED' && (
                                                                            <>
                                                                                <td className="px-6 py-4 text-sm text-gray-500">{log.details}</td>
                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                    {log.actionType === 'DELETE_STAFF' ? (
                                                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                                                                            Deactive
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                                                            Active
                                                                                        </span>
                                                                                    )}
                                                                                </td>
                                                                            </>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default AdminActivityView;
