import { FormEvent, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';

import { generateDonorId, generateLotteryId, generateHospitalId } from '../../../utils/idGenerator';
import RegistrationSuccessModal from '../../components/modals/RegistrationSuccessModal';

const RegisterView = () => {
  const { t } = useLanguage();
  const [role, setRole] = useState<'donor' | 'hospital'>('donor');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hospitalLicenseRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [hospitalLicense, setHospitalLicense] = useState<string | null>(null);
  const [hospitalLicenseName, setHospitalLicenseName] = useState<string | null>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [successType, setSuccessType] = useState<'donor' | 'hospital'>('donor');

  const [donorFormState, setDonorFormState] = useState({
    fullName: '',
    email: '',
    phone: '',
    bloodType: 'O+',
    birthDate: '',
    donationAppointmentDate: '',
    age: '',
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
  });

  const [hospitalFormState, setHospitalFormState] = useState({
    name: '',
    email: '',
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
    hospitalType: 'Government Hospital' as 'Government Hospital' | 'Non-Government Hospital',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });

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
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormState((prev: any) => ({
          ...prev,
          location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          latitude,
          longitude,
        }));
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location');
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

  const handleDonorSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Generate IDs
    const donorId = generateDonorId();
    const lotteryId = generateLotteryId();
    const registrationDate = new Date().toISOString().split('T')[0];

    // Prepare success data
    const fullAddress = `${donorFormState.region}, ${donorFormState.city}, ${donorFormState.subCity || ''} ${donorFormState.woreda ? 'Woreda ' + donorFormState.woreda : ''} ${donorFormState.kebele ? 'Kebele ' + donorFormState.kebele : ''}`.replace(/\s+/g, ' ').trim();

    setSuccessData({
      donorId,
      lotteryId,
      fullName: donorFormState.fullName,
      bloodType: donorFormState.bloodType,
      phone: donorFormState.phone,
      email: donorFormState.email,
      address: fullAddress,
      medicalCondition: donorFormState.medicalCondition,
      location: donorFormState.location,
      latitude: donorFormState.latitude,
      longitude: donorFormState.longitude,
      registrationDate,
    });

    setSuccessType('donor');
    setShowSuccessModal(true);
  };

  const handleHospitalSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Generate ID
    const hospitalId = generateHospitalId();
    const registrationDate = new Date().toISOString().split('T')[0];

    // Prepare success data
    const fullAddress = `${hospitalFormState.region}, ${hospitalFormState.city}, ${hospitalFormState.subCity || ''} ${hospitalFormState.woreda ? 'Woreda ' + hospitalFormState.woreda : ''} ${hospitalFormState.kebele ? 'Kebele ' + hospitalFormState.kebele : ''}`.replace(/\s+/g, ' ').trim();

    setSuccessData({
      hospitalId,
      hospitalName: hospitalFormState.name,
      hospitalType: hospitalFormState.hospitalType,
      contactDoctorName: hospitalFormState.contactDoctorName,
      licenseNumber: hospitalFormState.businessLicenseNumber,
      phone: hospitalFormState.phone,
      email: hospitalFormState.email,
      address: fullAddress,
      location: hospitalFormState.location,
      latitude: hospitalFormState.latitude,
      longitude: hospitalFormState.longitude,
      registrationDate,
    });

    setSuccessType('hospital');
    setShowSuccessModal(true);
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-[#fff5f8] px-4 py-8">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-10 shadow-card">
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
                  value={donorFormState.fullName}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterFullName')}
                />
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
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterEmail')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('phoneNumber')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="tel"
                  value={donorFormState.phone}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, phone: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterPhoneNumber')}
                />
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

              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('age')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  value={donorFormState.age}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, age: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterAge')}
                />
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('address')}</h3>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">
                  Location (GPS)
                </label>
                <div className="mt-2 flex gap-2">
                  <input
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
                <label className="text-sm font-medium text-slate-600">{t('subCity')}</label>
                <input
                  type="text"
                  value={donorFormState.subCity}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, subCity: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterSubCity')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">{t('woreda')}</label>
                <input
                  type="text"
                  value={donorFormState.woreda}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, woreda: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterWoreda')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">{t('kebele')}</label>
                <input
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
                  placeholder={t('enterAppointmentDate')}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">{t('medicalCondition')}</label>
                <input
                  type="text"
                  value={donorFormState.medicalCondition}
                  onChange={(e) => setDonorFormState((prev) => ({ ...prev, medicalCondition: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterMedicalConditions')}
                />
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
                  value={hospitalFormState.name}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterHospitalName')}
                />
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
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterEmail')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  {t('hospitalPhoneNumber')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="tel"
                  value={hospitalFormState.phone}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, phone: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterHospitalPhone')}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">{t('contactDoctorName')}</label>
                <input
                  type="text"
                  value={hospitalFormState.contactDoctorName}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, contactDoctorName: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterContactDoctorName')}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">{t('contactDoctorPhone')}</label>
                <input
                  type="tel"
                  value={hospitalFormState.contactDoctorPhone}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, contactDoctorPhone: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterContactDoctorPhone')}
                />
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
                  Location (GPS)
                </label>
                <div className="mt-2 flex gap-2">
                  <input
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
                <label className="text-sm font-medium text-slate-600">{t('subCity')}</label>
                <input
                  type="text"
                  value={hospitalFormState.subCity}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, subCity: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterSubCity')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">{t('woreda')}</label>
                <input
                  type="text"
                  value={hospitalFormState.woreda}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, woreda: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterWoreda')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">{t('kebele')}</label>
                <input
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
                <div className="mt-2 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => hospitalLicenseRef.current?.click()}
                    className="rounded-2xl bg-primary px-4 py-2 text-white text-sm font-semibold hover:bg-primary-dark transition"
                  >
                    {t('uploadHospitalLicense')}
                  </button>
                  {hospitalLicenseName && (
                    <span className="text-xs text-slate-600 max-w-xs truncate">{hospitalLicenseName}</span>
                  )}
                  <input
                    ref={hospitalLicenseRef}
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleHospitalLicenseChange}
                    className="hidden"
                  />
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

        <p className="mt-6 text-center text-sm text-slate-500">
          {t('alreadyHaveAccount')}{' '}
          <NavLink to="/login" className="font-semibold text-primary">
            {t('login')}
          </NavLink>
        </p>
      </div>

      {/* Success Modal */}
      {successData && (
        <RegistrationSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          type={successType}
          data={successData}
        />
      )}
    </div>
  );
};

export default RegisterView;
