import { FormEvent, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { validatePassword } from '../../../utils/validation';
import { registerHospital } from '../../../controllers/hospitalController';
import { ActivityTracker } from '../../../utils/ActivityTracker';
const AddHospitalView = () => {

  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hospitalLicenseRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [hospitalLicense, setHospitalLicense] = useState<string | null>(null);
  const [hospitalLicenseName, setHospitalLicenseName] = useState<string | null>(null);

  const [printMode, setPrintMode] = useState<'essential' | 'full'>('essential');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    email: '',
    contactDoctorName: '',
    contactDoctorPhone: '',
    fanNumber: '',
    region: '',
    city: '',
    subCity: '',
    woreda: '',
    kebele: '',
    street: '',
    businessLicenseName: '',
    businessLicenseNumber: '',
    hospitalType: 'Government Hospital' as 'Government Hospital' | 'Non-Government Hospital',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    username: '',
    password: '12345678',
    confirmPassword: '12345678',
    idCardFront: null as string | null,
    idCardBack: null as string | null,
  });

  const [isLocating, setIsLocating] = useState(false);

  const handleGetLocation = async () => {
    setIsLocating(true);
    try {
      const { getCurrentLocation, getAddressFromCoordinates } = await import('../../../utils/geoUtils');
      const position = await getCurrentLocation();
      const { latitude, longitude } = position.coords;

      // Get address details
      const address = await getAddressFromCoordinates(latitude, longitude);

      setFormState((prev: any) => ({
        ...prev,
        location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        latitude,
        longitude,
        // Auto-fill address fields
        region: address.region || prev.region || '',
        city: address.city || prev.city || '',
        subCity: address.subCity || prev.subCity || '',
        woreda: address.woreda || prev.woreda || '',
        kebele: address.kebele || prev.kebele || '',
        street: address.street || prev.street || '',
      }));
    } catch (error: any) {
      console.error('Error getting location:', error);
      toast.error(error.message || 'Unable to retrieve location');
    } finally {
      setIsLocating(false);
    }
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHospitalLicenseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setHospitalLicenseName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHospitalLicense(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setHospitalLicense(null);
      setHospitalLicenseName(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formState.password !== formState.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (formState.password !== '12345678') {
      const passwordValidation = validatePassword(formState.password);
      if (!passwordValidation.isValid) {
        toast.error(passwordValidation.message);
        return;
      }
    }

    if (formState.fanNumber.length !== 16) {
      toast.error('FAN Number must be exactly 16 digits.');
      return;
    }

    if (!formState.location || !formState.latitude || !formState.longitude) {
      toast.error('Location (GPS) is required. Please use the "Get Location" button.');
      return;
    }

    if (formState.phone.length !== 10) {
      toast.error('Mobile phone must be exactly 10 digits.');
      return;
    }

    if (formState.contactDoctorPhone.length !== 10) {
      toast.error('Contact Doctor Phone number must be exactly 10 digits.');
      return;
    }

    // Generate ID - let backend do it
    // const hospitalId = generateHospitalId(); 
    const registrationDate = new Date().toISOString().split('T')[0];

    // Create payload
    const payload = {
      ...formState,
      profilePicture: profilePicture || undefined,
      businessLicenseImage: hospitalLicense || undefined,
      idCardFront: formState.idCardFront || undefined,
      idCardBack: formState.idCardBack || undefined,
    };

    try {
      const response = await registerHospital(payload);

      const fullAddress = `${formState.region}, ${formState.city}, ${formState.subCity || ''} ${formState.woreda ? 'Woreda ' + formState.woreda : ''} ${formState.kebele ? 'Kebele ' + formState.kebele : ''}`.replace(/\s+/g, ' ').trim();

      setSuccessData({
        hospitalId: response.id,
        hospitalName: response.name,
        hospitalType: response.hospitalType,
        contactDoctorName: response.contactDoctorName,
        contactDoctorPhone: response.contactDoctorPhone,
        fanNumber: formState.fanNumber,
        licenseNumber: formState.businessLicenseNumber,
        phone: response.phone,
        email: response.email,
        address: fullAddress,
        location: formState.location,
        latitude: formState.latitude,
        longitude: formState.longitude,
        registrationDate,
        username: response.username,
        password: formState.password,
        status: response.status || 'Active',
        profilePicture: profilePicture
      });


      // Log Activity
      try {
        const currentUser = JSON.parse(sessionStorage.getItem('user_staff') || localStorage.getItem('user_staff') || sessionStorage.getItem('user_admin') || localStorage.getItem('user_admin') || '{}');
        if (currentUser && currentUser.id) {
          ActivityTracker.addLog({
            staffId: currentUser.id,
            actionType: 'REGISTER_HOSPITAL',
            targetId: response.id,
            targetName: response.name,
            targetProfilePicture: null,
            details: `Registered new hospital: ${response.name}`,
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
        }
      } catch (logError) {
        console.error('Failed to log activity', logError);
      }

      toast.success('Hospital registered successfully!');
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Registration failed', error);
      toast.error('Failed to add hospital: ' + (error.response?.data?.message || error.message));
    }
  };

  const handlePrint = (mode: 'essential' | 'full') => {
    if (printMode !== mode) {
      setPrintMode(mode);
    } else {
      setTimeout(() => {
        window.print();
      }, 100);
    }
  };

  const handleClose = () => {
    setShowSuccessModal(false);
    navigate('../view-hospitals');
  };

  if (showSuccessModal && successData) {
    const qrData = JSON.stringify({
      id: successData.hospitalId,
      username: successData.username,
      name: successData.hospitalName,
      role: 'Hospital'
    });
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:absolute print:inset-0 print:p-0 print:overflow-visible print:max-h-none">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 transition flex items-center justify-center h-10 w-10 z-10 print:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-center print:text-left space-y-4 pt-4">
            <div className="flex justify-center mb-4 print:hidden">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 print:text-3xl print:mb-6">Hospital Registration Complete</h2>
            <p className="text-gray-600 print:hidden">The new hospital account has been successfully created. Select a print option below.</p>

            <div id="printable-area" className="bg-gray-50 rounded-xl p-6 text-left space-y-4 border border-gray-200 print:border-none print:bg-white print:p-0">
              {/* Header with Profile & QR - Visible in Print */}
              <div className="hidden print:flex justify-between items-start mb-6 border-b border-black pb-4">
                <div className="flex items-center gap-4">
                  {successData.profilePicture ? (
                    <img src={successData.profilePicture} className="h-24 w-24 rounded-full object-cover border border-gray-300" alt="Hospital Profile" />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-200 border border-gray-300"></div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold">{successData.hospitalName}</h1>
                    <p className="text-gray-600">{successData.hospitalType}</p>
                  </div>
                </div>
                <img src={qrCodeUrl} alt="QR Code" className="h-24 w-24" />
              </div>

              <div className="border-b border-gray-200 pb-2 mb-2 print:border-black">
                <h3 className="text-lg font-semibold text-gray-800">Account Credentials</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500 block">Username</span>
                  <span className="font-mono font-medium text-gray-900">{successData.username}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Password <span className="text-red-600 text-xs font-bold uppercase">(Must Change)</span></span>
                  <span className="font-mono font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-200">{successData.password}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Email</span>
                  <span className="font-medium text-gray-900 break-all">{successData.email}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Phone</span>
                  <span className="font-medium text-gray-900">{successData.phone}</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 flex items-start mt-4 print:mt-4">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>
                  <strong>Security Notice:</strong> Please change your password immediately upon your first login. Keep these credentials confidential.
                </span>
              </div>

              {/* Full Information Section - Conditional Render based on printMode */}
              <div className={printMode === 'full' ? 'block' : 'hidden'}>
                <div className="mt-6 pt-4 border-t border-black">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Hospital Information</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <p><strong>Hospital Name:</strong> {successData.hospitalName}</p>
                    <p><strong>Type:</strong> {successData.hospitalType}</p>
                    <p><strong>License No:</strong> {successData.licenseNumber}</p>
                    <p><strong>FAN:</strong> {successData.fanNumber}</p>
                    <div className="col-span-2 mt-2">
                      <strong>Address:</strong><br />
                      {successData.address}
                    </div>
                    <div className="col-span-2 mt-2">
                      <strong>Contact Person:</strong><br />
                      Doctor: {successData.contactDoctorName}<br />
                      Phone: {successData.contactDoctorPhone}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 print:hidden border-t border-gray-100 mt-4">
              <button
                onClick={() => handlePrint('full')}
                className={`flex-1 px-2 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm ${printMode === 'full' ? 'bg-purple-600 text-white hover:bg-purple-700 ring-2 ring-offset-2 ring-purple-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                {printMode === 'full' ? 'Print Full' : 'Preview Full'}
              </button>
              <button
                onClick={() => handlePrint('essential')}
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
                    background: white;
                    padding: 2rem;
                }
            }
        `}</style>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-900 mb-8">{t('addHospital')}</h2>
      <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Hospital Profile"
                  className="h-32 w-32 rounded-full object-cover border-4 border-red-600"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                  <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">{t('uploadProfilePicture')}</p>

          </div>



          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('hospitalName')} <span className="text-primary">*</span>
              </label>
              <input
                required
                maxLength={35}
                type="text"
                value={formState.name}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  setFormState((prev) => ({ ...prev, name: val }));
                }}
                className={`w-full rounded-xl border px-4 py-3 focus:outline-none transition ${formState.name.length === 35
                  ? 'border-red-500 focus:border-red-500 bg-red-50'
                  : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                  }`}
                placeholder={t('enterHospitalName')}
              />
              {formState.name.length === 35 && (
                <p className="text-red-500 text-xs mt-1">Max length reached (35 characters).</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Landline Phone <span className="text-primary">*</span>
              </label>
              <input
                required
                type="tel"
                maxLength={10}
                value={formState.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setFormState((prev) => ({ ...prev, phone: val }));
                }}
                className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-4 transition ${formState.phone && formState.phone.length !== 10
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10 bg-red-50'
                  : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                  }`}
                placeholder="0114141764"
              />
              {formState.phone && formState.phone.length !== 10 && (
                <p className="text-red-500 text-xs mt-1">Must be exactly 10 digits.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('emailAddress')} <span className="text-primary">*</span>
              </label>
              <input
                required
                type="email"
                value={formState.email}
                onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-4 transition ${formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10 bg-red-50'
                  : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                  }`}
                placeholder={t('enterEmail')}
              />
              {formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email) && (
                <p className="text-red-500 text-xs mt-1">Example: amanuelbeyenee@gmail.com</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('contactDoctorName')} <span className="text-primary">*</span>
              </label>
              <input
                required
                type="text"
                maxLength={35}
                value={formState.contactDoctorName}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  setFormState((prev) => ({ ...prev, contactDoctorName: val }));
                }}
                className={`w-full rounded-xl border px-4 py-3 focus:outline-none transition ${formState.contactDoctorName.length === 35
                  ? 'border-red-500 focus:border-red-500 bg-red-50'
                  : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                  }`}
                placeholder={t('enterContactDoctorName')}
              />
              {formState.contactDoctorName.length === 35 && (
                <p className="text-red-500 text-xs mt-1">Max length reached (35 characters).</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('contactDoctorPhone')} <span className="text-primary">*</span>
              </label>
              <input
                required
                type="tel"
                maxLength={10}
                value={formState.contactDoctorPhone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setFormState((prev) => ({ ...prev, contactDoctorPhone: val }));
                }}
                className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-4 transition ${formState.contactDoctorPhone && formState.contactDoctorPhone.length !== 10
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10 bg-red-50'
                  : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                  }`}
                placeholder="+251 911 / 0911"
              />
              {formState.contactDoctorPhone && formState.contactDoctorPhone.length !== 10 && (
                <p className="text-red-500 text-xs mt-1">Must be exactly 10 digits. Example +251 911... or 0911...</p>
              )}
            </div>


            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contact Doctor FAN Number <span className="text-primary">*</span>
              </label>
              <input
                required
                type="text"
                maxLength={16}
                value={formState.fanNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setFormState((prev) => ({ ...prev, fanNumber: val }));
                }}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                placeholder="Enter 16-digit FAN Number"
              />
              {formState.fanNumber && formState.fanNumber.length !== 16 && (
                <p className="text-red-500 text-xs mt-1">FAN Number must be exactly 16 digits.</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('hospitalType')} <span className="text-primary">*</span>
              </label>
              <select
                required
                value={formState.hospitalType}
                onChange={(e) => setFormState((prev) => ({ ...prev, hospitalType: e.target.value as 'Government Hospital' | 'Non-Government Hospital' }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
              >
                <option value="Government Hospital">{t('governmentHospital')}</option>
                <option value="Non-Government Hospital">{t('nonGovernmentHospital')}</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('address')}</h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Location (GPS) <span className="text-primary">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  required
                  type="text"
                  value={formState.location}
                  onChange={(e) => setFormState((prev) => ({ ...prev, location: e.target.value }))}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder="Enter location or use button"
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-medium hover:bg-slate-200 transition flex items-center gap-2"
                >
                  {isLocating ? (
                    <span className="h-4 w-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                  {t('getLocation' as any) || 'Get Location'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('region')} <span className="text-primary">*</span>
              </label>
              <input
                required
                type="text"
                value={formState.region}
                onChange={(e) => setFormState((prev) => ({ ...prev, region: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                placeholder={t('enterRegion')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('city')} <span className="text-primary">*</span>
              </label>
              <input
                required
                type="text"
                value={formState.city}
                onChange={(e) => setFormState((prev) => ({ ...prev, city: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                placeholder={t('enterCity')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('subCity')} <span className="text-primary">*</span>
              </label>
              <input
                required
                type="text"
                value={formState.subCity}
                onChange={(e) => setFormState((prev) => ({ ...prev, subCity: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                placeholder={t('enterSubCity')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('woreda')} <span className="text-primary">*</span>
              </label>
              <input
                required
                type="text"
                value={formState.woreda}
                onChange={(e) => setFormState((prev) => ({ ...prev, woreda: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                placeholder={t('enterWoreda')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('kebele')} <span className="text-primary">*</span>
              </label>
              <input
                required
                type="text"
                value={formState.kebele}
                onChange={(e) => setFormState((prev) => ({ ...prev, kebele: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                placeholder={t('enterKebele')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('street')}</label>
              <input
                type="text"
                value={formState.street}
                onChange={(e) => setFormState((prev) => ({ ...prev, street: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                placeholder={t('enterStreet')}
              />
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('businessLicense')}</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('businessLicenseName')} <span className="text-primary">*</span>
              </label>
              <input
                required
                type="text"
                value={formState.businessLicenseName}
                onChange={(e) => setFormState((prev) => ({ ...prev, businessLicenseName: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                placeholder={t('enterBusinessLicenseName')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('businessLicenseNumber')} <span className="text-primary">*</span>
              </label>
              <input
                required
                type="text"
                value={formState.businessLicenseNumber}
                onChange={(e) => setFormState((prev) => ({ ...prev, businessLicenseNumber: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                placeholder={t('enterBusinessLicenseNumber')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('uploadHospitalLicense')}</label>
              <div
                onClick={() => hospitalLicenseRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition group"
              >
                <div className="bg-blue-50 p-4 rounded-full mb-3 group-hover:bg-blue-100 transition">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium text-sm mb-1">
                  Drag and Drop here
                </p>
                <p className="text-gray-400 text-xs mb-2">or</p>
                <span className="text-primary font-bold text-sm hover:underline">Browse files</span>
                <input
                  ref={hospitalLicenseRef}
                  type="file"
                  accept="image/*"
                  onChange={handleHospitalLicenseChange}
                  className="hidden"
                />
              </div>
              {hospitalLicenseName && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Selected: <span className="font-semibold truncate max-w-xs">{hospitalLicenseName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('createUsernamePassword' as any) || 'Create your Username and Password'}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('username' as any) || 'Username'} <span className="text-primary">*</span>
              </label>
              <input
                required
                type="text"
                maxLength={20}
                value={formState.username}
                onChange={(e) => setFormState((prev) => ({ ...prev, username: e.target.value }))}
                className={`w-full rounded-xl border px-4 py-3 focus:outline-none transition ${formState.username && !/^[a-zA-Z0-9]+$/.test(formState.username)
                  ? 'border-red-500 focus:border-red-500 bg-red-50'
                  : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                  }`}
                placeholder={t('enterUsername' as any) || 'Enter Username'}
              />
              {formState.username && !/^[a-zA-Z0-9]+$/.test(formState.username) && (
                <p className="text-red-500 text-xs mt-1">Username must be alphanumeric (text and numbers only).</p>
              )}
              <p className="text-slate-500 text-xs mt-1">Example: amanuel / amanuel369</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('password' as any) || 'Password'} <span className="text-primary">*</span>
              </label>
              <input
                required
                type="text"
                value={formState.password}
                readOnly
                className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none"
              />
              <p className="text-[10px] text-primary font-bold mt-1 uppercase">
                Must change after first login
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password <span className="text-primary">*</span>
              </label>
              <input
                required
                type="text"
                value={formState.confirmPassword}
                readOnly
                className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-100 mt-6">
            <button
              type="submit"
              className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition shadow-lg shadow-primary/20"
            >
              {t('addHospital')}
            </button>
            <button
              type="button"
              className="flex-1 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div >

    </div >
  );
};

export default AddHospitalView;
