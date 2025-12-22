import { useEffect, useMemo, useState } from 'react';
import { fetchDonors } from '../../../controllers/donorController';
import type { Donor, BloodType } from '../../../models/Donor';
import { useLanguage } from '../../../contexts/LanguageContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Custom Red Pin with Heart Icon
const createHeartIcon = () => {
  return L.divIcon({
    className: 'custom-heart-icon',
    html: `
      <div class="relative w-10 h-10">
        <svg viewBox="0 0 24 24" fill="#ef4444" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-md">
           <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        </svg>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-3/4 w-4 h-4">
           <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
           </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Component to handle map centering and bounds
const MapUpdater = ({ donors, focusedLocation }: { donors: Donor[]; focusedLocation: [number, number] | null }) => {
  const map = useMap();

  useEffect(() => {
    if (focusedLocation) {
      map.setView(focusedLocation, 15);
      return;
    }

    if (donors.length > 0) {
      const markers = donors
        .filter(d => d.latitude && d.longitude)
        .map(d => [d.latitude!, d.longitude!] as [number, number]);

      if (markers.length > 0) {
        const bounds = L.latLngBounds(markers);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } else {
        map.setView([9.03, 38.74], 6);
      }
    } else {
      map.setView([9.03, 38.74], 6);
    }
  }, [donors, focusedLocation, map]);

  return null;
};

const AdminFindDonorView = () => {
  const { t } = useLanguage();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState<BloodType | 'All'>('All');
  const [geoQuery, setGeoQuery] = useState('');

  // Modal state
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [focusedLocation, setFocusedLocation] = useState<[number, number] | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchDonors().then(setDonors);
  }, []);

  const filtered = useMemo(() => {
    return donors.filter((donor) => {
      const matchesName = donor.fullName.toLowerCase().includes(searchName.toLowerCase());
      const matchesPhone = (donor.phone ?? '').toLowerCase().includes(searchPhone.toLowerCase());
      const matchesBlood = selectedBloodType === 'All' ? true : donor.bloodType === selectedBloodType;

      let matchesGeo = true;
      if (geoQuery) {
        const locationStr = donor.location?.toLowerCase() || '';
        // Search in details too if available
        const locationDetailsStr = donor.locationDetails
          ? [
            donor.locationDetails.region,
            donor.locationDetails.city,
            donor.locationDetails.subCity,
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

  const handleOpenMap = (lat?: number, lng?: number) => {
    if (lat && lng) {
      setFocusedLocation([lat, lng]);
    } else {
      setFocusedLocation(null);
    }
    setIsMapOpen(true);
  };

  const getFullAddress = (donor: Donor): string => {
    if (donor.locationDetails) {
      const { region, city, subCity } = donor.locationDetails;
      const parts = [region, city, subCity].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : (donor.location || 'N/A');
    }
    return donor.location || 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters Section */}
      <div className="bg-white rounded-none p-0">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <h1 className="text-3xl font-bold text-slate-900">{t('findDonor')}</h1>
            <p className="text-slate-600">
              {t('search')} {t('donors').toLowerCase()} {t('findByName')}, {t('findByNumber')}, {t('findByBloodType')}, {t('findByLocation')}
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full lg:w-auto">
            {/* Row 1 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder={t('findByName')}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none w-full sm:w-48"
              />
              <input
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder={t('findByNumber')}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none w-full sm:w-48"
              />
              <div className="relative w-full sm:w-48">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:border-red-500 focus:outline-none"
                >
                  <span>{selectedBloodType === 'All' ? t('findByBloodType') : selectedBloodType}</span>
                  <svg className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-60 overflow-y-auto">
                      <button
                        onClick={() => { setSelectedBloodType('All'); setIsDropdownOpen(false); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-slate-700"
                      >
                        {t('findByBloodType')} (All)
                      </button>
                      {bloodTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => { setSelectedBloodType(type); setIsDropdownOpen(false); }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-slate-700"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Row 2 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={geoQuery}
                onChange={(e) => setGeoQuery(e.target.value)}
                placeholder={t('findByLocation')}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none w-full sm:w-48"
              />
              <button
                type="button"
                onClick={() => handleOpenMap()}
                className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg border border-blue-200 hover:bg-blue-100 transition whitespace-nowrap text-sm"
              >
                Find by Map Location
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">{t('results')}</h2>
          <span className="text-sm text-slate-500">{t('showing')} {filtered.length} {t('donors').toLowerCase()}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">{t('name')}</th>
                <th className="px-6 py-4">{t('phoneNumber')}</th>
                <th className="px-6 py-4">{t('bloodType')}</th>
                <th className="px-6 py-4">{t('address')}</th>
                <th className="px-6 py-4">{t('availability')}</th>
                <th className="px-6 py-4">{t('totalDonations')}</th>
                <th className="px-6 py-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    {t('noDonorsFound')}
                  </td>
                </tr>
              ) : (
                filtered.map((donor) => (
                  <tr key={donor.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">{donor.fullName}</td>
                    <td className="px-6 py-4">{donor.phone || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${donor.bloodType.includes('+') ? 'bg-red-100 text-red-700' : 'bg-red-50 text-red-600'
                        }`}>
                        {donor.bloodType}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      {getFullAddress(donor)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${donor.availability === 'ready' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                        {donor.availability === 'ready' ? t('ready') : t('resting')}
                      </span>
                    </td>
                    <td className="px-6 py-4">{donor.totalDonations}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleOpenMap(donor.latitude, donor.longitude)}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm hover:underline"
                      >
                        {t('viewOnMap')}
                      </button>
                      <button
                        onClick={() => {
                          if (donor.phone) {
                            window.location.href = `tel:${donor.phone}`;
                          } else {
                            alert('No phone number available');
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm hover:underline"
                      >
                        {t('call')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Map Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden relative">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white z-10">
              <h3 className="text-xl font-bold text-slate-900">Donor Locations</h3>
              <button
                onClick={() => setIsMapOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition"
              >
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - Map */}
            <div className="flex-1 w-full h-full relative">
              <MapContainer center={[9.03, 38.74]} zoom={6} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater donors={filtered} focusedLocation={focusedLocation} />
                {filtered.map((donor) => (
                  (donor.latitude && donor.longitude) && (
                    <Marker
                      key={donor.id}
                      position={[donor.latitude, donor.longitude]}
                      icon={createHeartIcon()}
                    >
                      <Popup>
                        <div className="min-w-[200px]">
                          <h3 className="font-bold text-base text-slate-800">{donor.fullName}</h3>
                          <p className="text-xs text-slate-500 mb-2">{donor.location}</p>
                          <div className="space-y-1 text-sm text-slate-600">
                            <div className="flex justify-between">
                              <span className="font-semibold text-red-500">{t('bloodType')}:</span>
                              <span>{donor.bloodType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-semibold">{t('phoneNumber')}:</span>
                              <span>{donor.phone}</span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFindDonorView;

