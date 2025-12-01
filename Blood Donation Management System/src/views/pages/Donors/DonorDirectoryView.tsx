import { useEffect, useState } from 'react';
import { fetchDonors } from '../../../controllers/donorController';
import type { Donor, BloodType } from '../../../models/Donor';

const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DonorDirectoryView = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [selectedBloodType, setSelectedBloodType] = useState<BloodType | 'All'>('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchDonors().then(setDonors);
  }, []);

  useEffect(() => {
    if (selectedBloodType === 'All') {
      setFilteredDonors(donors);
    } else {
      setFilteredDonors(donors.filter((donor) => donor.bloodType === selectedBloodType));
    }
  }, [donors, selectedBloodType]);

  return (
    <div className="space-y-6">
      {/* Top Card - Search Section */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">Find Blood Donors</h1>
        <p className="mt-2 text-slate-600">Explore our interactive map to find registered blood donors near you.</p>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700">Filter by Blood Type:</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex min-w-[120px] items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <span>{selectedBloodType}</span>
                <svg
                  className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-20 mt-1 min-w-[120px] rounded-lg border border-slate-200 bg-white shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBloodType('All');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                        selectedBloodType === 'All' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      All
                    </button>
                    {bloodTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setSelectedBloodType(type);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                          selectedBloodType === type ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredDonors.length}</span> donors
          </p>
        </div>
      </div>

      {/* Bottom Card - Results or Empty State */}
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        {filteredDonors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg
              className="mb-4 h-16 w-16 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-xl font-bold text-slate-900">No Donors Found</h2>
            <p className="mt-2 text-slate-600">No donors registered yet. Be the first to register!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDonors.map((donor) => (
              <div key={donor.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{donor.fullName}</h3>
                    <p className="text-sm text-slate-500">{donor.location}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {donor.bloodType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDirectoryView;


