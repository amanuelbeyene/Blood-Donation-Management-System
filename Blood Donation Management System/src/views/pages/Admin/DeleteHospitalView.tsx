import { useEffect, useState } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchHospitals, deleteHospital } from '../../../controllers/hospitalController';
import type { Hospital } from '../../../models/Hospital';
import { useLanguage } from '../../../contexts/LanguageContext';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const DeleteHospitalView = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Confirmation Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info' | 'success';
    confirmLabel?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    type: 'danger'
  });

  const openConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' | 'success' = 'danger',
    confirmLabel: string = 'Confirm'
  ) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      onConfirm,
      type,
      confirmLabel
    });
  };

  useEffect(() => {
    fetchHospitals().then(setHospitals);
  }, []);

  const formatLocation = (hospital: Hospital): string => {
    if (hospital.locationDetails) {
      const parts = [
        hospital.locationDetails.region,
        hospital.locationDetails.city,
        hospital.locationDetails.subCity,
        hospital.locationDetails.woreda,
        hospital.locationDetails.kebele,
        hospital.locationDetails.street,
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
      return parts.join(' | ') || hospital.location || 'N/A';
    }
    return hospital.location || 'N/A';
  };

  // Mode Logic: List vs Edit
  const { user } = useAuth();

  const handleDelete = async (hospital: Hospital) => {
    openConfirmation(
      t('confirmDelete'),
      `${t('confirmDeleteHospital')} ${hospital.name}? ${t('actionCannotBeUndone')}`,
      async () => {
        try {
          await deleteHospital(hospital.id);

          // Log Activity
          if (user && user.role === 'staff') {
            const { ActivityTracker } = await import('../../../utils/ActivityTracker');
            ActivityTracker.addLog({
              staffId: user.id,
              actionType: 'DELETE_HOSPITAL',
              targetId: hospital.id,
              targetName: hospital.name,
              targetProfilePicture: hospital.profilePicture,
              details: 'Deleted hospital record',
              staff: { ...user, role: 'staff' } as any
            });
          }

          toast.success(`${t('hospitals')} ${hospital.name} ${t('deletedSuccessfully')}!`);
          setHospitals((prev) => prev.filter((h) => h.id !== hospital.id));
          setSelectedHospital(null);
        } catch (error: any) {
          console.error("Delete failed", error);
          toast.error(`Failed to delete hospital: ${error.message || 'Unknown error'}`);
        }
      },
      'danger',
      t('delete')
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('deleteHospitalDetails')}</h2>

      {selectedHospital && (
        <div className="bg-white rounded-lg shadow-sm border-2 border-red-300 p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-6">
              {/* Profile Picture - Larger Display */}
              <div className="flex-shrink-0">
                {selectedHospital.profilePicture ? (
                  <img
                    src={selectedHospital.profilePicture}
                    alt={selectedHospital.name}
                    className="h-32 w-32 rounded-full object-cover border-4 border-red-600 shadow-lg"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300 shadow-lg">
                    <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedHospital.name}</h3>
                <p className="text-sm text-red-600 font-semibold">{t('confirmDeleteMessage')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('hospitals')} ID: {selectedHospital.id}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedHospital(null)}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">{t('hospitalName')}</p>
              <p className="font-medium">{selectedHospital.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('hospitalType')}</p>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                {selectedHospital.hospitalType || 'N/A'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('emailAddress')}</p>
              <p className="font-medium">{selectedHospital.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone (landline)</p>
              <p className="font-medium">{selectedHospital.landline || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('phoneNumber')}</p>
              <p className="font-medium">{selectedHospital.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('contactPerson')}</p>
              <p className="font-medium">{selectedHospital.contactDoctorName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('businessLicenseName')}</p>
              <p className="font-medium">{selectedHospital.businessLicenseName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('businessLicenseNumber')}</p>
              <p className="font-medium">{selectedHospital.businessLicenseNumber || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">{t('address')}</p>
              <p className="font-medium">{getFullAddress(selectedHospital)}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => handleDelete(selectedHospital)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              {t('confirmDelete')}
            </button>
            <button
              onClick={() => setSelectedHospital(null)}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('selectHospitalToDelete')}</h3>
          <p className="text-sm text-gray-600 mt-1">{t('warningDeleteAction')}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('emailAddress')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('hospitalType')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('address')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hospitals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {t('noDataFound')}
                  </td>
                </tr>
              ) : (
                hospitals.map((hospital) => (
                  <tr key={hospital.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        {hospital.profilePicture ? (
                          <img
                            src={hospital.profilePicture}
                            alt={hospital.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        )}
                        <span>{hospital.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.contactDoctorPhone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {hospital.hospitalType || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="truncate" title={getFullAddress(hospital)}>
                        {hospital.locationDetails?.region || hospital.location || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedHospital(hospital)}
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

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmLabel={modalConfig.confirmLabel}
      />
    </div>
  );
};

export default DeleteHospitalView;
