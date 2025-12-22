import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchDonorById } from '../../../controllers/donorController';
import type { Donor } from '../../../models/Donor';
import SectionHeading from '../../components/common/SectionHeading';

const DonorDashboardView = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const [donor, setDonor] = useState<Donor>();

  useEffect(() => {
    if (userId) {
      fetchDonorById(userId).then(setDonor);
    }
  }, [userId]);

  if (!userId) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-700">Session needs update.</p>
          <p className="mt-2 text-slate-500">Please <NavLink to="/" className="text-primary font-bold hover:underline">Log Out</NavLink> and log back in.</p>
        </div>
      </div>
    );
  }

  if (!donor) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-900">Welcome, {donor.fullName}!</h1>
        <p className="mt-2 text-slate-600">Here is your donor profile and donation history.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Card */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Donor Status</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${donor.availability === 'ready' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <p className="text-xl font-bold text-slate-900 capitalize">{donor.availability}</p>
            </div>
          </div>

          {/* Donations Card */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Donations</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{donor.totalDonations} Units</p>
          </div>

          {/* Impact Score Card */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Impact Score</p>
            <p className="mt-2 text-xl font-bold text-primary">{donor.impactScore}</p>
          </div>
        </div>
      </div>

      {/* Detailed Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Personal & Health Info */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-full">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Personal Information
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Full Name</span>
              <span className="font-medium text-slate-900">{donor.fullName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Phone Number</span>
              <span className="font-medium text-slate-900">{donor.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Email Address</span>
              <span className="font-medium text-slate-900">{donor.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Blood Type</span>
              <span className="font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">{donor.bloodType}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Age</span>
              <span className="font-medium text-slate-900">{donor.age || 'N/A'}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Medical Condition</span>
              <span className="font-medium text-slate-900">{donor.medicalCondition || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Address Info */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-full">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Address Information
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Region</span>
              <span className="font-medium text-slate-900">{donor.locationDetails?.region || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">City</span>
              <span className="font-medium text-slate-900">{donor.locationDetails?.city || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Sub-City</span>
              <span className="font-medium text-slate-900">{donor.locationDetails?.subCity || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Woreda</span>
              <span className="font-medium text-slate-900">{donor.locationDetails?.woreda || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Kebele</span>
              <span className="font-medium text-slate-900">{donor.locationDetails?.kebele || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Street</span>
              <span className="font-medium text-slate-900">{donor.locationDetails?.street || 'N/A'}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Home Number</span>
              <span className="font-medium text-slate-900">{donor.locationDetails?.homeNumber || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default DonorDashboardView;

