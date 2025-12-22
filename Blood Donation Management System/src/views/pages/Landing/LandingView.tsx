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
        <div className="space-y-12">
          {/* Public Roles */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Join Our Community</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <RoleCard
                accent="rose"
                title="Enter as Donor"
                description="Donate blood, track your donation history, and save lives."
                features={['Register', 'View requests', 'Track donations']}
                icon={<span className="text-4xl">❤️</span>}
                ctaLabel="Enter as Donor"
                to="/login/donor"
                state={{ role: 'donor' }}
              />
              <RoleCard
                accent="blue"
                title="Enter as Hospital"
                description="Request blood, manage inventory, and coordinate with donors."
                features={['Emergency requests', 'View donors', 'Manage stock']}
                icon={<span className="text-4xl">🏥</span>}
                ctaLabel="Enter as Hospital"
                to="/login/hospital"
                state={{ role: 'hospital' }}
              />
              <RoleCard
                accent="green"
                title="Enter as Staff"
                description="Manage daily operations, donor check-ins, and blood collection."
                features={['Donor Check-in', 'Blood Collection', 'Appointments']}
                icon={<span className="text-4xl">👨‍⚕️</span>}
                ctaLabel="Enter as Staff"
                to="/login/staff"
                state={{ role: 'staff' }}
              />
            </div>
          </div>

          {/* Administrative Roles */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Administration</h2>
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              <RoleCard
                accent="purple"
                title="Enter as Admin"
                description="Oversee system operations, manage users, and view reports."
                features={['User Management', 'Reports', 'Operations']}
                icon={<span className="text-4xl">⚡</span>}
                ctaLabel="Enter as Admin"
                to="/login/admin"
                state={{ role: 'admin' }}
              />
              <RoleCard
                accent="purple"
                title="Enter as Super Admin"
                description="Full system access, configuration, and advanced management."
                features={['System Config', 'Advanced Settings', 'Audit Logs']}
                icon={<span className="text-4xl">🛡️</span>}
                ctaLabel="Enter as Super Admin"
                to="/login/super-admin"
                state={{ role: 'super_admin' }}
              />
            </div>
          </div>
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


