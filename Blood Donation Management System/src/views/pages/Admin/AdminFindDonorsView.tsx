import { useEffect, useMemo, useState } from 'react';
import { fetchDonors } from '../../../controllers/donorController';
import type { Donor, BloodType } from '../../../models/Donor';

const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const AdminFindDonorsView = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedBloodType, setSelectedBloodType] = useState<BloodType | 'All'>('All');
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

  const openMapSearch = (query?: string) => {
    const q = query || geoQuery;
    if (!q) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Find Donors</h2>

      <div className="rounded-lg bg-white border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-3">
          <input
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Find by name"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
          />
          <input
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            placeholder="Find by number"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
          />
          <select
            value={selectedBloodType}
            onChange={(e) => setSelectedBloodType(e.target.value as BloodType | 'All')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
          >
            <option value="All">All Blood Types</option>
            {bloodTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            value={geoQuery}
            onChange={(e) => setGeoQuery(e.target.value)}
            placeholder="Find by location / map search"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
          />
          <button
            type="button"
            onClick={() => openMapSearch()}
            className="rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
          >
            Geolocation (Google Maps)
          </button>
        </div>
        <p className="text-sm text-slate-600">
          Showing <span className="font-semibold text-slate-900">{filtered.length}</span> donors
        </p>
      </div>

      <div className="rounded-lg bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Blood Type</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Last Donation</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No donors found
                  </td>
                </tr>
              ) : (
                filtered.map((donor) => (
                  <tr key={donor.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                      {donor.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{donor.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                        {donor.bloodType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{donor.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{donor.lastDonation ?? 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openMapSearch(donor.location)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        View on Map
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFindDonorsView;

