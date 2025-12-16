import { useEffect, useState } from 'react';
import { fetchDonors } from '../../../controllers/donorController';
import type { Donor } from '../../../models/Donor';
import { useLanguage } from '../../../contexts/LanguageContext';

const ViewDonorsView = () => {
  const { t } = useLanguage();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  useEffect(() => {
    fetchDonors().then(setDonors);
  }, []);

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('viewDonorDetails')}</h2>
      
      {selectedDonor && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-6">
              {/* Profile Picture - Larger Display */}
              <div className="flex-shrink-0">
                {selectedDonor.profilePicture ? (
                  <img
                    src={selectedDonor.profilePicture}
                    alt={selectedDonor.fullName}
                    className="h-32 w-32 rounded-full object-cover border-4 border-red-600 shadow-lg"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300 shadow-lg">
                    <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedDonor.fullName}</h3>
                <p className="text-sm text-gray-600">{t('donor')} ID: {selectedDonor.id}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedDonor(null)}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">{t('fullName')}</p>
              <p className="font-medium">{selectedDonor.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('bloodType')}</p>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                {selectedDonor.bloodType}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('emailAddress')}</p>
              <p className="font-medium">{selectedDonor.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('phoneNumber')}</p>
              <p className="font-medium">{selectedDonor.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('age')}</p>
              <p className="font-medium">{selectedDonor.age || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('availability')}</p>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  selectedDonor.availability === 'ready'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                {selectedDonor.availability === 'ready' ? t('ready') : t('resting')}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('totalDonations')}</p>
              <p className="font-medium">{selectedDonor.totalDonations}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('lastDonation')}</p>
              <p className="font-medium">{selectedDonor.lastDonation || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">{t('medicalCondition')}</p>
              <p className="font-medium">{selectedDonor.medicalCondition || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">{t('address')}</p>
              <p className="font-medium">{getFullAddress(selectedDonor)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('donors')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('emailAddress')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('phoneNumber')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('bloodType')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('address')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('availability')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('totalDonations')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {donors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    {t('noDonorsFound')}
                  </td>
                </tr>
              ) : (
                donors.map((donor) => (
                  <tr key={donor.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        {donor.profilePicture ? (
                          <img
                            src={donor.profilePicture}
                            alt={donor.fullName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        <span>{donor.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                        {donor.bloodType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="truncate" title={getFullAddress(donor)}>
                        {formatLocation(donor)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          donor.availability === 'ready'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {donor.availability === 'ready' ? t('ready') : t('resting')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.totalDonations}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedDonor(donor)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        {t('view')}
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

export default ViewDonorsView;

