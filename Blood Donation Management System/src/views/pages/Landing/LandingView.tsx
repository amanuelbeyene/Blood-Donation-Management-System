import { useEffect, useState } from 'react';
import RoleCard from '../../components/cards/RoleCard';
import { fetchDashboardStats } from '../../../controllers/adminController';
import type { DashboardStats } from '../../../models/Stats';

const LandingView = () => {
  const [stats, setStats] = useState<DashboardStats>();

  useEffect(() => {
    fetchDashboardStats().then(setStats);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl space-y-8">
        {/* Heading Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
            Blood Donation Management System
          </h1>
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            BDMS Ethiopia
          </h2>
          <p className="text-lg text-slate-700 mt-4">
            Connecting blood donors with hospitals in need. Your donation can save lives.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <RoleCard
            accent="rose"
            title="I'm a Donor"
            description="Register as a blood donor, find donation opportunities, and track your impact."
            features={['Register your blood type', 'View donation requests', 'Track your points', 'Help save lives']}
            icon={
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            ctaLabel="Enter as Donor"
            to="/login"
            state={{ role: 'donor' }}
          />
          <RoleCard
            accent="blue"
            title="I'm a Hospital"
            description="Submit emergency requests, find matching donors, and manage blood needs."
            features={['Submit emergency requests', 'Find matching donors', 'View donor map', 'Manage requests']}
            icon={
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            ctaLabel="Enter as Hospital"
            to="/login"
            state={{ role: 'hospital' }}
          />
          <RoleCard
            accent="green"
            title="I'm an Admin"
            description="Manage the system, monitor statistics, and oversee all operations."
            features={['Manage users', 'View reports', 'Monitor inventory', 'System settings']}
            icon={
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            ctaLabel="Enter as Admin"
            to="/login"
            state={{ role: 'admin' }}
          />
          <RoleCard
            accent="purple"
            title="I'm a Super Admin"
            description="Full system access, advanced configurations, and high-level management."
            features={['Full access', 'Advanced settings', 'System configuration', 'Audit logs']}
            icon={
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            ctaLabel="Enter as Super Admin"
            to="/login"
            state={{ role: 'super_admin' }}
          />
        </div>

        {/* Statistics Bar */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-4xl font-bold text-primary">{stats?.registeredDonors ?? 0}</p>
              <p className="mt-2 text-sm font-medium text-slate-700">Registered Donors</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">{stats?.livesSaved ?? 0}</p>
              <p className="mt-2 text-sm font-medium text-slate-700">Lives Saved</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">{stats?.emergencyRequests ?? 0}</p>
              <p className="mt-2 text-sm font-medium text-slate-700">Emergency Requests</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingView;


