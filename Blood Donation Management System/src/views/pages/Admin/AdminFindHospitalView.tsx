import { useEffect, useMemo, useState } from 'react';
import { fetchHospitals } from '../../../controllers/hospitalController';
import type { Hospital } from '../../../models/Hospital';
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

// Custom Blue Pin for Hospitals (using similar style but Blue)
const createHospitalIcon = () => {
    return L.divIcon({
        className: 'custom-hospital-icon',
        html: `
      <div class="relative w-10 h-10">
        <svg viewBox="0 0 24 24" fill="#3b82f6" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-md">
           <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        </svg>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-3/4 w-5 h-5">
           <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
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
const MapUpdater = ({ hospitals, focusedLocation }: { hospitals: Hospital[]; focusedLocation: [number, number] | null }) => {
    const map = useMap();

    useEffect(() => {
        if (focusedLocation) {
            map.setView(focusedLocation, 15);
            return;
        }

        if (hospitals.length > 0) {
            const markers = hospitals
                .filter(h => h.latitude && h.longitude)
                .map(h => [h.latitude!, h.longitude!] as [number, number]);

            if (markers.length > 0) {
                const bounds = L.latLngBounds(markers);
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            } else {
                map.setView([9.03, 38.74], 6);
            }
        } else {
            map.setView([9.03, 38.74], 6);
        }
    }, [hospitals, focusedLocation, map]);

    return null;
};

const AdminFindHospitalView = () => {
    const { t } = useLanguage();
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [searchName, setSearchName] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [geoQuery, setGeoQuery] = useState('');

    // Modal state
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [focusedLocation, setFocusedLocation] = useState<[number, number] | null>(null);

    const formatLocation = (hospital: Hospital): string => {
        if (hospital.locationDetails) {
            const parts = [
                hospital.locationDetails.region,
                hospital.locationDetails.city,
                hospital.locationDetails.subCity,
                hospital.locationDetails.woreda,
                hospital.locationDetails.kebele,
                hospital.locationDetails.street,
                hospital.locationDetails.homeNumber,
            ].filter(Boolean);
            return parts.join(', ') || hospital.location || 'N/A';
        }
        return hospital.location || 'N/A';
    };

    const getFullAddress = (hospital: Hospital): string => {
        if (hospital.locationDetails) {
            const parts: string[] = [];
            if (hospital.locationDetails.region) parts.push(`${t('region')}: ${hospital.locationDetails.region}`);
            if (hospital.locationDetails.city) parts.push(`${t('city')}: ${hospital.locationDetails.city}`);
            if (hospital.locationDetails.subCity) parts.push(`${t('subCity')}: ${hospital.locationDetails.subCity}`);
            if (hospital.locationDetails.woreda) parts.push(`${t('woreda')}: ${hospital.locationDetails.woreda}`);
            if (hospital.locationDetails.kebele) parts.push(`${t('kebele')}: ${hospital.locationDetails.kebele}`);
            if (hospital.locationDetails.street) parts.push(`${t('street')}: ${hospital.locationDetails.street}`);
            if (hospital.locationDetails.homeNumber) parts.push(`${t('homeNumber')}: ${hospital.locationDetails.homeNumber}`);
            return parts.join(' | ') || hospital.location || 'N/A';
        }
        return hospital.location || 'N/A';
    };

    useEffect(() => {
        fetchHospitals().then(setHospitals);
    }, []);

    const filtered = useMemo(() => {
        return hospitals.filter((hospital) => {
            const matchesName = hospital.name.toLowerCase().includes(searchName.toLowerCase());
            const matchesPhone = (hospital.phone ?? '').toLowerCase().includes(searchPhone.toLowerCase());

            let matchesGeo = true;
            if (geoQuery) {
                const locationStr = hospital.location?.toLowerCase() || '';
                const locationDetailsStr = hospital.locationDetails
                    ? [
                        hospital.locationDetails.region,
                        hospital.locationDetails.city,
                        hospital.locationDetails.subCity,
                    ]
                        .filter(Boolean)
                        .join(' ')
                        .toLowerCase()
                    : '';
                const searchLower = geoQuery.toLowerCase();
                matchesGeo = locationStr.includes(searchLower) || locationDetailsStr.includes(searchLower);
            }

            return matchesName && matchesPhone && matchesGeo;
        });
    }, [hospitals, searchName, searchPhone, geoQuery]);

    const handleOpenMap = (lat?: number, lng?: number) => {
        if (lat && lng) {
            setFocusedLocation([lat, lng]);
        } else {
            setFocusedLocation(null);
        }
        setIsMapOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters Section */}
            <div className="bg-white rounded-none p-0">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="space-y-2 max-w-lg">
                        <h1 className="text-3xl font-bold text-slate-900">{t('findHospital')}</h1>
                        <p className="text-slate-600">
                            {t('search')} {t('hospitals').toLowerCase()} {t('findByName')}, {t('findByNumber')}, {t('findByLocation')}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 w-full lg:w-auto">
                        {/* Row 1 */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                placeholder={t('findByName')}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none w-full sm:w-64"
                            />
                            <input
                                value={searchPhone}
                                onChange={(e) => setSearchPhone(e.target.value)}
                                placeholder={t('findByNumber')}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none w-full sm:w-64"
                            />
                        </div>
                        {/* Row 2 */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                value={geoQuery}
                                onChange={(e) => setGeoQuery(e.target.value)}
                                placeholder={t('findByLocation')}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none w-full sm:w-64"
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
                    <h3 className="text-lg font-semibold text-gray-900">{t('results')}</h3>
                    <p className="text-sm text-gray-600">{t('showing')} {filtered.length} {t('hospitals').toLowerCase()}</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">{t('name')}</th>
                                <th className="px-6 py-4">{t('phoneNumber')}</th>
                                <th className="px-6 py-4">{t('emailAddress')}</th>
                                <th className="px-6 py-4">{t('address')}</th>
                                <th className="px-6 py-4 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        {t('noHospitalsFound')}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((hospital) => (
                                    <tr key={hospital.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 font-semibold text-slate-900">{hospital.name}</td>
                                        <td className="px-6 py-4">{hospital.phone || 'N/A'}</td>
                                        <td className="px-6 py-4">{hospital.email || 'N/A'}</td>
                                        <td className="px-6 py-4 max-w-xs truncate">
                                            {formatLocation(hospital)}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button
                                                onClick={() => handleOpenMap(hospital.latitude, hospital.longitude)}
                                                className="text-blue-600 hover:text-blue-800 font-semibold text-sm hover:underline"
                                            >
                                                {t('viewOnMap')}
                                            </button>
                                            {hospital.phone && (
                                                <a href={`tel:${hospital.phone}`} className="text-blue-600 hover:text-blue-800 font-semibold text-sm hover:underline">
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

            {/* Map Modal */}
            {isMapOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden relative">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white z-10">
                            <h3 className="text-xl font-bold text-slate-900">Hospital Locations</h3>
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
                                <MapUpdater hospitals={filtered} focusedLocation={focusedLocation} />
                                {filtered.map((hospital) => (
                                    (hospital.latitude && hospital.longitude) && (
                                        <Marker
                                            key={hospital.id}
                                            position={[hospital.latitude, hospital.longitude]}
                                            icon={createHospitalIcon()}
                                        >
                                            <Popup>
                                                <div className="min-w-[200px]">
                                                    <h3 className="font-bold text-base text-slate-800">{hospital.name}</h3>
                                                    <p className="text-xs text-slate-500 mb-2">{hospital.location}</p>
                                                    <div className="space-y-1 text-sm text-slate-600">
                                                        <div className="flex justify-between">
                                                            <span className="font-semibold">{t('phoneNumber')}:</span>
                                                            <span>{hospital.phone}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="font-semibold">{t('emailAddress')}:</span>
                                                            <span>{hospital.email}</span>
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

export default AdminFindHospitalView;
