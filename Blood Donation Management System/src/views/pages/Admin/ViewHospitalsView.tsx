import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchHospitals } from '../../../controllers/hospitalController';
import type { Hospital } from '../../../models/Hospital';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';

const ViewHospitalsView = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);

  // Print Logic
  const [printHospital, setPrintHospital] = useState<Hospital | null>(null);
  const [printMode, setPrintMode] = useState<'essential' | 'full'>('essential');
  const [viewLicense, setViewLicense] = useState<string | null>(null);

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      setLoading(true);
      const data = await fetchHospitals();
      // setHospitals(data.filter(h => h.status === 'Active')); // Removed filter to show all status
      setHospitals(data);
    } catch (error: any) {
      console.error('Failed to load hospitals', error);
      toast.error(`Failed to load hospitals: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintClick = (hospital: Hospital) => {
    setPrintHospital(hospital);
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
    return hospital.location || 'N/A';
  };

  const handlePrintLicense = () => {
    if (!viewLicense) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Business License</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
              img { max-width: 100%; max-height: 100%; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="${viewLicense}" onload="window.print();window.close()" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('viewHospitalDetails')}</h2>

      {/* License View Modal */}
      {viewLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Business License</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintLicense}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
                <button
                  onClick={() => setViewLicense(null)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex justify-center bg-gray-50 rounded-lg p-4 border border-gray-200">
              <img
                src={viewLicense}
                alt="Business License"
                className="max-w-full h-auto rounded-md shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {printHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:absolute print:inset-0 print:p-0 print:overflow-visible print:max-h-none">
            <button
              onClick={() => setPrintHospital(null)}
              className="absolute right-4 top-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 transition flex items-center justify-center h-10 w-10 z-10 print:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center print:text-left space-y-4 pt-4">
              <div className="mb-4 print:hidden">
                <h2 className="text-xl font-bold text-gray-900 text-left">Print Hospital Details</h2>
              </div>

              <div id="printable-area" className="bg-gray-50 rounded-xl p-6 text-left space-y-4 border border-gray-200 print:border-none print:bg-white print:p-0">
                {/* Header with Profile & QR */}
                <div className="flex justify-between items-start mb-6 border-b border-black pb-4">
                  <div className="flex items-center gap-4">
                    {printHospital.profilePicture ? (
                      <img src={printHospital.profilePicture} className="h-24 w-24 rounded-full object-cover border border-gray-300" alt="Profile" />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 font-bold text-2xl">
                        {printHospital.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl font-bold">{printHospital.name}</h1>
                      <p className="text-gray-600">{printHospital.hospitalType}</p>
                      <p className="text-sm text-gray-500">ID: {printHospital.id}</p>
                    </div>
                  </div>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({ id: printHospital.id, name: printHospital.name, role: 'hospital' }))}`}
                    alt="QR Code"
                    className="h-24 w-24"
                  />
                </div>

                <div className="border-b border-gray-200 pb-2 mb-2 print:border-black">
                  <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500 block">Email</span>
                    <span className="font-medium text-gray-900 break-all">{printHospital.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Phone</span>
                    <span className="font-medium text-gray-900">{printHospital.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Landline</span>
                    <span className="font-medium text-gray-900">{printHospital.landline || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Status</span>
                    <span className="font-medium text-gray-900 capitalize">{printHospital.status}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Joined</span>
                    <span className="font-medium text-gray-900">{printHospital.createdAt ? new Date(printHospital.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                {/* Full Information Section */}
                <div className={printMode === 'full' ? 'block' : 'hidden'}>
                  <div className="mt-6 pt-4 border-t border-black">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Hospital Details</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <p><strong>License Name:</strong> {printHospital.businessLicenseName || 'N/A'}</p>
                      <p><strong>License No:</strong> {printHospital.businessLicenseNumber || 'N/A'}</p>
                      <p><strong>FAN:</strong> {printHospital.fanNumber || 'N/A'}</p>
                      <div className="col-span-2 mt-2">
                        <strong>Contact Person:</strong><br />
                        Name: {printHospital.contactDoctorName || 'N/A'}<br />
                        Phone: {printHospital.contactDoctorPhone || 'N/A'}
                      </div>
                      <div className="col-span-2 mt-2">
                        <strong>Address:</strong><br />
                        {getFullAddress(printHospital)}
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
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

      {/* View Details Modal */}
      {selectedHospital && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-6">
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
                <p className="text-sm text-gray-600">{t('hospitals')} ID: {selectedHospital.id}</p>
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedHospital.status === 'Active' ? 'bg-green-100 text-green-800' :
                    selectedHospital.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {selectedHospital.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedHospital(null)}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hospital Details... same fields as before but cleaned up */}
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
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">{t('address')}</p>
              <p className="font-medium">{getFullAddress(selectedHospital)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('businessLicenseName')}</p>
              <p className="font-medium">{selectedHospital.businessLicenseName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('businessLicenseNumber')}</p>
              <p className="font-medium">{selectedHospital.businessLicenseNumber || 'N/A'}</p>
            </div>
          </div>

          {/* ID Cards */}
          <div className="md:col-span-2 pt-4 pb-2 border-b border-gray-100 mt-4">
            <h4 className="text-lg font-semibold text-gray-800">Identification Cards</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Front ID</p>
              {(selectedHospital as any).idCardFront ? (
                <div className="relative group">
                  <img
                    src={(selectedHospital as any).idCardFront}
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
              {(selectedHospital as any).idCardBack ? (
                <div className="relative group">
                  <img
                    src={(selectedHospital as any).idCardBack}
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
          {/* Action Footer for View Modal */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={() => navigate(`/admin/edit-hospital/${selectedHospital.id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Hospital
            </button>
            <button
              onClick={() => setSelectedHospital(null)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('hospitals')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('emailAddress')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Landline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">{t('phoneNumber')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('hospitalType')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">{t('address')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Loading hospitals...
                  </td>
                </tr>
              ) : hospitals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
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
                            <span className="text-gray-500 font-bold">{hospital.name.charAt(0)}</span>
                          </div>
                        )}
                        <span>{hospital.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.landline || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{hospital.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {hospital.hospitalType || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {hospital.businessLicenseImage ? (
                        <button
                          onClick={() => setViewLicense(hospital.businessLicenseImage || null)}
                          className="text-gray-500 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
                          title="View License"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      ) : (
                        <span className="text-gray-300 pointer-events-none" title="No License Image">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs hidden lg:table-cell">
                      <div className="truncate" title={getFullAddress(hospital)}>
                        {hospital.locationDetails?.region || hospital.location || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${hospital.status === 'Active' ? 'bg-green-100 text-green-800' :
                        hospital.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {hospital.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => {
                          setSelectedHospital(hospital);
                          try {
                            const currentUser = JSON.parse(sessionStorage.getItem('user_staff') || localStorage.getItem('user_staff') || sessionStorage.getItem('user_admin') || localStorage.getItem('user_admin') || '{}');
                            if (currentUser && currentUser.id) {
                              import('../../../utils/ActivityTracker').then(({ ActivityTracker }) => {
                                ActivityTracker.addLog({
                                  staffId: currentUser.id,
                                  actionType: 'VIEW_HOSPITAL',
                                  targetId: hospital.id,
                                  targetName: hospital.name,
                                  targetProfilePicture: hospital.profilePicture || null,
                                  details: `Viewed hospital details: ${hospital.name}`,
                                  staff: {
                                    id: currentUser.id,
                                    fullName: currentUser.name || currentUser.fullName,
                                    email: currentUser.email,
                                    role: currentUser.role,
                                    status: 'Active',
                                    phone: currentUser.phone || '',
                                    profilePicture: currentUser.profilePicture || ''
                                  }
                                });
                              });
                            }
                          } catch (e) {
                            console.error('Failed to log view activity', e);
                          }
                        }}
                        className="text-purple-600 hover:text-purple-800 font-semibold"
                      >
                        {t('view')}
                      </button>
                      <button
                        onClick={() => handlePrintClick(hospital)}
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 inline-flex"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print
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

export default ViewHospitalsView;
