import { useEffect, useState } from 'react';
import { fetchDonors } from '../../../controllers/donorController';
import type { Donor } from '../../../models/Donor';
import { useLanguage } from '../../../contexts/LanguageContext';

import { useToast } from '../../../contexts/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const ViewDonorsView = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

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
    fetchDonors().then(data => {
      setDonors(data.filter(d => d.status === 'Active'));
    });
  }, []);

  // UseLocation for highlighting logic
  const location = useLocation();
  useEffect(() => {
    if (location.state?.highlightId && donors.length > 0) {
      const id = location.state.highlightId;
      setTimeout(() => {
        const element = document.querySelector(`tr[data-donor-id="${id}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('bg-gray-400', 'text-white');
          let flashCount = 0;
          const flashInterval = setInterval(() => {
            element.classList.toggle('bg-gray-400');
            element.classList.toggle('text-white');
            flashCount++;
            if (flashCount >= 6) {
              clearInterval(flashInterval);
              element.classList.remove('bg-gray-400', 'text-white');
            }
          }, 500);
        }
      }, 100);
    }
  }, [location.state, donors]);

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

  // Print Logic
  const [printDonor, setPrintDonor] = useState<Donor | null>(null);
  const [printMode, setPrintMode] = useState<'essential' | 'full'>('essential');

  const handlePrintClick = (donor: Donor) => {
    setPrintDonor(donor);
  };

  const executePrint = (mode: 'essential' | 'full') => {
    if (printMode !== mode) {
      setPrintMode(mode);
    } else {
      setTimeout(() => {
        window.print();
      }, 100);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('viewDonorDetails')}</h2>

      {/* Print Modal */}
      {printDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:absolute print:inset-0 print:p-0 print:overflow-visible print:max-h-none">
            <button
              onClick={() => setPrintDonor(null)}
              className="absolute right-4 top-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 transition flex items-center justify-center h-10 w-10 z-10 print:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center print:text-left space-y-4 pt-4">
              <div className="mb-4 print:hidden">
                <h2 className="text-xl font-bold text-gray-900 text-left">Print Donor Details</h2>
              </div>

              <div id="printable-area" className="bg-gray-50 rounded-xl p-6 text-left space-y-4 border border-gray-200 print:border-none print:bg-white print:p-0">
                {/* Header with Profile & QR */}
                <div className="flex justify-between items-start mb-6 border-b border-black pb-4">
                  <div className="flex items-center gap-4">
                    {printDonor.profilePicture ? (
                      <img src={printDonor.profilePicture} className="h-24 w-24 rounded-full object-cover border border-gray-300" alt="Profile" />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 font-bold text-2xl">
                        {printDonor.fullName?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl font-bold">{printDonor.fullName}</h1>
                      <p className="text-gray-600">Donor</p>
                      <p className="text-sm text-gray-500">ID: {printDonor.id}</p>
                    </div>
                  </div>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({ id: printDonor.id, name: printDonor.fullName, role: 'donor', bloodType: printDonor.bloodType }))}`}
                    alt="QR Code"
                    className="h-24 w-24"
                  />
                </div>

                <div className="border-b border-gray-200 pb-2 mb-2 print:border-black">
                  <h3 className="text-lg font-semibold text-gray-800">Account Info</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500 block">Username</span>
                    <span className="font-mono font-medium text-gray-900">@{printDonor.username || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Password</span>
                    <span className="font-mono font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-200">12345678</span>
                    <span className="text-red-600 text-xs font-bold block mt-1">
                      the password must change after first login
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Email</span>
                    <span className="font-medium text-gray-900 break-all">{printDonor.email || 'N/A'}</span>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500 block">Phone</span>
                    <span className="font-medium text-gray-900">{printDonor.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Blood Type</span>
                    <span className="font-medium text-red-600 font-bold">{printDonor.bloodType}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Status</span>
                    <span className="font-medium text-gray-900 capitalize">{printDonor.status}</span>
                  </div>
                </div>

                {/* Full Information Section */}
                <div className={printMode === 'full' ? 'block' : 'hidden'}>
                  <div className="mt-6 pt-4 border-t border-black">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Personal & Medical Information</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <p><strong>Age:</strong> {printDonor.age || 'N/A'}</p>
                      <p><strong>Gender:</strong> {printDonor.gender || 'N/A'}</p>
                      <p><strong>Total Donations:</strong> {printDonor.totalDonations}</p>
                      <p><strong>Last Donation:</strong> {printDonor.lastDonation || 'Never'}</p>
                      <div className="col-span-2">
                        <strong>Medical Condition:</strong> {printDonor.medicalCondition || 'None'}
                      </div>
                      <div className="col-span-2 mt-2">
                        <strong>Address:</strong><br />
                        {getFullAddress(printDonor)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 print:hidden border-t border-gray-100 mt-4">
                <button
                  onClick={() => executePrint('full')}
                  className={`flex-1 px-2 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm ${printMode === 'full' ? 'bg-purple-600 text-white hover:bg-purple-700 ring-2 ring-offset-2 ring-purple-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  {printMode === 'full' ? 'Print Full' : 'Preview Full'}
                </button>
                <button
                  onClick={() => executePrint('essential')}
                  className={`flex-1 px-2 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm ${printMode === 'essential' ? 'bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-offset-2 ring-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {printMode === 'essential' ? 'Print Essential' : 'Preview Essential'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-area, #printable-area * {
                        visibility: visible;
                    }
                    #printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        background: white;
                        padding: 0;
                        margin: 0;
                    }
                    /* Ensure background colors/images print */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

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
                <p className="text-sm text-gray-600">Donor ID: {selectedDonor.id}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedDonor(null)}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Personal Info */}
            <div className="md:col-span-3 pb-2 border-b border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800">Personal Information</h4>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('fullName')}</p>
              <p className="font-medium">{selectedDonor.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Username</p>
              <p className="font-medium">@{selectedDonor.username || 'N/A'}</p>
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
              <p className="text-sm text-gray-600">Gender</p>
              <p className="font-medium capitalize">{selectedDonor.gender || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('availability')}</p>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedDonor.availability === 'ready'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-orange-100 text-orange-800'
                  }`}
              >
                {selectedDonor.availability === 'ready' ? t('ready') : t('resting')}
              </span>
            </div>
            {/* ... Personal Info ... */}
            <div>
              <p className="text-sm text-gray-600">{t('totalDonations')}</p>
              <p className="font-medium">{selectedDonor.totalDonations}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('lastDonation')}</p>
              <p className="font-medium">{selectedDonor.lastDonation || 'N/A'}</p>
            </div>

            {/* Medical Info */}
            <div className="md:col-span-3 pt-4 pb-2 border-b border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800">{t('medicalCondition')}</h4>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('medicalCondition')}</p>
              <p className="font-medium">{selectedDonor.medicalCondition || 'None'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Disability</p>
              <p className="font-medium">
                {selectedDonor.hasDisability === 'Yes'
                  ? `Yes (${selectedDonor.disabilityType || 'Unspecified'})`
                  : 'No'}
              </p>
            </div>

            {/* Address Info */}
            <div className="md:col-span-3 pt-4 pb-2 border-b border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800">{t('address')}</h4>
            </div>
            <div className="md:col-span-3">
              <p className="font-medium">{getFullAddress(selectedDonor)}</p>
            </div>
          </div>

          {/* ID Cards */}
          <div className="md:col-span-3 pt-4 pb-2 border-b border-gray-100 mt-4">
            <h4 className="text-lg font-semibold text-gray-800">Identification Cards</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Front ID</p>
              {(selectedDonor as any).idCardFront ? (
                <div className="relative group">
                  <img
                    src={(selectedDonor as any).idCardFront}
                    alt="Front ID"
                    className="w-full h-auto object-contain rounded-lg border border-gray-200 bg-gray-50"
                  />
                </div>
              ) : (
                <div className="h-48 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                  </svg>
                  <p className="text-sm">No Front ID</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Back ID</p>
              {(selectedDonor as any).idCardBack ? (
                <div className="relative group">
                  <img
                    src={(selectedDonor as any).idCardBack}
                    alt="Back ID"
                    className="w-full h-auto object-contain rounded-lg border border-gray-200 bg-gray-50"
                  />
                </div>
              ) : (
                <div className="h-48 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                  </svg>
                  <p className="text-sm">No Back ID</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={() => {
                // Assuming we have useNavigate imported as navigate, if not I need to add that to the top of file.
                // Checking file content: import { useNavigate } from 'react-router-dom' is NOT present in original file.
                // I will use window.location.href for now to avoid multiple edits or I can try to use a hidden link click?
                // No, standard is best. I'll stick to window.location.href if I can't add import easily in one go.
                // Actually, I can use the same trick as Staff view if I added the hook.
                // But wait, replace_file_content is for contiguous block.
                // I'll stick to window.location.href for this block, OR notice that ViewStaffView used `navigate`.
                // I will keep window.location.href but style it right.
                navigate(`../edit-donor/${selectedDonor.id}`);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {t('edit')}
            </button>
            <button
              onClick={() => setSelectedDonor(null)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Close
            </button>
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
                  <tr key={donor.id} data-donor-id={donor.id}>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {donor.status === 'Active' ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Unapproved
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                        {donor.bloodType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="truncate">
                        {donor.locationDetails?.region || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${donor.availability === 'ready'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                          }`}
                      >
                        {donor.availability === 'ready' ? t('ready') : t('resting')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.totalDonations}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDonor(donor);
                          import('../../../utils/ActivityTracker').then(({ ActivityTracker }) => {
                            // Re-implementing simple retrieval for speed/safety:
                            const getUser = () => {
                              const roles = ['staff', 'admin', 'super_admin'];
                              for (const r of roles) {
                                const s = sessionStorage.getItem(`user_${r}`) || localStorage.getItem(`user_${r}`);
                                if (s) return JSON.parse(s);
                              }
                              return null;
                            };
                            const user = getUser();
                            if (user && user.role === 'staff') { // Only log for staff
                              ActivityTracker.addLog({
                                staffId: user.id,
                                actionType: 'VIEW_DONOR',
                                targetId: donor.id,
                                targetName: donor.fullName,
                                targetProfilePicture: donor.profilePicture,
                                details: 'Viewed donor details',
                                staff: user
                              });
                            }
                          });
                        }}
                        className="text-purple-600 hover:text-purple-800 font-semibold"
                      >
                        {t('view')}
                      </button>
                      <button
                        onClick={() => handlePrintClick(donor)}
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print
                      </button>
                      <div className="hidden">
                        <button
                          onClick={() => window.location.href = `/admin/edit-donor/${donor.id}`}
                          className="text-green-600 hover:text-green-800 font-semibold"
                        >
                          {t('edit')}
                        </button>
                        <button
                          onClick={() => {
                            openConfirmation(
                              "Delete Donor",
                              "Are you sure you want to delete this donor? This action cannot be undone.",
                              async () => {
                                try {
                                  await import('../../../controllers/donorController').then(m => m.deleteDonor(donor.id));
                                  setDonors(donors.filter(d => d.id !== donor.id));
                                  toast.success("Donor deleted successfully");
                                } catch (e) {
                                  toast.error('Failed to delete donor');
                                }
                              },
                              'danger',
                              'Delete Donor'
                            );
                          }}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          {t('delete')}
                        </button>
                      </div>
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
    </div >
  );
};

export default ViewDonorsView;
