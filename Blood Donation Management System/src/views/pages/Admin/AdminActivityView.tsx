import { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface AdminActivity {
    id: string;
    name: string;
    staffRegistered: number;
    timeSpent: string; // e.g., "12h 45m"
    lastActive: string;
    status: 'active' | 'inactive';
    performanceScore: number;
}

interface ActivityLog {
    id: string;
    adminName: string;
    action: 'Approve' | 'Reject';
    targetType: 'Donor' | 'Hospital';
    targetName: string;
    reason?: string;
    timestamp: string;
}

const MOCK_ADMIN_ACTIVITY: AdminActivity[] = [
    {
        id: '1',
        name: 'Kebede Abebe',
        staffRegistered: 15,
        timeSpent: '120h 30m',
        lastActive: '10 mins ago',
        status: 'active',
        performanceScore: 92
    },
    {
        id: '2',
        name: 'Marta Tadesse',
        staffRegistered: 8,
        timeSpent: '45h 15m',
        lastActive: '1 day ago',
        status: 'inactive',
        performanceScore: 78
    },
    {
        id: '3',
        name: 'Yonas Berhanu',
        staffRegistered: 25,
        timeSpent: '210h 00m',
        lastActive: 'Active now',
        status: 'active',
        performanceScore: 98
    },
    {
        id: '4',
        name: 'Tigist Haile',
        staffRegistered: 3,
        timeSpent: '12h 45m',
        lastActive: '1 week ago',
        status: 'inactive',
        performanceScore: 65
    },
    {
        id: '5',
        name: 'Solomon Desta',
        staffRegistered: 12,
        timeSpent: '85h 20m',
        lastActive: '3 hours ago',
        status: 'active',
        performanceScore: 88
    }
];

const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
    { id: '1', adminName: 'Kebede Abebe', action: 'Reject', targetType: 'Donor', targetName: 'Abebe Bikila', reason: 'Underage (Age: 17)', timestamp: '2 hours ago' },
    { id: '2', adminName: 'Marta Tadesse', action: 'Approve', targetType: 'Hospital', targetName: 'Black Lion Hospital', timestamp: '5 hours ago' },
    { id: '3', adminName: 'Kebede Abebe', action: 'Reject', targetType: 'Hospital', targetName: 'Unknown Clinic', reason: 'Invalid License Number provided', timestamp: '1 day ago' },
    { id: '4', adminName: 'Solomon Desta', action: 'Approve', targetType: 'Donor', targetName: 'Tigist Assefa', timestamp: '2 days ago' },
    { id: '5', adminName: 'Yonas Berhanu', action: 'Reject', targetType: 'Donor', targetName: 'Dawit Mekonnen', reason: 'Medical Ineligibility: High Blood Pressure', timestamp: '3 days ago' }
];

const AdminActivityView = () => {
    const { t } = useLanguage();
    const [activities] = useState<AdminActivity[]>(MOCK_ADMIN_ACTIVITY);
    const [logs] = useState<ActivityLog[]>(MOCK_ACTIVITY_LOGS);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Admin Activity Monitor</h2>
                    <p className="text-gray-600 mt-1">Track admin performance, staff registrations, and system usage.</p>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Total Staff Registered</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {activities.reduce((sum, item) => sum + item.staffRegistered, 0)}
                    </p>
                    <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-3/4"></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">High Performance Admins</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {activities.filter(a => a.performanceScore > 90).length}
                    </p>
                    <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-1/2"></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Avg. Time on System</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">~95h</p>
                    <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-2/3"></div>
                    </div>
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
                            {activities.map((admin) => (
                                <tr key={admin.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                                                {admin.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                                                <div className="text-xs text-gray-500">ID: {admin.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-sm font-bold text-gray-900">{admin.staffRegistered}</span>
                                            <span className="ml-2 text-xs text-gray-500">Staff</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm text-gray-900">{admin.timeSpent}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {admin.lastActive}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-1 w-24 bg-gray-200 rounded-full h-2 mr-2">
                                                <div
                                                    className={`h-2 rounded-full ${admin.performanceScore > 90 ? 'bg-green-500' : admin.performanceScore > 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    style={{ width: `${admin.performanceScore}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-medium text-gray-700">{admin.performanceScore}%</span>
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* NEW SECTION: Approval & Rejection History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Approval & Rejection History</h3>
                    <div className="flex gap-2">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-md">Approvals</span>
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-md">Rejections</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Admin Name</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Target (Donor/Hospital)</th>
                                <th className="px-6 py-4">Status/Reason</th>
                                <th className="px-6 py-4">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {log.adminName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.action === 'Approve' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <span className="font-semibold">{log.targetType}:</span> {log.targetName}
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.action === 'Reject' ? (
                                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
                                                <span className="font-bold">Case:</span> {log.reason}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-green-600 font-medium">Approved Successfully</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {log.timestamp}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminActivityView;
