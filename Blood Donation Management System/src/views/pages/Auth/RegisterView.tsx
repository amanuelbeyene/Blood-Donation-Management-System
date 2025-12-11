import { FormEvent, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';

const RegisterView = () => {
  const { t } = useLanguage();
  const [role, setRole] = useState<'donor' | 'hospital'>('donor');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const [donorFormState, setDonorFormState] = useState({
    fullName: '',
    email: '',
    phone: '',
    bloodType: 'O+',
    age: '',
    region: '',
    city: '',
    subCity: '',
    woreda: '',
    kebele: '',
    street: '',
    homeNumber: '',
    medicalCondition: '',
  });

  const [hospitalFormState, setHospitalFormState] = useState({
    name: '',
    email: '',
    phone: '',
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

  const handleDonorSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert('Donor registration submitted! Backend integration coming soon.');
  };

  const handleHospitalSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert('Hospital registration submitted! Backend integration coming soon.');
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-[#fff5f8] px-4 py-8">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-10 shadow-card">
        <h1 className="text-3xl font-semibold text-slate-900">{t('createProfile')}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {t('registerDescription')}
        </p>

        {/* Role Selection */}
        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={() => setRole('donor')}
            className={`flex-1 rounded-2xl px-6 py-3 text-sm font-semibold transition ${
              role === 'donor'
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t('imADonor')}
          </button>
          <button
            type="button"
            onClick={() => setRole('hospital')}
            className={`flex-1 rounded-2xl px-6 py-3 text-sm font-semibold transition ${
              role === 'hospital'
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t('imAHospital')}
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
                </select>
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
                  {t('phoneNumber')} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="tel"
                  value={hospitalFormState.phone}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, phone: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterPhoneNumber')}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">{t('contactPerson')}</label>
                <input
                  type="text"
                  value={hospitalFormState.contactPerson}
                  onChange={(e) => setHospitalFormState((prev) => ({ ...prev, contactPerson: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
                  placeholder={t('enterContactPerson')}
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
    </div>
  );
};

export default RegisterView;
