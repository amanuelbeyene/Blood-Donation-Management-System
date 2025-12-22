import { useEffect, useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

// Mock Staff type
interface Staff {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    profilePicture?: string;
    locationDetails?: {
        region: string;
        city: string;
        subCity: string;
        woreda: string;
        kebele: string;
        street: string;
        homeNumber: string;
    };
    location?: string;
    status: 'active' | 'inactive';
    joinedDate: string;
}

// Mock Data
const MOCK_STAFF: Staff[] = [
    {
        id: 'STF001',
        fullName: 'Abebe Kebede',
        email: 'abebe.k@example.com',
        phone: '+251 911 000 001',
        role: 'Nurse',
        status: 'active',
        joinedDate: '2024-03-10',
        locationDetails: {
            region: 'Addis Ababa',
            city: 'Addis Ababa',
            subCity: 'Arada',
            woreda: '01',
            kebele: '04',
            street: 'King George VI St',
            homeNumber: '202'
        }
    },
    {
        id: 'STF002',
        fullName: 'Marta Yilma',
        email: 'marta.y@example.com',
        phone: '+251 911 000 002',
        role: 'Lab Technician',
        status: 'active',
        joinedDate: '2024-04-15',
        location: 'Bahir Dar, Amhara'
    }
];

const DeleteStaffView = () => {
    const { t } = useLanguage();
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

    useEffect(() => {
        // Simulate fetch
        setStaffList(MOCK_STAFF);
    }, []);

    const formatLocation = (staff: Staff): string => {
        if (staff.locationDetails) {
            const parts = [
                staff.locationDetails.region,
                staff.locationDetails.city,
                staff.locationDetails.subCity,
                staff.locationDetails.woreda,
                staff.locationDetails.kebele,
                staff.locationDetails.street,
                staff.locationDetails.homeNumber,
            ].filter(Boolean);
            return parts.join(', ') || staff.location || 'N/A';
        }
        return staff.location || 'N/A';
    };

    const getFullAddress = (staff: Staff): string => {
        if (staff.locationDetails) {
            const parts: string[] = [];
            if (staff.locationDetails.region) parts.push(`${t('region')}: ${staff.locationDetails.region}`);
            if (staff.locationDetails.city) parts.push(`${t('city')}: ${staff.locationDetails.city}`);
            if (staff.locationDetails.subCity) parts.push(`${t('subCity')}: ${staff.locationDetails.subCity}`);
            if (staff.locationDetails.woreda) parts.push(`${t('woreda')}: ${staff.locationDetails.woreda}`);
            if (staff.locationDetails.kebele) parts.push(`${t('kebele')}: ${staff.locationDetails.kebele}`);
            if (staff.locationDetails.street) parts.push(`${t('street')}: ${staff.locationDetails.street}`);
            if (staff.locationDetails.homeNumber) parts.push(`${t('homeNumber')}: ${staff.locationDetails.homeNumber}`);
            return parts.join(' | ') || staff.location || 'N/A';
        }
        return staff.location || 'N/A';
    };

    const handleDelete = (staff: Staff) => {
        if (window.confirm(`${t('confirmDeleteDonor')} ${staff.fullName}? ${t('actionCannotBeUndone')}`)) {
            alert(`Staff ${staff.fullName} deleted successfully! Backend integration coming soon.`);
            setStaffList((prev) => prev.filter((d) => d.id !== staff.id));
            setSelectedStaff(null);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Delete Staff Details</h2>

            {selectedStaff && (
                <div className="bg-white rounded-lg shadow-sm border-2 border-red-300 p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-6">
                            {/* Profile Picture - Larger Display */}
                            <div className="flex-shrink-0">
                                {selectedStaff.profilePicture ? (
                                    <img
                                        src={selectedStaff.profilePicture}
                                        alt={selectedStaff.fullName}
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
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedStaff.fullName}</h3>
                                <p className="text-sm text-red-600 font-semibold">{t('confirmDeleteMessage')}</p>
                                <p className="text-xs text-gray-500 mt-1">Staff ID: {selectedStaff.id}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedStaff(null)}
                            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-sm text-gray-600">{t('fullName')}</p>
                            <p className="font-medium">{selectedStaff.fullName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Role</p>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                {selectedStaff.role}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">{t('emailAddress')}</p>
                            <p className="font-medium">{selectedStaff.email || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">{t('phoneNumber')}</p>
                            <p className="font-medium">{selectedStaff.phone || 'N/A'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">{t('address')}</p>
                            <p className="font-medium">{getFullAddress(selectedStaff)}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleDelete(selectedStaff)}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                        >
                            {t('confirmDelete')}
                        </button>
                        <button
                            onClick={() => setSelectedStaff(null)}
                            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                            {t('cancel')}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Select Staff to Delete</h3>
                    <p className="text-sm text-gray-600 mt-1">{t('warningDeleteAction')}</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('emailAddress')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('phoneNumber')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('address')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('action')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {staffList.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No staff found.
                                    </td>
                                </tr>
                            ) : (
                                staffList.map((staff) => (
                                    <tr key={staff.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <div className="flex items-center gap-3">
                                                {staff.profilePicture ? (
                                                    <img
                                                        src={staff.profilePicture}
                                                        alt={staff.fullName}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <span>{staff.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.email || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.phone || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                                {staff.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                            <div className="truncate" title={getFullAddress(staff)}>
                                                {formatLocation(staff)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => setSelectedStaff(staff)}
                                                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                                            >
                                                {t('delete')}
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

export default DeleteStaffView;
