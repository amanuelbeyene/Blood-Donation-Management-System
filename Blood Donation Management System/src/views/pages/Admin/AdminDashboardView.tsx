import { useEffect, useState } from 'react';
import { fetchDashboardStats, fetchDonationHistory } from '../../../controllers/adminController';
import { fetchStaff, Staff } from '../../../controllers/staffController';
import { ActivityTracker } from '../../../utils/ActivityTracker';
import { useNavigate } from 'react-router-dom';

const AdminDashboardView = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardStats().then(setStats);
    fetchDonationHistory().then(setDonations);

    // Fetch real staff list for accurate role distribution
    fetchStaff().then(setStaffList).catch(console.error);

    // Fetch real activity logs
    const logs = ActivityTracker.getLogs();
    setRecentActivity(logs.slice(0, 3)); // Top 3 recent logs
  }, []);

  // Mock data if needed or calculations
  const totalVolume = stats?.availableBloodUnits || 0;

  // Calculate Role Distribution from Real Data
  const roleStats = staffList.reduce((acc, staff) => {
    const role = staff.role || 'Unknown';
    // Normalize roles for display
    let displayRole = role;
    if (role.toLowerCase().includes('doctor') || role.toLowerCase() === 'medical_staff') displayRole = 'Medical Staff';
    else if (role.toLowerCase().includes('nurse')) displayRole = 'Nurse';
    else if (role.toLowerCase().includes('lab')) displayRole = 'Lab Technician'; // Assuming 'lab_technician'
    else if (role.toLowerCase().includes('support')) displayRole = 'Support Staff';
    else displayRole = 'Staff'; // Default for generic 'staff' role

    acc[displayRole] = (acc[displayRole] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalCalculatedStaff = staffList.length || 1;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>

      {/* Dedicated Management Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manage Donors Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 shadow-lg text-white relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full mix-blend-overlay group-hover:scale-110 transition-transform duration-500"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-4xl font-bold">{stats?.totalDonors || 0}</h3>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-1">Manage Donors</h4>
              <p className="text-blue-100 text-sm mb-6">Manage donor registrations, history, and appointments.</p>

              <button
                onClick={() => navigate('/admin/manage-staff?tab=donor')}
                className="w-full py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                Manage Staff on Donor →
              </button>
            </div>
          </div>
        </div>

        {/* Manage Hospitals Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-8 shadow-lg text-white relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full mix-blend-overlay group-hover:scale-110 transition-transform duration-500"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h3 className="text-4xl font-bold">{stats?.totalHospitals || 0}</h3>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-1">Manage Hospitals</h4>
              <p className="text-orange-100 text-sm mb-6">Coordinate with hospitals and manage blood requests.</p>

              <button
                onClick={() => navigate('/admin/manage-staff?tab=hospital')}
                className="w-full py-3 bg-white text-orange-600 hover:bg-orange-50 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                Manage Staff on Hospital →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Administration & Approvals Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Administration & Approvals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Staff Management */}
          <div className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Staff Administration</h4>
                  <p className="text-xs text-indigo-600 font-semibold">{stats?.totalStaff || 0} Active Members</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <button onClick={() => navigate('/admin/view-staff')} className="w-full text-left text-sm text-gray-600 hover:text-indigo-600 flex justify-between items-center group">
                View Staff Directory <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
              <button onClick={() => navigate('/admin/manage-staff')} className="w-full text-left text-sm text-gray-600 hover:text-indigo-600 flex justify-between items-center group">
                View Activity Logs <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
              <button onClick={() => navigate('/admin/add-staff')} className="w-full text-left text-sm text-gray-600 hover:text-indigo-600 flex justify-between items-center group">
                Add New Staff <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
            </div>
          </div>

          {/* Donor Approvals */}
          <div className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h4 className="font-bold text-gray-900">Donor Approvals</h4>
            </div>
            <div className="space-y-2">
              <button onClick={() => navigate('/admin/approve-donor')} className="w-full text-left text-sm text-gray-600 hover:text-blue-600 flex justify-between items-center group">
                Approve Registration <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
              <button onClick={() => navigate('/admin/reject-donor')} className="w-full text-left text-sm text-gray-600 hover:text-red-600 flex justify-between items-center group">
                Reject Registration <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
            </div>
          </div>

          {/* Hospital Approvals */}
          <div className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h4 className="font-bold text-gray-900">Hospital Approvals</h4>
            </div>
            <div className="space-y-2">
              <button onClick={() => navigate('/admin/approve-hospital')} className="w-full text-left text-sm text-gray-600 hover:text-orange-600 flex justify-between items-center group">
                Approve Registration <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
              <button onClick={() => navigate('/admin/reject-hospital')} className="w-full text-left text-sm text-gray-600 hover:text-red-600 flex justify-between items-center group">
                Reject Registration <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Management Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Staff Roles Distribution</h3>
          <div className="flex items-center justify-center p-4">
            <div className="w-full max-w-xs space-y-4">
              {(() => {
                const medicalCount = roleStats['Medical Staff'] || 0;
                const staffCount = (roleStats['Staff'] || 0) + (roleStats['Nurse'] || 0) + (roleStats['Support Staff'] || 0) + (roleStats['Lab Technician'] || 0);
                const total = medicalCount + staffCount || 1;

                // Calculate percentages for chart
                const medicalPercent = (medicalCount / total) * 100;
                const staffPercent = (staffCount / total) * 100;

                // Circle properties
                const radius = 70;
                const circumference = 2 * Math.PI * radius;
                const medicalStroke = (medicalPercent / 100) * circumference;
                const staffStroke = circumference - medicalStroke; // Fill the rest to be safe or calculate actual

                return (
                  <div className="flex flex-col items-center">
                    {/* Donut Chart */}
                    <div className="relative w-48 h-48 mb-6">
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Background Circle */}
                        <circle cx="96" cy="96" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="20" />

                        {/* Medical Staff Segment (Blue) */}
                        <circle
                          cx="96" cy="96" r={radius}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="20"
                          strokeDasharray={`${medicalStroke} ${circumference}`}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />

                        {/* Staff Segment (Green) - Start where blue ended */}
                        {staffCount > 0 && (
                          <circle
                            cx="96" cy="96" r={radius}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="20"
                            strokeDasharray={`${staffStroke} ${circumference}`}
                            strokeDashoffset={-medicalStroke} // Offset by blue segment
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                        )}
                      </svg>
                      {/* Center Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-gray-800">{totalCalculatedStaff}</span>
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Staff</span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="w-full space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
                          <span className="text-sm font-bold text-gray-700">Medical Staff</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-lg font-bold text-blue-700">{medicalCount}</span>
                          <span className="text-xs text-blue-600 font-medium">{medicalPercent.toFixed(1)}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                          <span className="text-sm font-bold text-gray-700">Staff & Support</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-lg font-bold text-green-700">{staffCount}</span>
                          <span className="text-xs text-green-600 font-medium">{staffPercent.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Staff Activity</h3>
            <button onClick={() => navigate('/admin/manage-staff')} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline">View All Activity</button>
          </div>
          <div className="space-y-0 relative">
            {/* Vertical Line for Timeline Effect */}
            {recentActivity.length > 0 && <div className="absolute left-5 top-2 bottom-4 w-0.5 bg-gray-100"></div>}

            {recentActivity.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-sm italic">
                No recent activity recorded.
              </div>
            ) : (
              recentActivity.map((log, i) => {
                // formatting logic
                let actionText = log.actionType.replace(/_/g, ' ').toLowerCase();
                // Capitalize first letter of each word
                actionText = actionText.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

                // Action styling
                let icon = (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.235 3.933-4.963 6.862-9.356 6.994" /></svg>
                );
                let bgColor = "bg-gray-100";
                let iconColor = "text-gray-600";

                if (log.actionType.includes('REGISTER') || log.actionType.includes('ADD')) {
                  bgColor = "bg-green-100";
                  iconColor = "text-green-600";
                  icon = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
                } else if (log.actionType.includes('UPDATE') || log.actionType.includes('EDIT')) {
                  bgColor = "bg-blue-100";
                  iconColor = "text-blue-600";
                  icon = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
                } else if (log.actionType.includes('DELETE')) {
                  bgColor = "bg-red-100";
                  iconColor = "text-red-600";
                  icon = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
                }

                return (
                  <div key={i} className="flex gap-4 relative py-3 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bgColor} ${iconColor} shadow-sm border border-white`}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-gray-900 truncate">{actionText}</p>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5 break-words line-clamp-2">{log.details}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-bold">
                          {log.staff?.fullName?.charAt(0) || 'S'}
                        </div>
                        <p className="text-xs text-gray-500 font-medium">{log.staff?.fullName || 'System'}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardView;
