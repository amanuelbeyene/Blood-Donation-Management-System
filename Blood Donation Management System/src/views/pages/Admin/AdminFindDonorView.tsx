import { useEffect, useMemo, useState } from 'react';
import { fetchDonors } from '../../../controllers/donorController';
import type { Donor, BloodType } from '../../../models/Donor';
import { useLanguage } from '../../../contexts/LanguageContext';

const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const AdminFindDonorView = () => {
  const { t } = useLanguage();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState<BloodType | 'All'>('All');
  const [geoQuery, setGeoQuery] = useState('');

  const formatLocation = (donor: Donor): string => {
    if (donor.locationDetails) {
      const parts = [
        donor.locationDetails.region,
        donor.locationDetails.city,
        donor.locationDetails.subCity,
        donor.locationDetails.woreda,
        donor.locationDetails.kebele,
        donor.locationDetails.street,
        donor.locationDetails.homeNumber,
      ].filter(Boolean);
      return parts.join(', ') || donor.location || 'N/A';
    }
    return donor.location || 'N/A';
  };

  const getFullAddress = (donor: Donor): string => {
    if (donor.locationDetails) {
      const parts: string[] = [];
      if (donor.locationDetails.region) parts.push(`${t('region')}: ${donor.locationDetails.region}`);
      if (donor.locationDetails.city) parts.push(`${t('city')}: ${donor.locationDetails.city}`);
      if (donor.locationDetails.subCity) parts.push(`${t('subCity')}: ${donor.locationDetails.subCity}`);
      if (donor.locationDetails.woreda) parts.push(`${t('woreda')}: ${donor.locationDetails.woreda}`);
      if (donor.locationDetails.kebele) parts.push(`${t('kebele')}: ${donor.locationDetails.kebele}`);
      if (donor.locationDetails.street) parts.push(`${t('street')}: ${donor.locationDetails.street}`);
      if (donor.locationDetails.homeNumber) parts.push(`${t('homeNumber')}: ${donor.locationDetails.homeNumber}`);
      return parts.join(' | ') || donor.location || 'N/A';
    }
    return donor.location || 'N/A';
  };

  useEffect(() => {
    fetchDonors().then(setDonors);
  }, []);

  const filtered = useMemo(() => {
    return donors.filter((donor) => {
      const matchesName = donor.fullName.toLowerCase().includes(searchName.toLowerCase());
      const matchesPhone = (donor.phone ?? '').toLowerCase().includes(searchPhone.toLowerCase());
      const matchesBlood = selectedBloodType === 'All' ? true : donor.bloodType === selectedBloodType;
      
      // Search in both location string and locationDetails
      let matchesGeo = true;
      if (geoQuery) {
        const locationStr = donor.location?.toLowerCase() || '';
        const locationDetailsStr = donor.locationDetails
          ? [
              donor.locationDetails.region,
              donor.locationDetails.city,
              donor.locationDetails.subCity,
              donor.locationDetails.woreda,
              donor.locationDetails.kebele,
              donor.locationDetails.street,
              donor.locationDetails.homeNumber,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
          : '';
        const searchLower = geoQuery.toLowerCase();
        matchesGeo = locationStr.includes(searchLower) || locationDetailsStr.includes(searchLower);
      }
      
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('findDonor')}</h2>
          <p className="text-sm text-gray-600">{t('search')} {t('donors').toLowerCase()} {t('findByName')}, {t('findByNumber')}, {t('findByBloodType')}, {t('findByLocation')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder={t('findByName')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
          <input
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            placeholder={t('findByNumber')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
          <select
            value={selectedBloodType}
            onChange={(e) => setSelectedBloodType(e.target.value as BloodType | 'All')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
          >
            <option value="All">{t('findByBloodType')}</option>
            {bloodTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            value={geoQuery}
            onChange={(e) => setGeoQuery(e.target.value)}
            placeholder={t('findByLocation')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
          <button
            type="button"
            onClick={() => handleGeoSearch()}
            className="rounded-lg border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition"
          >
            {t('geolocationSearch')} ({t('googleMaps')})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{t('results')}</h3>
          <p className="text-sm text-gray-600">{t('showing')} {filtered.length} {t('donors').toLowerCase()}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('phoneNumber')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('bloodType')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('address')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('availability')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('totalDonations')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-center text-gray-500 text-sm">
                    {t('noDonorsFound')}
                  </td>
                </tr>
              ) : (
                filtered.map((donor) => (
                  <tr key={donor.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{donor.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">{donor.bloodType}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="truncate" title={getFullAddress(donor)}>
                        {formatLocation(donor)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          donor.availability === 'ready' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {donor.availability === 'ready' ? t('ready') : t('resting')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.totalDonations}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold space-x-3">
                      <button onClick={() => handleGeoSearch(getFullAddress(donor))} className="hover:underline">
                        {t('viewOnMap')}
                      </button>
                      {donor.phone && (
                        <a href={`tel:${donor.phone}`} className="hover:underline">
                          {t('call')}
                        </a>
                      )}
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

export default AdminFindDonorView;

