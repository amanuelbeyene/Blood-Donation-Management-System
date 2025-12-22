import { useEffect, useMemo, useState } from 'react';
import { fetchHospitals } from '../../../controllers/hospitalController';
import type { Hospital } from '../../../models/Hospital';
import { useLanguage } from '../../../contexts/LanguageContext';

const AdminFindHospitalView = () => {
    const { t } = useLanguage();
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [searchName, setSearchName] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [geoQuery, setGeoQuery] = useState('');

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

            // Search in both location string and locationDetails
            let matchesGeo = true;
            if (geoQuery) {
                const locationStr = hospital.location?.toLowerCase() || '';
                const locationDetailsStr = hospital.locationDetails
                    ? [
                        hospital.locationDetails.region,
                        hospital.locationDetails.city,
                        hospital.locationDetails.subCity,
                        hospital.locationDetails.woreda,
                        hospital.locationDetails.kebele,
                        hospital.locationDetails.street,
                        hospital.locationDetails.homeNumber,
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

    const handleGeoSearch = (query?: string) => {
        const q = query || geoQuery;
        if (!q) return;
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`, '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('findHospital')}</h2>
                    <p className="text-sm text-gray-600">{t('search')} {t('hospitals').toLowerCase()} {t('findByName')}, {t('findByNumber')}, {t('findByLocation')}</p>
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
                    <p className="text-sm text-gray-600">{t('showing')} {filtered.length} {t('hospitals').toLowerCase()}</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('phoneNumber')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('emailAddress')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('address')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-6 text-center text-gray-500 text-sm">
                                        {t('noHospitalsFound')}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((hospital) => (
                                    <tr key={hospital.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{hospital.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.phone || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.email || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                            <div className="truncate" title={getFullAddress(hospital)}>
                                                {formatLocation(hospital)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold space-x-3">
                                            <button onClick={() => handleGeoSearch(getFullAddress(hospital))} className="hover:underline">
                                                {t('viewOnMap')}
                                            </button>
                                            {hospital.phone && (
                                                <a href={`tel:${hospital.phone}`} className="hover:underline">
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

export default AdminFindHospitalView;
