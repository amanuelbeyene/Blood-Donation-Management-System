import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchDashboardStats } from '../../../controllers/adminController';
import type { DashboardStats } from '../../../models/Stats';

const HospitalView = () => {
  const [stats, setStats] = useState<DashboardStats>();

  useEffect(() => {
    fetchDashboardStats().then(setStats);
  }, []);

  return (
    <div className="space-y-6">
      {/* Back to Main Button */}
      <div className="flex justify-start">
        <NavLink
          to="/"
          className="inline-flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-600 hover:text-white transition"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Main Page
        </NavLink>
      </div>

      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Hospital Dashboard</h1>
        <p className="mt-2 text-slate-600">Manage emergency blood requests and connect with donors.</p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Emergency Request Card */}
        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
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
          <NavLink
            to="/hospital/emergency-request"
            className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Create Request →
          </NavLink>
        </div>

        {/* Find Donors Card */}
        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
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
          <NavLink
            to="/hospital/find-donors"
            className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View Map →
          </NavLink>
        </div>

        {/* My Requests Card */}
        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
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
          <p className="mt-2 text-4xl font-bold text-slate-900">0</p>
          <p className="mt-1 text-sm text-slate-600">Total Requests</p>
          <NavLink
            to="/hospital/my-requests"
            className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View All →
          </NavLink>
        </div>
      </div>

      {/* Platform Statistics Card */}
      <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Platform Statistics</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-4xl font-bold text-slate-900">{stats?.registeredDonors ?? 0}</p>
            <p className="mt-2 text-sm font-medium text-slate-700">Available Donors</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-slate-900">{stats?.emergencyRequests ?? 0}</p>
            <p className="mt-2 text-sm font-medium text-slate-700">Emergency Requests</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-slate-900">{stats?.livesSaved ?? 0}</p>
            <p className="mt-2 text-sm font-medium text-slate-700">Lives Saved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalView;

