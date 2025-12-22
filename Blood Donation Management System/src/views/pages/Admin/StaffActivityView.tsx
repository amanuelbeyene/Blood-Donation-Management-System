import { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface StaffActivity {
    id: string;
    name: string;
    role: string;
    donorsRegistered: number;
    donorsMatched: number;
    timeSpent: string; // e.g., "45h 30m"
    lastLogin: string;
    status: 'online' | 'offline' | 'away';
}

const MOCK_ACTIVITY: StaffActivity[] = [
    {
        id: '1',
        name: 'Abebe Kebede',
        role: 'Staff',
        donorsRegistered: 145,
        donorsMatched: 32,
        timeSpent: '120h 15m',
        lastLogin: '2 mins ago',
        status: 'online',
    },
    {
        id: '2',
        name: 'Marta Yilma',
        role: 'Staff',
        donorsRegistered: 89,
        donorsMatched: 15,
        timeSpent: '85h 40m',
        lastLogin: '1 hour ago',
        status: 'offline',
    },
    {
        id: '3',
        name: 'Kebede Tadesse',
        role: 'Staff',
        donorsRegistered: 210,
        donorsMatched: 56,
        timeSpent: '150h 05m',
        lastLogin: 'Active now',
        status: 'online',
    },
    {
        id: '4',
        name: 'Sara Mohammed',
        role: 'Staff',
        donorsRegistered: 67,
        donorsMatched: 12,
        timeSpent: '45h 20m',
        lastLogin: '2 days ago',
        status: 'away',
    }
];

const StaffActivityView = () => {
    const { t } = useLanguage();
    const [activities] = useState<StaffActivity[]>(MOCK_ACTIVITY);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Staff Activity Monitor</h2>
                    <p className="text-gray-600 mt-1">Track staff performance, donor registrations, and system usage.</p>
                </div>
                <div className="flex gap-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Online: {activities.filter(a => a.status === 'online').length}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        Total Staff: {activities.length}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Total Donors Registered</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {activities.reduce((sum, item) => sum + item.donorsRegistered, 0)}
                    </p>
                    <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-3/4"></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Total Matches Made</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {activities.reduce((sum, item) => sum + item.donorsMatched, 0)}
                    </p>
                    <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-1/2"></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Active Staff Today</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {activities.filter(a => a.status !== 'offline').length}
                    </p>
                    <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-2/3"></div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Detailed Activity Logs</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Staff Member</th>
                                <th className="px-6 py-4">Registered Donors</th>
                                <th className="px-6 py-4">Matched Donors</th>
                                <th className="px-6 py-4">Time on System</th>
                                <th className="px-6 py-4">Last Active</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {activities.map((staff) => (
                                <tr key={staff.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                                                {staff.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                                                <div className="text-xs text-gray-500">{staff.role}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-sm font-bold text-gray-900">{staff.donorsRegistered}</span>
                                            <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">High</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {staff.donorsMatched}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm text-gray-900">{staff.timeSpent}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {staff.lastLogin}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${staff.status === 'online' ? 'bg-green-100 text-green-800' :
                                                staff.status === 'away' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            <span className={`w-2 h-2 mr-1.5 rounded-full 
                                                ${staff.status === 'online' ? 'bg-green-400' :
                                                    staff.status === 'away' ? 'bg-yellow-400' :
                                                        'bg-gray-400'}`}></span>
                                            {staff.status}
                                        </span>
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

export default StaffActivityView;
