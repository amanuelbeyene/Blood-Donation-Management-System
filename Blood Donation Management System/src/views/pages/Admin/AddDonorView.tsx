import { FormEvent, useState, useRef } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

import { generateDonorId, generateLotteryId } from '../../../utils/idGenerator';
import RegistrationSuccessModal from '../../components/modals/RegistrationSuccessModal';
import { registerDonor } from '../../../controllers/donorController';

const APPOINTMENT_LOCATIONS = {
  'Addis Ababa': ['Ethio Tebib Hospital', 'Genet Hospital', 'Girum Hospital', 'On Street'],
  'Amhara': ['Felege Hiwot Referral Hospital', 'Debre Markos Referral Hospital', 'Debre Birhan Referral Hospital', 'Kemise General Hospital', 'On Street'],
  'Oromia': ['Alem Gena Hospital', 'Sebeta Hospital', 'Dima Hospital', 'Asko Hospital', 'On Street'],
  'Hawasa': ['Asher Primary Hospital', 'Bete Abraham', 'Kiburu Hospital', 'Yanet Hospital', 'On Street'],
};

const AddDonorView = () => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const [formState, setFormState] = useState({
    fullName: '',
    bloodType: '',
    birthDate: '',
    donationAppointmentDate: '',
    age: '',
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
    medicalCondition: '', // Renamed from disease for consistency
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
  });

  const [isLocating, setIsLocating] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormState((prev) => ({
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (formState.password !== formState.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      // Call API to register donor
      const newDonor = await registerDonor({
        fullName: formState.fullName,
        bloodType: formState.bloodType,
        birthDate: formState.birthDate,
        age: parseInt(formState.age),
        gender: formState.gender,
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
        profilePicture: profilePicture, // Send the base64 string
      });

      // Prepare success data from response
      const loc = newDonor.locationDetails || {};
      const fullAddress = `${loc.region || ''}, ${loc.city || ''}, ${loc.subCity || ''}`.replace(/^, /, '').trim();

      setSuccessData({
        donorId: newDonor.id,
        lotteryId: newDonor.lotteryId || 'PENDING',
        fullName: newDonor.fullName,
        bloodType: newDonor.bloodType,
        phone: newDonor.phone,
        email: newDonor.email,
        address: fullAddress,
        medicalCondition: newDonor.medicalCondition,
        location: newDonor.location,
        registrationDate: new Date().toISOString().split('T')[0],
      });

      setShowSuccessModal(true);

    } catch (error: any) {
      console.error("Registration failed:", error);
      alert(error.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('addDonor')}</h2>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Donor Profile"
                  className="h-32 w-32 rounded-full object-cover border-4 border-red-600"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                  <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('fullName')} <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={formState.fullName}
                onChange={(e) => setFormState((prev) => ({ ...prev, fullName: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterFullName')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('bloodType')} <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formState.bloodType}
                onChange={(e) => setFormState((prev) => ({ ...prev, bloodType: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="">{t('selectBloodType')}</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
                <option value="unknown">{t('bloodTypeUnknown')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('birthDate')} <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="date"
                value={formState.birthDate}
                onChange={(e) => {
                  const birthDate = e.target.value;
                  setFormState((prev) => ({
                    ...prev,
                    birthDate,
                    age: calculateAge(birthDate),
                  }));
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterBirthDate')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('age')} <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                value={formState.age}
                onChange={(e) => setFormState((prev) => ({ ...prev, age: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterAge')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marital Status <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formState.maritalStatus}
                onChange={(e) => setFormState((prev) => ({ ...prev, maritalStatus: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formState.gender}
                onChange={(e) => setFormState((prev) => ({ ...prev, gender: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                FAN Number <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                maxLength={16}
                value={formState.fanNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ''); // Allow only digits
                  setFormState((prev) => ({ ...prev, fanNumber: val }));
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder="Enter 16-digit FAN Number"
              />
              {formState.fanNumber && formState.fanNumber.length !== 16 && (
                <p className="text-red-500 text-xs mt-1">FAN Number must be exactly 16 digits.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('phoneNumber')} <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="tel"
                value={formState.phone}
                onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterPhoneNumber')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('emailAddress')}</label>
              <input
                type="email"
                value={formState.email}
                onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterEmail')}
              />
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('address')}</h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (GPS)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formState.location}
                  onChange={(e) => setFormState((prev) => ({ ...prev, location: e.target.value }))}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="Enter location or use button"
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2"
                >
                  {isLocating ? (
                    <span className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('region')} <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={formState.region}
                onChange={(e) => setFormState((prev) => ({ ...prev, region: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterRegion')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('city')} <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={formState.city}
                onChange={(e) => setFormState((prev) => ({ ...prev, city: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterCity')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('subCity')}</label>
              <input
                type="text"
                value={formState.subCity}
                onChange={(e) => setFormState((prev) => ({ ...prev, subCity: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterSubCity')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('woreda')}</label>
              <input
                type="text"
                value={formState.woreda}
                onChange={(e) => setFormState((prev) => ({ ...prev, woreda: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterWoreda')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('kebele')}</label>
              <input
                type="text"
                value={formState.kebele}
                onChange={(e) => setFormState((prev) => ({ ...prev, kebele: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterKebele')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('street')}</label>
              <input
                type="text"
                value={formState.street}
                onChange={(e) => setFormState((prev) => ({ ...prev, street: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterStreet')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('homeNumber')}</label>
              <input
                type="text"
                value={formState.homeNumber}
                onChange={(e) => setFormState((prev) => ({ ...prev, homeNumber: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterHomeNumber')}
              />
            </div>

            {/* Appointment Section */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Appointment</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Region <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formState.appointmentRegion}
                onChange={(e) => {
                  const region = e.target.value;
                  setFormState((prev) => ({
                    ...prev,
                    appointmentRegion: region,
                    appointmentPlace: '',
                  }));
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="">Select Region</option>
                {Object.keys(APPOINTMENT_LOCATIONS).map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Place <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formState.appointmentPlace}
                onChange={(e) => setFormState((prev) => ({ ...prev, appointmentPlace: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                disabled={!formState.appointmentRegion}
              >
                <option value="">Select Hospital/Place</option>
                {formState.appointmentRegion && APPOINTMENT_LOCATIONS[formState.appointmentRegion as keyof typeof APPOINTMENT_LOCATIONS]?.map((place) => (
                  <option key={place} value={place}>{place}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Time <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="time"
                value={formState.appointmentTime}
                onChange={(e) => setFormState((prev) => ({ ...prev, appointmentTime: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('donationAppointmentDate')} <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="date"
                value={formState.donationAppointmentDate}
                onChange={(e) => setFormState((prev) => ({ ...prev, donationAppointmentDate: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterAppointmentDate')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('medicalCondition')}</label>
              <select
                value={formState.medicalCondition}
                onChange={(e) => setFormState((prev) => ({ ...prev, medicalCondition: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Has Disabilities?</label>
              <select
                value={formState.hasDisability}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormState((prev) => ({
                    ...prev,
                    hasDisability: val,
                    disabilityType: val === 'No' ? '' : prev.disabilityType
                  }));
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {formState.hasDisability === 'Yes' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Disabilities List</label>
                <select
                  value={formState.disabilityType}
                  onChange={(e) => setFormState((prev) => ({ ...prev, disabilityType: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('createUsernamePassword' as any) || 'Create your Username and Password'}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('username' as any) || 'Username'} <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={formState.username}
                onChange={(e) => setFormState((prev) => ({ ...prev, username: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterUsername' as any) || 'Enter Username'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('password' as any) || 'Password'} <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="password"
                value={formState.password}
                onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterPassword' as any) || 'Enter Password'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="password"
                value={formState.confirmPassword}
                onChange={(e) => setFormState((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder="Confirm Password"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              {t('addDonorBtn')}
            </button>
            <button
              type="button"
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {successData && (
        <RegistrationSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          type="donor"
          data={successData}
        />
      )}
    </div>
  );
};

export default AddDonorView;

