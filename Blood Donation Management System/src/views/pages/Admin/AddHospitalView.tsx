import { FormEvent, useState, useRef } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

const AddHospitalView = () => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    email: '',
    contactPerson: '',
    region: '',
    city: '',
    subCity: '',
    woreda: '',
    kebele: '',
    street: '',
    businessLicenseName: '',
    businessLicenseNumber: '',
    hospitalType: 'Government Hospital' as 'Government Hospital' | 'Non-Government Hospital',
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert('Hospital added successfully! Backend integration coming soon.');
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
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('contactPerson')}</label>
              <input
                type="text"
                value={formState.contactPerson}
                onChange={(e) => setFormState((prev) => ({ ...prev, contactPerson: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder={t('enterContactPerson')}
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
    </div>
  );
};

export default AddHospitalView;
