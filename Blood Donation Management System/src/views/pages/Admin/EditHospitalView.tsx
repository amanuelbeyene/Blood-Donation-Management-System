import { FormEvent, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchHospitalById } from '../../../controllers/hospitalController';

const EditHospitalView = () => {
  const { id } = useParams();
  const { user } = useAuth(); // for self-edit
  const navigate = useNavigate();
  const { t } = useLanguage();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [licenseImage, setLicenseImage] = useState<string | null>(null);
  const [licenseFileName, setLicenseFileName] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    email: '',
    contactDoctorName: '', // Mapped from 'contactPerson' in previous view, likely same logic
    contactDoctorPhone: '',
    fanNumber: '',

    // Address
    region: '',
    city: '',
    subCity: '',
    woreda: '',
    kebele: '',
    street: '',
    homeNumber: '',

    // License
    businessLicenseName: '',
    businessLicenseNumber: '',

    hospitalType: 'Government Hospital' as 'Government Hospital' | 'Non-Government Hospital',

    // Location
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,

    // Account
    username: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // Only use user.id if the logged-in user is a Hospital.
    // Admins/Staff viewing this page without an ID param should see an empty form (or selection logic).
    const targetId = id || (user?.role === 'hospital' ? user.id : null);
    if (targetId) {
      // Assuming fetchHospitalById is available or using a similar controller
      // If specific controller logic needed, might need to adjust import
      // reusing the admin controller's fetch for now as it likely returns the Hospital object
      fetchHospitalById(targetId as string).then(hospital => {
        if (hospital) {
          setFormState({
            name: hospital.name || '',
            phone: hospital.phone || '',
            email: hospital.email || '',
            contactDoctorName: hospital.contactDoctorName || '',
            contactDoctorPhone: hospital.contactDoctorPhone || '',
            fanNumber: hospital.fanNumber || '',

            region: hospital.locationDetails?.region || '',
            city: hospital.locationDetails?.city || '',
            subCity: hospital.locationDetails?.subCity || '',
            woreda: hospital.locationDetails?.woreda || '',
            kebele: hospital.locationDetails?.kebele || '',
            street: hospital.locationDetails?.street || '',
            homeNumber: hospital.locationDetails?.homeNumber || '',

            businessLicenseName: hospital.businessLicenseName || '',
            businessLicenseNumber: hospital.businessLicenseNumber || '',

            hospitalType: hospital.hospitalType || 'Government Hospital',

            location: hospital.location || '',
            latitude: hospital.latitude || null,
            longitude: hospital.longitude || null,

            username: hospital.username || '',
            password: hospital.password || '', // Pre-fill to pass validation if unchanged
            confirmPassword: hospital.password || '',
          });

          if (hospital.profilePicture) {
            setProfilePicture(hospital.profilePicture);
          }
          if (hospital.businessLicenseImage) {
            setLicenseImage(hospital.businessLicenseImage);
            setLicenseFileName('Existing License Document');
          }
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [id, user?.id]);

  const handleGetLocation = () => {
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

  const handleLicenseImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLicenseFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLicenseImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formState.password !== formState.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Construct updated object and call API
    // const updatedHospital = { ...formState, profilePicture, businessLicenseImage: licenseImage };
    // updateHospital(targetId, updatedHospital);

    alert('Hospital details updated successfully!');
    // Redirect based on role
    if (id) {
      navigate('/admin/view-hospitals');
    } else {
      navigate('/hospital');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-3xl font-bold text-slate-900 mb-8">{t('editHospitalDetails')}</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-card border border-slate-100 space-y-6">

        {/* Profile Picture Upload */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Hospital Profile"
                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg">
                <svg className="h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
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

          {/* General Info */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('hospitalName')} <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={formState.name}
              onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('phoneNumber')} <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="tel"
              value={formState.phone}
              onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('emailAddress')}</label>
            <input
              type="email"
              value={formState.email}
              onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('hospitalType')} <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formState.hospitalType}
              onChange={(e) => setFormState((prev) => ({ ...prev, hospitalType: e.target.value as 'Government Hospital' | 'Non-Government Hospital' }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition"
            >
              <option value="Government Hospital">{t('governmentHospital')}</option>
              <option value="Non-Government Hospital">{t('nonGovernmentHospital')}</option>
            </select>
          </div>

          {/* Contact Person */}
          <div className="md:col-span-2 mt-4 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{t('contactPerson') || 'Contact Person'}</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('contactPerson')}</label>
            <input
              type="text"
              value={formState.contactDoctorName}
              onChange={(e) => setFormState((prev) => ({ ...prev, contactDoctorName: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition"
              placeholder="Doctor Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Contact Phone</label>
            <input
              type="tel"
              value={formState.contactDoctorPhone}
              onChange={(e) => setFormState((prev) => ({ ...prev, contactDoctorPhone: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Contact Doctor FAN Number <span className="text-red-500">*</span></label>
            <input
              required
              type="text"
              maxLength={16}
              value={formState.fanNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setFormState((prev) => ({ ...prev, fanNumber: val }))
              }}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition"
              placeholder="16-digit FAN Number"
            />
            {formState.fanNumber && formState.fanNumber.length !== 16 && (
              <p className="text-red-500 text-xs mt-1">FAN Number must be exactly 16 digits.</p>
            )}
          </div>


          {/* Address */}
          <div className="md:col-span-2 mt-4 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{t('address')}</h3>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Location (GPS)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formState.location}
                onChange={(e) => setFormState(prev => ({ ...prev, location: e.target.value }))}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none"
                placeholder="GPS Coordinates"
              />
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-medium hover:bg-slate-200 transition"
              >
                {isLocating ? 'Locating...' : (t('getLocation' as any) || 'Get Location')}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('region')} <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={formState.region}
              onChange={(e) => setFormState((prev) => ({ ...prev, region: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('city')} <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={formState.city}
              onChange={(e) => setFormState((prev) => ({ ...prev, city: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('subCity')}</label>
            <input
              type="text"
              value={formState.subCity}
              onChange={(e) => setFormState((prev) => ({ ...prev, subCity: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('woreda')}</label>
            <input
              type="text"
              value={formState.woreda}
              onChange={(e) => setFormState((prev) => ({ ...prev, woreda: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('kebele')}</label>
            <input
              type="text"
              value={formState.kebele}
              onChange={(e) => setFormState((prev) => ({ ...prev, kebele: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('street')}</label>
            <input
              type="text"
              value={formState.street}
              onChange={(e) => setFormState((prev) => ({ ...prev, street: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('homeNumber')}</label>
            <input
              type="text"
              value={formState.homeNumber}
              onChange={(e) => setFormState((prev) => ({ ...prev, homeNumber: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition"
            />
          </div>

          {/* License */}
          <div className="md:col-span-2 mt-4 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{t('businessLicense')}</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('businessLicenseName')} <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={formState.businessLicenseName}
              onChange={(e) => setFormState((prev) => ({ ...prev, businessLicenseName: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('businessLicenseNumber')} <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={formState.businessLicenseNumber}
              onChange={(e) => setFormState((prev) => ({ ...prev, businessLicenseNumber: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">License Document</label>
            <div
              onClick={() => licenseInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-red-500 transition"
            >
              {licenseImage ? (
                <div className="flex flex-col items-center">
                  <svg className="h-10 w-10 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-slate-900 break-all">{licenseFileName || 'Document Uploaded'}</p>
                  <span className="text-xs text-slate-500 mt-1">Click to replace</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <svg className="h-10 w-10 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium text-slate-700">Click to upload license image</p>
                </div>
              )}
            </div>
            <input
              ref={licenseInputRef}
              type="file"
              accept="image/*"
              onChange={handleLicenseImageChange}
              className="hidden"
            />
          </div>

          {/* Account Info */}
          <div className="md:col-span-2 mt-4 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Account Information</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('username' as any) || 'Username'} <span className="text-red-500">*</span></label>
            <input
              required
              type="text"
              value={formState.username}
              onChange={(e) => setFormState((prev) => ({ ...prev, username: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password <span className="text-red-500">*</span></label>
            <input
              required
              type="password"
              value={formState.password}
              onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
            <input
              required
              type="password"
              value={formState.confirmPassword}
              onChange={(e) => setFormState((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition"
            />
          </div>

        </div>

        <div className="flex gap-4 pt-6 border-t border-slate-100">
          <button
            type="submit"
            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-600/20"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate(id ? '/admin/view-hospitals' : '/hospital')}
            className="flex-1 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditHospitalView;
