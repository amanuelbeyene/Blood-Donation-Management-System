import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchRequests } from '../../../controllers/requestController';
import { fetchDonors } from '../../../controllers/donorController';
import { fetchDonations } from '../../../controllers/donationController';
import { fetchHospitalById } from '../../../controllers/hospitalController';
import { useAuth } from '../../../contexts/AuthContext';

const HospitalView = () => {
  const [stats, setStats] = useState({
    myRequests: 0,
    availableDonors: 0,
    emergencyRequests: 0,
    livesSaved: 0
  });
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState(user?.status || '');
  const isPending = currentStatus !== 'Active';

  useEffect(() => {
    const loadData = async () => {
      try {
        const [requests, donors, donations] = await Promise.all([
          fetchRequests(),
          fetchDonors(),
          fetchDonations()
        ]);

        // Calculate My Requests
        // Match by ID or Name (legacy)
        const myRequestsCount = requests.filter(r =>
          (user?.id && r.hospitalId === user.id) ||
          (user?.fullName && r.hospital === user.fullName) ||
          (user && (user as any).name && r.hospital === (user as any).name)
        ).length;

        // Platform Stats
        const availableDonorsCount = donors.filter(d => d.status === 'Active').length;
        const emergencyRequestsCount = requests.filter(r => r.urgency === 'emergency').length;
        const livesSavedCount = donations.filter(d => (d.status as string) === 'Completed' || d.status === 'completed').length;

        setStats({
          myRequests: myRequestsCount,
          availableDonors: availableDonorsCount,
          emergencyRequests: emergencyRequestsCount,
          livesSaved: livesSavedCount
        });

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      }
    };

    if (user) {
      loadData();
      if (user.role === 'hospital') {
        fetchHospitalById(user.id)
          .then(data => setCurrentStatus(data.status || 'Pending'))
          .catch(err => console.error("Failed to fetch hospital status", err));
      }
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Back to Main Button */}


      {/* Header Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-blue-50">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          )}
        </div>
        <div className="text-center md:text-left min-w-0 flex-1">
          <h1 className="text-3xl font-bold text-slate-900 break-words">
            Welcome Hospital, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user?.fullName || (user as any)?.name || 'Hospital'}</span>
          </h1>
          <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <p className="text-slate-600 font-medium">Ready to save lives</p>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2">
          {user?.role === 'hospital' && currentStatus && (
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${currentStatus.toLowerCase() === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
              STATUS: {currentStatus.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Emergency Request Card */}
        <div className={`rounded-xl bg-white border border-slate-200 p-6 shadow-sm transition-all ${isPending ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:shadow-md'}`}>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Emergency Request</h3>
          <p className="mt-2 text-sm text-slate-600">
            Submit an urgent blood request and find matching donors instantly.
          </p>
          {isPending ? (
            <span className="mt-4 inline-block text-sm font-semibold text-slate-400 cursor-not-allowed">
              Create Request →
            </span>
          ) : (
            <NavLink
              to="/hospital/emergency-request"
              className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Create Request →
            </NavLink>
          )}
        </div>

        {/* Find Donors Card */}
        <div className={`rounded-xl bg-white border border-slate-200 p-6 shadow-sm transition-all ${isPending ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:shadow-md'}`}>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Find Donors</h3>
          <p className="mt-2 text-sm text-slate-600">Browse all available donors on an interactive map.</p>
          {isPending ? (
            <span className="mt-4 inline-block text-sm font-semibold text-slate-400 cursor-not-allowed">
              View Map →
            </span>
          ) : (
            <NavLink
              to="/hospital/find-donors"
              className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View Map →
            </NavLink>
          )}
        </div>

        {/* My Requests Card */}
        <div className={`rounded-xl bg-white border border-slate-200 p-6 shadow-sm transition-all ${isPending ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:shadow-md'}`}>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900">My Requests</h3>
          <p className="mt-2 text-4xl font-bold text-slate-900">{stats.myRequests}</p>
          <p className="mt-1 text-sm text-slate-600">Total Requests</p>
          {isPending ? (
            <span className="mt-4 inline-block text-sm font-semibold text-slate-400 cursor-not-allowed">
              View All →
            </span>
          ) : (
            <NavLink
              to="/hospital/my-requests"
              className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View All →
            </NavLink>
          )}
        </div>
      </div>

      {/* Platform Statistics Card */}
      <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Platform Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-4xl font-bold text-slate-900">{stats.availableDonors}</p>
            <p className="mt-2 text-sm font-medium text-slate-700">Available Donors</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-slate-900">{stats.emergencyRequests}</p>
            <p className="mt-2 text-sm font-medium text-slate-700">Emergency Requests</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-slate-900">{stats.livesSaved}</p>
            <p className="mt-2 text-sm font-medium text-slate-700">Lives Saved</p>
          </div>
        </div>
      </div>
    </div >
  );
};

export default HospitalView;
