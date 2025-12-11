import { useEffect, useMemo, useState } from 'react';
import { fetchDonors } from '../../../controllers/donorController';
import type { Donor, BloodType } from '../../../models/Donor';

const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const HospitalFindDonorsView = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedBloodType, setSelectedBloodType] = useState<BloodType | 'All'>('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [geoQuery, setGeoQuery] = useState('');

  useEffect(() => {
    fetchDonors().then(setDonors);
  }, []);

  const filtered = useMemo(() => {
    return donors.filter((donor) => {
      const matchesName = donor.fullName.toLowerCase().includes(searchName.toLowerCase());
      const matchesPhone = (donor.phone ?? '').toLowerCase().includes(searchPhone.toLowerCase());
      const matchesBlood = selectedBloodType === 'All' || donor.bloodType === selectedBloodType;
      const matchesGeo =
        !geoQuery || donor.location.toLowerCase().includes(geoQuery.toLowerCase());
      return matchesName && matchesPhone && matchesBlood && matchesGeo;
    });
  }, [donors, searchName, searchPhone, selectedBloodType, geoQuery]);

  const handleGeoSearch = (query?: string) => {
    const q = query || geoQuery;
    if (!q) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Card - Search Section */}
      <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">Find Blood Donors</h1>
        <p className="mt-2 text-slate-600">Explore our interactive map to find registered blood donors near you.</p>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <input
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Find by name"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <input
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="Find by number"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex min-w-[120px] items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
            <button
              type="button"
              onClick={() => handleGeoSearch()}
              className="rounded-lg border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition"
            >
              Geolocation (Google Maps)
            </button>
            <input
              value={geoQuery}
              onChange={(e) => setGeoQuery(e.target.value)}
              placeholder="Find by location"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filtered.length}</span> donors
          </p>
        </div>
      </div>

      {/* Bottom Card - Results or Empty State */}
      <div className="rounded-xl bg-white border border-slate-200 p-8 shadow-lg">
        {filtered.length === 0 ? (
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
            {filtered.map((donor) => (
              <div key={donor.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{donor.fullName}</h3>
                    <p className="text-sm text-slate-500">{donor.location}</p>
                    <p className="text-sm text-slate-500">{donor.phone || 'N/A'}</p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    {donor.bloodType}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => handleGeoSearch(donor.location)}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Open in Google Maps
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalFindDonorsView;

