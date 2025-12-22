import { FormEvent, useState, useRef } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { generateHospitalId } from '../../../utils/idGenerator';
import RegistrationSuccessModal from '../../components/modals/RegistrationSuccessModal';

const AddHospitalView = () => {

  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hospitalLicenseRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [hospitalLicense, setHospitalLicense] = useState<string | null>(null);
  const [hospitalLicenseName, setHospitalLicenseName] = useState<string | null>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    email: '',
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
    username: '',
    password: '',
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Generate ID
    const hospitalId = generateHospitalId();
    const registrationDate = new Date().toISOString().split('T')[0];

    // Prepare success data
    const fullAddress = `${formState.region}, ${formState.city}, ${formState.subCity || ''} ${formState.woreda ? 'Woreda ' + formState.woreda : ''} ${formState.kebele ? 'Kebele ' + formState.kebele : ''}`.replace(/\s+/g, ' ').trim();

    setSuccessData({
      hospitalId,
      hospitalName: formState.name,
      hospitalType: formState.hospitalType,
      contactDoctorName: formState.contactDoctorName,
      licenseNumber: formState.businessLicenseNumber,
      phone: formState.phone,
      email: formState.email,
      address: fullAddress,
      location: formState.location,
      latitude: formState.latitude,
      longitude: formState.longitude,
      registrationDate,
      username: formState.username,
      password: formState.password,
      status: 'Active',
    });

    setShowSuccessModal(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('addHospital')}</h2>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('hospitalName')} <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={formState.name}
                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterHospitalName')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('hospitalPhoneNumber')} <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="tel"
                value={formState.phone}
                onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterHospitalPhone')}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('contactDoctorName')}</label>
              <input
                type="text"
                value={formState.contactDoctorName}
                onChange={(e) => setFormState((prev) => ({ ...prev, contactDoctorName: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterContactDoctorName')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('contactDoctorPhone')}</label>
              <input
                type="tel"
                value={formState.contactDoctorPhone}
                onChange={(e) => setFormState((prev) => ({ ...prev, contactDoctorPhone: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterContactDoctorPhone')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('hospitalType')} <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formState.hospitalType}
                onChange={(e) => setFormState((prev) => ({ ...prev, hospitalType: e.target.value as 'Government Hospital' | 'Non-Government Hospital' }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="Government Hospital">{t('governmentHospital')}</option>
                <option value="Non-Government Hospital">{t('nonGovernmentHospital')}</option>
              </select>
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

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('businessLicense')}</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('businessLicenseName')} <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={formState.businessLicenseName}
                onChange={(e) => setFormState((prev) => ({ ...prev, businessLicenseName: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterBusinessLicenseName')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('businessLicenseNumber')} <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={formState.businessLicenseNumber}
                onChange={(e) => setFormState((prev) => ({ ...prev, businessLicenseNumber: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterBusinessLicenseNumber')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('uploadHospitalLicense')}</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => hospitalLicenseRef.current?.click()}
                  className="rounded-lg bg-red-600 text-white px-4 py-2 font-semibold hover:bg-red-700 transition"
                >
                  {t('uploadHospitalLicense')}
                </button>
                {hospitalLicenseName && (
                  <span className="text-xs text-gray-700 max-w-xs truncate">{hospitalLicenseName}</span>
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
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              {t('addHospital')}
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
          type="hospital"
          data={successData}
        />
      )}
    </div>
  );
};

export default AddHospitalView;
