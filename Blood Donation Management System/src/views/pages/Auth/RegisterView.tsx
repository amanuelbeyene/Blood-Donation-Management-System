import { FormEvent, useState, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { validatePassword } from '../../../utils/validation';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';

import { generateDonorId, generateLotteryId, generateHospitalId } from '../../../utils/idGenerator';
import RegistrationSuccessModal from '../../components/modals/RegistrationSuccessModal';
import DonorRegistrationSuccessModal from '../../components/modals/DonorRegistrationSuccessModal';
import { registerDonor, registerHospital } from '../../../controllers/donorController';

const APPOINTMENT_LOCATIONS = {
  'Addis Ababa': ['Ethio Tebib Hospital', 'Genet Hospital', 'Girum Hospital', 'On Street'],
  'Amhara': ['Felege Hiwot Referral Hospital', 'Debre Markos Referral Hospital', 'Debre Birhan Referral Hospital', 'Kemise General Hospital', 'On Street'],
  'Oromia': ['Alem Gena Hospital', 'Sebeta Hospital', 'Dima Hospital', 'Asko Hospital', 'On Street'],
  'Hawasa': ['Asher Primary Hospital', 'Bete Abraham', 'Kiburu Hospital', 'Yanet Hospital', 'On Street'],
};

const RegisterView = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [role, setRole] = useState<'donor' | 'hospital'>('donor');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hospitalLicenseRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [hospitalLicense, setHospitalLicense] = useState<string | null>(null);
  const [hospitalLicenseName, setHospitalLicenseName] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [successType, setSuccessType] = useState<'donor' | 'hospital'>('donor');
  const [printMode, setPrintMode] = useState<'essential' | 'full'>('essential'); // Added for Hospital Success Modal

  const [donorFormState, setDonorFormState] = useState({
    fullName: '',
    email: '',
    landline: '',
    phone: '',
    bloodType: 'O+',
    birthDate: '',
    donationAppointmentDate: '',
    age: '',
    maritalStatus: '',
    gender: '',
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
    password: '',
    confirmPassword: '',
    fanNumber: '',
    appointmentRegion: '',
    appointmentPlace: '',
    appointmentTime: '',
    hasDisability: '',
    disabilityType: '',
    weight: '',
    idCardFront: null as string | null,
    idCardBack: null as string | null,
  });

  const [hospitalFormState, setHospitalFormState] = useState({
    name: '',
    email: '',
    landline: '',
    phone: '',
    contactDoctorName: '',
    contactDoctorPhone: '',
    region: '',
    city: '',
    subCity: '',
    woreda: '',
    kebele: '',
    street: '',
    businessLicenseName: '',
    businessLicenseNumber: '',
    fanNumber: '',
    hospitalType: 'Government Hospital' as 'Government Hospital' | 'Non-Government Hospital',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handlePrint = (mode: 'essential' | 'full') => {
    if (printMode !== mode) {
      setPrintMode(mode);
    } else {
      setTimeout(() => {
        window.print();
      }, 100);
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

  const [isLocating, setIsLocating] = useState(false);

  const handleGetLocation = (
    setFormState: React.Dispatch<React.SetStateAction<any>>
  ) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse Geocoding via OSM
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const address = data.address || {};

          // Map OSM address fields to form
          setFormState((prev: any) => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            latitude,
            longitude,
            region: address.state || address.region || prev.region,
            city: address.city || address.town || address.county || prev.city,
            subCity: address.suburb || address.district || prev.subCity,
            woreda: address.neighbourhood || prev.woreda,
            kebele: prev.kebele, // OSM rarely has kebele
            street: address.road || prev.street,
            homeNumber: address.house_number || prev.homeNumber
          }));
        } catch (error) {
          console.error("Geocoding failed", error);
          // Fallback to just coords
          setFormState((prev: any) => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            latitude,
            longitude,
          }));
        }

        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Unable to retrieve your location');
        setIsLocating(false);
      }
    );
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

  const handleDonorSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (donorFormState.password !== donorFormState.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    const passwordValidation = validatePassword(donorFormState.password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.message);
      return;
    }

    if (donorFormState.fanNumber.length !== 16) {
      toast.error('FAN Number must be exactly 16 digits.');
      return;
    }

    if (!donorFormState.location || !donorFormState.latitude || !donorFormState.longitude) {
      toast.error('Location (GPS) is required. Please use the "Get Location" button.');
      return;
    }

    if (!donorFormState.medicalCondition) {
      toast.error('Medical Condition is required.');
      return;
    }

    if (!donorFormState.hasDisability) {
      toast.error('Please specify if you have any disabilities.');
      return;
    }

    if (parseInt(donorFormState.age) <= 18) {
      toast.error('Age must be greater than 18.');
      return;
    }

    if (parseInt(donorFormState.weight) <= 45) {
      toast.error('Weight must be greater than 45 kg.');
      return;
    }

    if (donorFormState.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits.');
      return;
    }

    if (!donorFormState.idCardFront) {
      toast.error('Front ID Card image is required.');
      return;
    }

    // Generate IDs
    const donorId = generateDonorId();
    const lotteryId = generateLotteryId();
    const registrationDate = new Date().toISOString().split('T')[0];

    // Prepare success data
    const fullAddress = `${donorFormState.region}, ${donorFormState.city}, ${donorFormState.subCity || ''} ${donorFormState.woreda ? 'Woreda ' + donorFormState.woreda : ''} ${donorFormState.kebele ? 'Kebele ' + donorFormState.kebele : ''}`.replace(/\s+/g, ' ').trim();

    const registrationData = {
      donorId,
      lotteryId,
      fullName: donorFormState.fullName,
      bloodType: donorFormState.bloodType,
      phone: donorFormState.phone,
      email: donorFormState.email,
      address: fullAddress, // This might need to be split if backend expects separate fields, but backend schema has detailed fields.
      // Frontend constructs single address field for success modal, but backend has region, city, etc.
      // We should send the raw form state or map it correctly.
      // Let's send the raw form state fields that match schema + IDs.
      region: donorFormState.region,
      city: donorFormState.city,
      subCity: donorFormState.subCity,
      woreda: donorFormState.woreda,
      kebele: donorFormState.kebele,
      street: donorFormState.street,
      homeNumber: donorFormState.homeNumber,

      medicalCondition: donorFormState.medicalCondition,
      location: donorFormState.location,
      latitude: donorFormState.latitude,
      longitude: donorFormState.longitude,
      registrationDate,
      username: donorFormState.username,
      password: donorFormState.password,
      status: 'Pending',
      gender: donorFormState.gender,
      fanNumber: donorFormState.fanNumber,
      birthDate: donorFormState.birthDate,
      age: donorFormState.age ? parseInt(donorFormState.age) : undefined,
      appointmentRegion: donorFormState.appointmentRegion,
      appointmentPlace: donorFormState.appointmentPlace,
      appointmentTime: donorFormState.appointmentTime,
      donationAppointmentDate: donorFormState.donationAppointmentDate,
      hasDisability: donorFormState.hasDisability,
      disabilityType: donorFormState.disabilityType,
      weight: donorFormState.weight ? parseInt(donorFormState.weight) : undefined,
      idCardFront: donorFormState.idCardFront,
      idCardBack: donorFormState.idCardBack,
      profilePicture: profilePicture,
    };

    // Call API
    try {
      await registerDonor(registrationData);
      setSuccessData(registrationData);
      setSuccessType('donor');
      setShowSuccessModal(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
    }
  };

  const handleHospitalSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (hospitalFormState.password !== hospitalFormState.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    const passwordValidation = validatePassword(hospitalFormState.password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.message);
      return;
    }

    if (hospitalFormState.fanNumber.length !== 16) {
      toast.error('Hospital FAN Number must be exactly 16 digits.');
      return;
    }

    if (!hospitalFormState.location || !hospitalFormState.latitude || !hospitalFormState.longitude) {
      toast.error('Hospital Location (GPS) is required. Please use the "Get Location" button.');
      return;
    }

    if (hospitalFormState.contactDoctorPhone.length !== 10) {
      toast.error('Contact Doctor Phone number must be exactly 10 digits.');
      return;
    }

    if (hospitalFormState.landline && hospitalFormState.landline.length !== 10) {
      toast.error('Hospital Phone (landline) must be exactly 10 digits.');
      return;
    }



    // Generate ID on backend now, but we can generate a temporary one for success modal or wait for backend response
    // const hospitalId = generateHospitalId(); // Deprecated frontend generation
    const registrationDate = new Date().toISOString().split('T')[0];

    // Prepare success data
    const fullAddress = `${hospitalFormState.region}, ${hospitalFormState.city}, ${hospitalFormState.subCity || ''} ${hospitalFormState.woreda ? 'Woreda ' + hospitalFormState.woreda : ''} ${hospitalFormState.kebele ? 'Kebele ' + hospitalFormState.kebele : ''}`.replace(/\s+/g, ' ').trim();

    const registrationData = {
      // hospitalId, // Let backend generate
      hospitalName: hospitalFormState.name, // Mapped to 'name' in backend
      name: hospitalFormState.name,
      hospitalType: hospitalFormState.hospitalType,
      contactDoctorName: hospitalFormState.contactDoctorName,
      contactDoctorPhone: hospitalFormState.contactDoctorPhone,
      fanNumber: hospitalFormState.fanNumber,
      licenseNumber: hospitalFormState.businessLicenseNumber,
      licenseName: hospitalFormState.businessLicenseName,
      phone: hospitalFormState.contactDoctorPhone, // Map Contact Doctor Phone to required Phone field
      landline: hospitalFormState.landline,
      email: hospitalFormState.email,
      address: fullAddress, // For display
      // detailed location
      region: hospitalFormState.region,
      city: hospitalFormState.city,
      subCity: hospitalFormState.subCity,
      woreda: hospitalFormState.woreda,
      kebele: hospitalFormState.kebele,
      street: hospitalFormState.street,
      location: hospitalFormState.location,
      latitude: hospitalFormState.latitude,
      longitude: hospitalFormState.longitude,
      registrationDate,
      username: hospitalFormState.username,
      password: hospitalFormState.password,
      status: 'Pending',
      profilePicture: profilePicture || undefined,
      businessLicenseImage: hospitalLicense || undefined
    };

    try {
      const response = await registerHospital(registrationData as any);
      setSuccessData({
        ...registrationData,
        hospitalId: (response as any).id || 'PENDING'
      });
      setSuccessType('hospital');
      setShowSuccessModal(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-[#fff5f8] px-4 py-8">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-10 shadow-card">
        <div className="mx-auto h-20 w-20 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm border border-slate-100 mb-6">
          <img src="/logo.png" alt="BDMS Logo" className="h-full w-full object-cover" />
        </div>
        <h1 className="text-3xl font-semibold text-slate-900">{t('createProfile')}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {t('registerDescription')}
        </p>

        {/* Role Selection */}
        <div className="mt-6 flex gap-4 justify-center">
          <button
            type="button"
            onClick={() => setRole('donor')}
            className={`rounded-full px-8 py-3 text-sm font-bold transition-all duration-200 ${role === 'donor'
              ? 'bg-[#E60000] text-white shadow-md'
              : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
          >
            Donor Registration Form
          </button>
          <button
            type="button"
            onClick={() => setRole('hospital')}
            className={`rounded-full px-8 py-3 text-sm font-bold transition-all duration-200 ${role === 'hospital'
              ? 'bg-[#E60000] text-white shadow-md'
              : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
          >
            Hospital Registration Form
          </button>
        </div>

        {/* Donor Registration Form */}
        {role === 'donor' && (
          <form className="mt-8 space-y-6" onSubmit={handleDonorSubmit}>
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="h-32 w-32 rounded-full object-cover border-4 border-primary"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-slate-200 flex items-center justify-center border-4 border-slate-300">
                    <svg className="h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 hover:bg-primary-dark transition"
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
              <p className="mt-2 text-sm text-slate-500">{t('uploadProfilePicture')}</p>
            </div>



            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">
                  {t('fullName')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  maxLength={35}
                  value={donorFormState.fullName}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, fullName: e.target.value }))}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 focus:outline-none transition ${donorFormState.fullName.length === 35
                    ? 'border-red-500 focus:border-red-500 bg-red-50'
                    : 'border-slate-200 focus:border-primary'
                    }`}
                  placeholder={t('enterFullName')}
                />
                {donorFormState.fullName.length === 35 && (
                  <p className="text-red-500 text-xs mt-1">Max length reached (35 characters).</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('emailAddress')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="email"
                  value={donorFormState.email}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, email: e.target.value }))}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 focus:outline-none transition ${donorFormState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorFormState.email)
                    ? 'border-red-500 focus:border-red-500 bg-red-50'
                    : 'border-slate-200 focus:border-primary'
                    }`}
                  placeholder={t('enterEmail')}
                />
                {donorFormState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorFormState.email) && (
                  <p className="text-red-500 text-xs mt-1">Example: amanuelbeyenee@gmail.com</p>
                )}
              </div>



              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('phoneNumber')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="tel"
                  maxLength={10}
                  value={donorFormState.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setDonorFormState((prev) => ({ ...prev, phone: val }));
                  }}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 focus:outline-none transition ${donorFormState.phone && donorFormState.phone.length !== 10
                    ? 'border-red-500 focus:border-red-500 bg-red-50'
                    : 'border-slate-200 focus:border-primary'
                    }`}
                  placeholder="+251 911 / 0911"
                />
                {donorFormState.phone && donorFormState.phone.length !== 10 && (
                  <p className="text-red-500 text-xs mt-1">Must be exactly 10 digits.</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('bloodType')} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={donorFormState.bloodType}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, bloodType: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                  <option value="unknown">{t('bloodTypeUnknown')}</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('birthDate')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={donorFormState.birthDate}
                  onChange={(e) => {
                    const birthDate = e.target.value;
                    setDonorFormState((prev) => ({
                      ...prev,
                      birthDate,
                      age: calculateAge(birthDate),
                    }));
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterBirthDate')}
                />
              </div>

              <div className="md:col-span-1">
                <label className="text-sm font-medium text-slate-600">
                  {t('age')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  value={donorFormState.age}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, age: e.target.value }))}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 focus:outline-none ${parseInt(donorFormState.age) <= 18
                    ? 'border-red-500 focus:border-red-500 bg-red-50'
                    : 'border-slate-200 focus:border-primary'
                    }`}
                  placeholder={t('enterAge')}
                />
                {donorFormState.age && parseInt(donorFormState.age) <= 18 && (
                  <p className="text-red-500 text-xs mt-1">Age must be over 18</p>
                )}
              </div>

              <div className="md:col-span-1">
                <label className="text-sm font-medium text-slate-600">
                  Weight (Kg) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  value={donorFormState.weight}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, weight: e.target.value }))}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 focus:outline-none ${parseInt(donorFormState.weight) <= 45
                    ? 'border-red-500 focus:border-red-500 bg-red-50'
                    : 'border-slate-200 focus:border-primary'
                    }`}
                  placeholder="Enter Weight"
                />
                {donorFormState.weight && parseInt(donorFormState.weight) <= 45 && (
                  <p className="text-red-500 text-xs mt-1">Weight Must be over 45</p>
                )}
              </div>

              <div className="md:col-span-1">
                <label className="text-sm font-medium text-slate-600">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={donorFormState.gender}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, gender: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="text-sm font-medium text-slate-600">
                  Marital Status <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={donorFormState.maritalStatus}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, maritalStatus: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">
                  FAN Number <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  maxLength={16}
                  value={donorFormState.fanNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); // Allow only digits
                    setDonorFormState((prev) => ({ ...prev, fanNumber: val }));
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder="Enter 16-digit FAN Number"
                />
                {donorFormState.fanNumber && donorFormState.fanNumber.length !== 16 && (
                  <p className="text-red-500 text-xs mt-1">FAN Number must be exactly 16 digits.</p>
                )}
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 pb-4 border-t border-b border-slate-100">
                {/* Front ID Upload */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-600 mb-2">Front ID <span className="text-red-500">*</span></label>
                  <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 hover:bg-slate-50 transition cursor-pointer flex flex-col items-center justify-center min-h-[150px]"
                    onClick={() => document.getElementById('donorFrontIdInput')?.click()}
                  >
                    {donorFormState.idCardFront ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                        <img src={donorFormState.idCardFront} alt="Front ID" className="h-32 object-contain rounded-md" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDonorFormState((prev) => ({ ...prev, idCardFront: null }));
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
                      id="donorFrontIdInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setDonorFormState(prev => ({ ...prev, idCardFront: reader.result as string }));
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Back ID Upload */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-600 mb-2">Back ID</label>
                  <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 hover:bg-slate-50 transition cursor-pointer flex flex-col items-center justify-center min-h-[150px]"
                    onClick={() => document.getElementById('donorBackIdInput')?.click()}
                  >
                    {donorFormState.idCardBack ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                        <img src={donorFormState.idCardBack} alt="Back ID" className="h-32 object-contain rounded-md" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDonorFormState((prev) => ({ ...prev, idCardBack: null }));
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
                      id="donorBackIdInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setDonorFormState(prev => ({ ...prev, idCardBack: reader.result as string }));
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('address')}</h3>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">
                  Location (GPS) <span className="text-red-500">*</span>
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    required
                    type="text"
                    value={donorFormState.location}
                    onChange={(e) => setDonorFormState((prev) => ({ ...prev, location: e.target.value }))}
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                    placeholder="Enter location or use button"
                  />
                  <button
                    type="button"
                    onClick={() => handleGetLocation(setDonorFormState)}
                    disabled={isLocating}
                    style={{ minWidth: '160px' }}
                    className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-700 font-medium hover:bg-slate-200 transition flex items-center justify-center gap-2"
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
                <label className="text-sm font-medium text-slate-600">
                  {t('region')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={donorFormState.region}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, region: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterRegion')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('city')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={donorFormState.city}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, city: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterCity')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('subCity')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={donorFormState.subCity}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, subCity: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterSubCity')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('woreda')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={donorFormState.woreda}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, woreda: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterWoreda')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('kebele')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={donorFormState.kebele}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, kebele: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterKebele')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">{t('street')}</label>
                <input
                  type="text"
                  value={donorFormState.street}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, street: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterStreet')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">{t('homeNumber')}</label>
                <input
                  type="text"
                  value={donorFormState.homeNumber}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, homeNumber: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterHomeNumber')}
                />
              </div>

              {/* Appointment Section */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Donation Appointment</h3>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Appointment Region <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={donorFormState.appointmentRegion}
                  onChange={(e) => {
                    const region = e.target.value;
                    setDonorFormState((prev) => ({
                      ...prev,
                      appointmentRegion: region,
                      appointmentPlace: '', // Reset place when region changes
                    }));
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                >
                  <option value="">Select Region</option>
                  {Object.keys(APPOINTMENT_LOCATIONS).map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Appointment Place <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={donorFormState.appointmentPlace}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, appointmentPlace: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  disabled={!donorFormState.appointmentRegion}
                >
                  <option value="">Select Hospital/Place</option>
                  {donorFormState.appointmentRegion && APPOINTMENT_LOCATIONS[donorFormState.appointmentRegion as keyof typeof APPOINTMENT_LOCATIONS]?.map((place) => (
                    <option key={place} value={place}>{place}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('donationAppointmentDate')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={donorFormState.donationAppointmentDate}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, donationAppointmentDate: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Appointment Time <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="time"
                  value={donorFormState.appointmentTime}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, appointmentTime: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">
                  {t('medicalCondition')} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={donorFormState.medicalCondition}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, medicalCondition: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                >
                  <option value="">Select Condition</option>
                  <option value="Normal">Normal</option>
                  <option value="Teeth Case">Teeth Case</option>
                  <option value="Back Problems">Back Problems</option>
                  <option value="Cancer">Cancer</option>
                  <option value="Cardiovascular Disease">Cardiovascular Disease</option>
                  <option value="Chronic Kidney Disease">Chronic Kidney Disease</option>
                  <option value="Mental and Behavioral Conditions">Mental and Behavioral Conditions</option>
                  <option value="other Health Case">Other Health Case</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">
                  Has Disabilities? <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={donorFormState.hasDisability}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDonorFormState((prev) => ({
                      ...prev,
                      hasDisability: val,
                      disabilityType: val === 'No' ? '' : prev.disabilityType
                    }));
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {donorFormState.hasDisability === 'Yes' && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-600">Disabilities List</label>
                  <select
                    value={donorFormState.disabilityType}
                    onChange={(e) => setDonorFormState((prev) => ({ ...prev, disabilityType: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  >
                    <option value="">Select Disability</option>
                    <option value="Physical">Physical</option>
                    <option value="Mobility Issues">Mobility Issues</option>
                    <option value="Blindness">Blindness</option>
                    <option value="Deafness">Deafness</option>
                  </select>
                </div>
              )}

            </div>

            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('createUsernamePassword' as any) || 'Create your Username and Password'}</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('username' as any) || 'Username'} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  maxLength={20}
                  value={donorFormState.username}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, username: e.target.value }))}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 focus:outline-none transition ${donorFormState.username && !/^[a-zA-Z0-9]+$/.test(donorFormState.username)
                    ? 'border-red-500 focus:border-red-500 bg-red-50'
                    : 'border-slate-200 focus:border-primary'
                    }`}
                  placeholder={t('enterUsername' as any) || 'Enter Username'}
                />
                {donorFormState.username && !/^[a-zA-Z0-9]+$/.test(donorFormState.username) && (
                  <p className="text-red-500 text-xs mt-1">Username must be alphanumeric (text and numbers only).</p>
                )}
                <p className="text-slate-500 text-xs mt-1">Example: amanuel / amanuel369</p>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="text-sm font-medium text-slate-600">
                    {t('password' as any) || 'Password'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={donorFormState.password}
                      onChange={(e) => setDonorFormState((prev) => ({ ...prev, password: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none pr-10"
                      placeholder={t('enterPassword' as any) || 'Enter Password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[22px] text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <label className="text-sm font-medium text-slate-600">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={donorFormState.confirmPassword}
                      onChange={(e) => setDonorFormState((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none pr-10"
                      placeholder="Confirm Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-[22px] text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark transition"
            >
              {t('completeRegistration')}
            </button>
          </form>
        )}

        {/* Hospital Registration Form */}
        {role === 'hospital' && (
          <form className="mt-8 space-y-6" onSubmit={handleHospitalSubmit}>
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="h-32 w-32 rounded-full object-cover border-4 border-primary"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-slate-200 flex items-center justify-center border-4 border-slate-300">
                    <svg className="h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 hover:bg-primary-dark transition"
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
              <p className="mt-2 text-sm text-slate-500">{t('uploadProfilePicture')}</p>
            </div>



            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">
                  {t('hospitalName')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  maxLength={35}
                  value={hospitalFormState.name}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, name: e.target.value }))}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 focus:outline-none transition ${hospitalFormState.name.length === 35
                    ? 'border-red-500 focus:border-red-500 bg-red-50'
                    : 'border-slate-200 focus:border-primary'
                    }`}
                  placeholder={t('enterHospitalName')}
                />
                {hospitalFormState.name.length === 35 && (
                  <p className="text-red-500 text-xs mt-1">Max length reached (35 characters).</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('emailAddress')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="email"
                  value={hospitalFormState.email}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, email: e.target.value }))}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 focus:outline-none transition ${hospitalFormState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hospitalFormState.email)
                    ? 'border-red-500 focus:border-red-500 bg-red-50'
                    : 'border-slate-200 focus:border-primary'
                    }`}
                  placeholder={t('enterEmail')}
                />
                {hospitalFormState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hospitalFormState.email) && (
                  <p className="text-red-500 text-xs mt-1">Example: amanuelbeyenee@gmail.com</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Hospital Phone (landline) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="tel"
                  maxLength={10}
                  value={hospitalFormState.landline || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setHospitalFormState((prev) => ({ ...prev, landline: val }));
                  }}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 focus:outline-none transition ${hospitalFormState.landline && hospitalFormState.landline.length !== 10
                    ? 'border-red-500 focus:border-red-500 bg-red-50'
                    : 'border-slate-200 focus:border-primary'
                    }`}
                  placeholder="011..."
                />
                {hospitalFormState.landline && hospitalFormState.landline.length !== 10 && (
                  <p className="text-red-500 text-xs mt-1">Must be exactly 10 digits. Example 011 4141764</p>
                )}
              </div>



              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">
                  {t('contactDoctorName')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  maxLength={35}
                  value={hospitalFormState.contactDoctorName}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, contactDoctorName: e.target.value }))}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 focus:outline-none transition ${hospitalFormState.contactDoctorName.length === 35
                    ? 'border-red-500 focus:border-red-500 bg-red-50'
                    : 'border-slate-200 focus:border-primary'
                    }`}
                  placeholder={t('enterContactDoctorName')}
                />
                {hospitalFormState.contactDoctorName.length === 35 && (
                  <p className="text-red-500 text-xs mt-1">Max length reached (35 characters).</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">
                  {t('contactDoctorPhone')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="tel"
                  maxLength={10}
                  value={hospitalFormState.contactDoctorPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setHospitalFormState((prev) => ({ ...prev, contactDoctorPhone: val }));
                  }}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 focus:outline-none transition ${hospitalFormState.contactDoctorPhone && hospitalFormState.contactDoctorPhone.length !== 10
                    ? 'border-red-500 focus:border-red-500 bg-red-50'
                    : 'border-slate-200 focus:border-primary'
                    }`}
                  placeholder="+251 911 / 0911"
                />
                {hospitalFormState.contactDoctorPhone && hospitalFormState.contactDoctorPhone.length !== 10 && (
                  <p className="text-red-500 text-xs mt-1">Must be exactly 10 digits.</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">
                  Contact Doctor FAN Number <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  maxLength={16}
                  value={hospitalFormState.fanNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); // Allow only digits
                    setHospitalFormState((prev) => ({ ...prev, fanNumber: val }));
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder="Enter 16-digit FAN Number"
                />
                {hospitalFormState.fanNumber && hospitalFormState.fanNumber.length !== 16 && (
                  <p className="text-red-500 text-xs mt-1">FAN Number must be exactly 16 digits.</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">
                  {t('hospitalType')} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={hospitalFormState.hospitalType}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, hospitalType: e.target.value as 'Government Hospital' | 'Non-Government Hospital' }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                >
                  <option value="Government Hospital">{t('governmentHospital')}</option>
                  <option value="Non-Government Hospital">{t('nonGovernmentHospital')}</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('address')}</h3>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">
                  Location (GPS) <span className="text-red-500">*</span>
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    required
                    type="text"
                    value={hospitalFormState.location}
                    onChange={(e) => setHospitalFormState((prev) => ({ ...prev, location: e.target.value }))}
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                    placeholder="Enter location or use button"
                  />
                  <button
                    type="button"
                    onClick={() => handleGetLocation(setHospitalFormState)}
                    disabled={isLocating}
                    style={{ minWidth: '160px' }}
                    className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-700 font-medium hover:bg-slate-200 transition flex items-center justify-center gap-2"
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
                <label className="text-sm font-medium text-slate-600">
                  {t('region')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={hospitalFormState.region}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, region: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterRegion')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('city')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={hospitalFormState.city}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, city: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterCity')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('subCity')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={hospitalFormState.subCity}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, subCity: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterSubCity')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('woreda')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={hospitalFormState.woreda}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, woreda: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterWoreda')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('kebele')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={hospitalFormState.kebele}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, kebele: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterKebele')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">{t('street')}</label>
                <input
                  type="text"
                  value={hospitalFormState.street}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, street: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterStreet')}
                />
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('businessLicense')}</h3>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('businessLicenseName')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={hospitalFormState.businessLicenseName}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, businessLicenseName: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterBusinessLicenseName')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('businessLicenseNumber')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={hospitalFormState.businessLicenseNumber}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, businessLicenseNumber: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterBusinessLicenseNumber')}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">{t('uploadHospitalLicense')}</label>
                <div
                  onClick={() => hospitalLicenseRef.current?.click()}
                  className="mt-2 w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition group"
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
              <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('createUsernamePassword' as any) || 'Create your Username and Password'}</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('username' as any) || 'Username'} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  maxLength={20}
                  value={hospitalFormState.username}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, username: e.target.value }))}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 focus:outline-none transition ${hospitalFormState.username && !/^[a-zA-Z0-9]+$/.test(hospitalFormState.username)
                    ? 'border-red-500 focus:border-red-500 bg-red-50'
                    : 'border-slate-200 focus:border-primary'
                    }`}
                  placeholder={t('enterUsername' as any) || 'Enter Username'}
                />
                {hospitalFormState.username && !/^[a-zA-Z0-9]+$/.test(hospitalFormState.username) && (
                  <p className="text-red-500 text-xs mt-1">Username must be alphanumeric (text and numbers only).</p>
                )}
                <p className="text-slate-500 text-xs mt-1">Example: amanuel / amanuel369</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('password' as any) || 'Password'} <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={hospitalFormState.password}
                    onChange={(e) => setHospitalFormState((prev) => ({ ...prev, password: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none pr-10"
                    placeholder={t('enterPassword' as any) || 'Enter Password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[22px] text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={hospitalFormState.confirmPassword}
                    onChange={(e) => setHospitalFormState((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 pr-10"
                    placeholder="Confirm Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark transition"
            >
              {t('completeRegistration')}
            </button>
          </form>
        )
        }

        <p className="mt-6 text-center text-sm text-slate-500">
          {t('alreadyHaveAccount')}{' '}
          <NavLink to="/login" className="font-semibold text-primary">
            {t('login')}
          </NavLink>
        </p>
      </div >

      {/* Success Modal */}
      {showSuccessModal && successData && (
        successType === 'donor' ? (
          <DonorRegistrationSuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            data={successData}
          />
        ) : (
          // Custom Hospital Success Modal (Ported from AddHospitalView)
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:absolute print:inset-0 print:p-0 print:overflow-visible print:max-h-none">
              <button
                onClick={() => setShowSuccessModal(false)}
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
                    {/* QR Code */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({
                        id: successData.hospitalId,
                        username: successData.username,
                        name: successData.hospitalName,
                        role: 'Hospital'
                      }))}`}
                      alt="QR Code"
                      className="h-24 w-24"
                    />
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
                      <span className="font-mono font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-200">{successData.password || '********'}</span>
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
        )
      )}
    </div >
  );
};

export default RegisterView;
