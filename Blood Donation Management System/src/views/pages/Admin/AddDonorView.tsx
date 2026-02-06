import { FormEvent, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { validatePassword } from '../../../utils/validation';

import { registerDonor } from '../../../controllers/donorController';

const APPOINTMENT_LOCATIONS = {
  'Addis Ababa': ['Ethio Tebib Hospital', 'Genet Hospital', 'Girum Hospital', 'On Street'],
  'Amhara': ['Felege Hiwot Referral Hospital', 'Debre Markos Referral Hospital', 'Debre Birhan Referral Hospital', 'Kemise General Hospital', 'On Street'],
  'Oromia': ['Alem Gena Hospital', 'Sebeta Hospital', 'Dima Hospital', 'Asko Hospital', 'On Street'],
  'Hawasa': ['Asher Primary Hospital', 'Bete Abraham', 'Kiburu Hospital', 'Yanet Hospital', 'On Street'],
};

const AddDonorView = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [printMode, setPrintMode] = useState<'essential' | 'full'>('essential');

  const [formState, setFormState] = useState({
    fullName: '',
    bloodType: '',
    birthDate: '',
    donationAppointmentDate: '',
    age: '',
    weight: '',
    maritalStatus: '',
    gender: '',

    phone: '',
    email: '',
    region: '',
    city: '',
    subCity: '',
    woreda: '',
    kebele: '',
    street: '',
    homeNumber: '',
    medicalCondition: '',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    username: '',
    password: '12345678',
    confirmPassword: '12345678',
    fanNumber: '',
    appointmentRegion: '',
    appointmentPlace: '',
    appointmentTime: '',
    hasDisability: '',
    disabilityType: '',
    idCardFront: null as string | null,
    idCardBack: null as string | null,
  });



  const handleGetLocation = async () => {
    setIsLocating(true);
    try {
      const { getCurrentLocation, getAddressFromCoordinates } = await import('../../../utils/geoUtils');
      const position = await getCurrentLocation();
      const { latitude, longitude } = position.coords;

      // Get address details
      const address = await getAddressFromCoordinates(latitude, longitude);

      setFormState((prev) => ({
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
        homeNumber: address.homeNumber || prev.homeNumber || ''
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

  const calculateAge = (dateString: string) => {
    if (!dateString) return '';
    const today = new Date();
    const dob = new Date(dateString);
    if (Number.isNaN(dob.getTime())) return '';
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age -= 1;
    }
    return age.toString();
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
    navigate('/staff/view-donors'); // Or check if we should go to /admin/view-donors
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

    if (!formState.idCardFront) {
      toast.error('Front ID Card image is required.');
      return;
    }

    if (!formState.location || !formState.latitude || !formState.longitude) {
      toast.error('Location (GPS) is required. Please use the "Get Location" button.');
      return;
    }

    if (!formState.medicalCondition) {
      toast.error('Medical Condition is required.');
      return;
    }

    if (!formState.hasDisability) {
      toast.error('Please specify if you have any disabilities.');
      return;
    }

    if (parseInt(formState.age) <= 18) {
      toast.error('Age must be greater than 18.');
      return;
    }

    if (parseInt(formState.weight) <= 45) {
      toast.error('Weight must be greater than 45 kg.');
      return;
    }

    if (formState.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits.');
      return;
    }

    try {
      const newDonor = await registerDonor({
        fullName: formState.fullName,
        bloodType: formState.bloodType,
        birthDate: formState.birthDate,
        age: parseInt(formState.age),
        weight: formState.weight ? String(formState.weight) : undefined,
        gender: formState.gender,
        maritalStatus: formState.maritalStatus,
        phone: formState.phone,
        email: formState.email,

        locationDetails: {
          region: formState.region,
          city: formState.city,
          subCity: formState.subCity,
          woreda: formState.woreda,
          kebele: formState.kebele,
          street: formState.street,
          homeNumber: formState.homeNumber,
          location: formState.location,
          latitude: formState.latitude,
          longitude: formState.longitude,
        },

        medicalCondition: formState.medicalCondition,
        hasDisability: formState.hasDisability,
        disabilityType: formState.disabilityType,

        username: formState.username,
        password: formState.password,
        fanNumber: formState.fanNumber,

        appointmentRegion: formState.appointmentRegion,
        appointmentPlace: formState.appointmentPlace,
        appointmentTime: formState.appointmentTime,
        donationAppointmentDate: new Date(formState.donationAppointmentDate).toISOString(),
        profilePicture: profilePicture,
        idCardFront: formState.idCardFront,
        idCardBack: formState.idCardBack,
      });

      const loc = newDonor.locationDetails || {};
      const fullAddress = `${loc.region || ''}, ${loc.city || ''}, ${loc.subCity || ''} `.replace(/^, /, '').trim();

      setSuccessData({
        donorId: newDonor.id,
        lotteryId: newDonor.lotteryId,
        fullName: newDonor.fullName,
        bloodType: newDonor.bloodType,
        phone: newDonor.phone,
        email: newDonor.email,
        username: newDonor.username, // Added for success view
        address: fullAddress,
        medicalCondition: newDonor.medicalCondition,
        location: newDonor.location,
        registrationDate: new Date().toISOString().split('T')[0],
      });

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  if (showSuccessModal && successData) {
    const qrData = JSON.stringify({
      id: successData.donorId,
      lotteryId: successData.lotteryId,
      username: successData.username,
      name: successData.fullName,
      role: 'donor'
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

            <h2 className="text-2xl font-bold text-gray-900 print:text-3xl print:mb-6">Registration Submitted</h2>
            <p className="text-gray-600 print:hidden">The donor registration has been submitted successfully and is pending approval by an Admin.</p>

            <div id="printable-area" className="bg-gray-50 rounded-xl p-6 text-left space-y-4 border border-gray-200 print:border-none print:bg-white print:p-0">
              {/* Header with Profile & QR - Visible in Print */}
              <div className="hidden print:flex justify-between items-start mb-6 border-b border-black pb-4">
                <div className="flex items-center gap-4">
                  {profilePicture ? (
                    <img src={profilePicture} className="h-24 w-24 rounded-full object-cover border border-gray-300" alt="Profile" />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-200 border border-gray-300"></div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold">{successData.fullName}</h1>
                    <p className="text-gray-600">DONOR ID: {successData.donorId}</p>
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
                  <span className="text-sm text-gray-500 block">Temp Password</span>
                  <span className="font-mono font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-200">{formState.password}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Lottery ID</span>
                  {successData.lotteryId && successData.lotteryId !== 'PENDING' ? (
                    <span className="font-bold text-red-600 underline text-lg">{successData.lotteryId}</span>
                  ) : (
                    <span className="font-bold text-gray-400 text-lg">-</span>
                  )}
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Phone</span>
                  <span className="font-medium text-gray-900">{successData.phone}</span>
                </div>
              </div>

              {/* Full Information Section - Conditional Render based on printMode */}
              {printMode === 'full' && (
                <div className="mt-6 pt-4 border-t border-black">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Details</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <p><strong>Blood Type:</strong> {successData.bloodType}</p>
                    <p><strong>Medical:</strong> {successData.medicalCondition || 'None'}</p>
                    <p><strong>Address:</strong> {successData.address}</p>
                    <p><strong>Registered:</strong> {successData.registrationDate}</p>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 flex items-start mt-4 print:mt-4">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>
                  <strong>Security Notice:</strong> Please change your password immediately upon your first login. Keep your Lottery ID safe for record-keeping.
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 print:hidden border-t border-gray-100 mt-4">
              <button
                onClick={() => handlePrint('full')}
                className={`flex-1 px-2 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm ${printMode === 'full' ? 'bg-primary text-white hover:bg-primary-dark ring-2 ring-offset-2 ring-primary' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
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
    <div className="max-w-4xl mx-auto py-8 px-4 print:hidden">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">{t('addDonor')}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-card border border-slate-100 space-y-6">
        {/* Profile Picture Upload */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg text-slate-400">
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
          </div>
          <p className="mt-2 text-sm text-slate-500">{t('uploadProfilePicture')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Personal Information</h3>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('fullName')} <span className="text-primary">*</span></label>
            <input
              required
              maxLength={35}
              type="text"
              value={formState.fullName}
              onChange={(e) => setFormState(prev => ({ ...prev, fullName: e.target.value }))}
              className={`w-full rounded-xl border px-4 py-3 focus:outline-none transition ${formState.fullName.length === 35
                ? 'border-red-500 focus:border-red-500 bg-red-50'
                : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                }`}
              placeholder={t('enterFullName')}
            />
            {formState.fullName.length === 35 && (
              <p className="text-red-500 text-xs mt-1">Max length reached (35 characters).</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('bloodType')} <span className="text-primary">*</span></label>
            <select
              required
              value={formState.bloodType}
              onChange={(e) => setFormState(prev => ({ ...prev, bloodType: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
            >
              <option value="">{t('selectBloodType')}</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
              <option value="unknown">{t('bloodTypeUnknown')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('birthDate')} <span className="text-primary">*</span></label>
            <input
              required
              type="date"
              value={formState.birthDate}
              onChange={(e) => {
                const val = e.target.value;
                setFormState(prev => ({
                  ...prev,
                  birthDate: val,
                  age: calculateAge(val)
                }));
              }}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('age')} <span className="text-primary">*</span>
            </label>
            <input
              required
              type="number"
              value={formState.age}
              onChange={(e) => setFormState(prev => ({ ...prev, age: e.target.value }))}
              className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-4 transition ${parseInt(formState.age) <= 18
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10 bg-red-50'
                : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                }`}
            />
            {formState.age && parseInt(formState.age) <= 18 && (
              <p className="text-red-500 text-xs mt-1">Age must be over 18</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Weight (Kg) <span className="text-primary">*</span>
            </label>
            <input
              required
              type="number"
              value={formState.weight}
              onChange={(e) => setFormState(prev => ({ ...prev, weight: e.target.value }))}
              className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-4 transition ${parseInt(formState.weight) <= 45
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10 bg-red-50'
                : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                }`}
            />
            {formState.weight && parseInt(formState.weight) <= 45 && (
              <p className="text-red-500 text-xs mt-1">Weight Must be over 45</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Gender <span className="text-primary">*</span></label>
            <select
              required
              value={formState.gender}
              onChange={(e) => setFormState(prev => ({ ...prev, gender: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Marital Status <span className="text-primary">*</span></label>
            <select
              required
              value={formState.maritalStatus}
              onChange={(e) => setFormState(prev => ({ ...prev, maritalStatus: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
            >
              <option value="">Select Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Divorced">Divorced</option>
              <option value="Separated">Separated</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">FAN Number <span className="text-primary">*</span></label>
            <input
              required
              type="text"
              maxLength={16}
              value={formState.fanNumber}
              onChange={(e) => setFormState(prev => ({ ...prev, fanNumber: e.target.value.replace(/\D/g, '') }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
              placeholder="16 digits"
            />
            {formState.fanNumber && formState.fanNumber.length !== 16 && (
              <p className="text-red-500 text-xs mt-1">FAN Number must be exactly 16 digits.</p>
            )}
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 pb-4 border-t border-b border-slate-100">
            {/* Front ID Upload */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-slate-700 mb-2">Front ID <span className="text-primary">*</span></label>
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 hover:bg-slate-50 transition cursor-pointer flex flex-col items-center justify-center min-h-[150px]"
                onClick={() => document.getElementById('frontIdInput')?.click()}
              >
                {formState.idCardFront ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <img src={formState.idCardFront} alt="Front ID" className="h-32 object-contain rounded-md" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormState((prev) => ({ ...prev, idCardFront: null }));
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition shadow-sm z-10"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-slate-500">Click to upload Front ID</span>
                  </>
                )}
                <input
                  id="frontIdInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormState(prev => ({ ...prev, idCardFront: reader.result as string }));
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>

            {/* Back ID Upload */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-slate-700 mb-2">Back ID</label>
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 hover:bg-slate-50 transition cursor-pointer flex flex-col items-center justify-center min-h-[150px]"
                onClick={() => document.getElementById('backIdInput')?.click()}
              >
                {formState.idCardBack ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <img src={formState.idCardBack} alt="Back ID" className="h-32 object-contain rounded-md" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormState((prev) => ({ ...prev, idCardBack: null }));
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition shadow-sm z-10"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-slate-500">Click to upload Back ID</span>
                  </>
                )}
                <input
                  id="backIdInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormState(prev => ({ ...prev, idCardBack: reader.result as string }));
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>
          </div>





          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('phoneNumber')} <span className="text-primary">*</span></label>
            <input
              required
              type="tel"
              maxLength={10}
              value={formState.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setFormState(prev => ({ ...prev, phone: val }));
              }}
              className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-4 transition ${formState.phone && formState.phone.length !== 10
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10 bg-red-50'
                : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                }`}
              placeholder="+251 911 / 0911"
            />
            {formState.phone && formState.phone.length !== 10 && (
              <p className="text-red-500 text-xs mt-1">Must be exactly 10 digits.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('emailAddress')}</label>
            <input
              type="email"
              value={formState.email}
              onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
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

          {/* Address Section */}
          <div className="md:col-span-2 pt-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">{t('address')}</h3>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Location (GPS) <span className="text-primary">*</span></label>
            <div className="flex gap-2">
              <input
                required
                type="text"
                value={formState.location}
                onChange={(e) => setFormState(prev => ({ ...prev, location: e.target.value }))}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                placeholder="Coordinates"
              />
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-200 transition"
              >
                {isLocating ? 'Locating...' : (t('getLocation' as any) || 'Get Location')}
              </button>
            </div>
          </div>

          {[
            { label: t('region'), key: 'region', required: true },
            { label: t('city'), key: 'city', required: true },
            { label: t('subCity'), key: 'subCity', required: true },
            { label: t('woreda'), key: 'woreda', required: true },
            { label: t('kebele'), key: 'kebele', required: true },
            { label: t('street'), key: 'street' },
            { label: t('homeNumber'), key: 'homeNumber' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {field.label} {field.required && <span className="text-primary">*</span>}
              </label>
              <input
                required={field.required}
                type="text"
                value={(formState as any)[field.key]}
                onChange={(e) => setFormState(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
              />
            </div>
          ))}

          {/* Appointment Section */}
          <div className="md:col-span-2 pt-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Donation Appointment</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Appointment Region <span className="text-primary">*</span></label>
            <select
              required
              value={formState.appointmentRegion}
              onChange={(e) => setFormState(prev => ({ ...prev, appointmentRegion: e.target.value, appointmentPlace: '' }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
            >
              <option value="">Select Region</option>
              {Object.keys(APPOINTMENT_LOCATIONS).map(reg => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Appointment Place <span className="text-primary">*</span></label>
            <select
              required
              disabled={!formState.appointmentRegion}
              value={formState.appointmentPlace}
              onChange={(e) => setFormState(prev => ({ ...prev, appointmentPlace: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition disabled:bg-slate-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Place</option>
              {formState.appointmentRegion && (APPOINTMENT_LOCATIONS as any)[formState.appointmentRegion].map((p: string) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('donationAppointmentDate')} <span className="text-primary">*</span></label>
            <input
              required
              type="date"
              value={formState.donationAppointmentDate}
              onChange={(e) => setFormState(prev => ({ ...prev, donationAppointmentDate: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Appointment Time <span className="text-primary">*</span></label>
            <input
              required
              type="time"
              value={formState.appointmentTime}
              onChange={(e) => setFormState(prev => ({ ...prev, appointmentTime: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
            />
          </div>

          {/* Medical Section */}
          <div className="md:col-span-2 pt-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Medical & Disability</h3>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('medicalCondition')} <span className="text-primary">*</span></label>
            <select
              required
              value={formState.medicalCondition}
              onChange={(e) => setFormState(prev => ({ ...prev, medicalCondition: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
            >
              <option value="">Select Condition</option>
              {['Normal', 'Teeth Case', 'Back Problems', 'Cancer', 'Cardiovascular Disease', 'Chronic Kidney Disease', 'Mental and Behavioral Conditions', 'Other Health Case'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Has Disabilities? <span className="text-primary">*</span></label>
            <select
              required
              value={formState.hasDisability}
              onChange={(e) => setFormState(prev => ({ ...prev, hasDisability: e.target.value, disabilityType: e.target.value === 'No' ? '' : prev.disabilityType }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {formState.hasDisability === 'Yes' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Disability Type</label>
              <select
                value={formState.disabilityType}
                onChange={(e) => setFormState(prev => ({ ...prev, disabilityType: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
              >
                <option value="">Select Disability</option>
                {['Physical', 'Mobility Issues', 'Blindness', 'Deafness'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {/* Account Info */}
          <div className="md:col-span-2 pt-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Account Information</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('username' as any) || 'Username'} <span className="text-primary">*</span></label>
            <input
              required
              type="text"
              maxLength={20}
              value={formState.username}
              onChange={(e) => setFormState(prev => ({ ...prev, username: e.target.value }))}
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
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('password' as any) || 'Password'} <span className="text-primary">*</span></label>
            <input
              type="text"
              value={formState.password}
              readOnly
              className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-500 cursor-not-allowed"
            />
            <p className="text-[10px] text-primary font-bold mt-1 uppercase">Must change after first login</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password <span className="text-primary">*</span></label>
            <input
              required
              type="text"
              value={formState.confirmPassword}
              readOnly
              className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t border-slate-100 mt-6">
          <button
            type="submit"
            className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition shadow-lg shadow-primary/20"
          >
            {t('addDonorBtn')}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition"
          >
            {t('cancel')}
          </button>
        </div>
      </form >
    </div >
  );
};

export default AddDonorView;

