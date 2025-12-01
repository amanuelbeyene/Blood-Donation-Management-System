import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchDashboardStats } from '../../../controllers/adminController';
import type { DashboardStats } from '../../../models/Stats';

const DonorDashboardView = () => {
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
          className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Main Page
        </NavLink>
      </div>

      {/* Welcome Section */}
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-slate-900">Welcome, Donor!</h1>
        <p className="mt-2 text-slate-600">Thank you for being part of our life-saving community.</p>

        {/* Feature Cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* Register as Donor Card */}
          <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary relative">
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white">
                <svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Register as Donor</h3>
            <p className="mt-2 text-sm text-slate-600">
              Join our community and help save lives by registering your blood type.
            </p>
            <NavLink
              to="/register"
              className="mt-4 inline-block text-sm font-semibold text-primary hover:text-primary-dark"
            >
              Get Started →
            </NavLink>
          </div>

          {/* Find Donors Card */}
          <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <p className="mt-2 text-sm text-slate-600">View all registered donors on an interactive map.</p>
            <NavLink
              to="/donors"
              className="mt-4 inline-block text-sm font-semibold text-primary hover:text-primary-dark"
            >
              Explore Map →
            </NavLink>
          </div>

          {/* Your Impact Card */}
          <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Your Impact</h3>
            <p className="mt-2 text-4xl font-bold text-primary">{stats?.registeredDonors ?? 0}</p>
            <p className="mt-1 text-sm text-slate-600">Total Registered Donors</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboardView;

