import { FormEvent, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';

import { fetchDonorById, updateDonor, fetchDonors } from '../../../controllers/donorController';

const APPOINTMENT_LOCATIONS = {
  'Addis Ababa': ['Ethio Tebib Hospital', 'Genet Hospital', 'Girum Hospital', 'On Street'],
  'Amhara': ['Felege Hiwot Referral Hospital', 'Debre Markos Referral Hospital', 'Debre Birhan Referral Hospital', 'Kemise General Hospital', 'On Street'],
  'Oromia': ['Alem Gena Hospital', 'Sebeta Hospital', 'Dima Hospital', 'Asko Hospital', 'On Street'],
  'Hawasa': ['Asher Primary Hospital', 'Bete Abraham', 'Kiburu Hospital', 'Yanet Hospital', 'On Street'],
};

const EditDonorView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [formState, setFormState] = useState({
    fullName: '',
    bloodType: '',
    birthDate: '',
    age: '',
    weight: '',
    maritalStatus: '',
    gender: '',

    phone: '',
    email: '',
    fanNumber: '',
    username: '',
    // Address
    region: '',
    city: '',
    subCity: '',
    woreda: '',
    kebele: '',
    street: '',
    homeNumber: '',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    // Medical
    medicalCondition: '',
    hasDisability: 'No',
    disabilityType: '',
    idCardFront: null as string | null,
    idCardBack: null as string | null,
    // Appointment
    appointmentRegion: '',
    appointmentPlace: '',
    appointmentTime: '',
    donationAppointmentDate: '',
  });

  // Robust Date Formatter for Input (YYYY-MM-DD)
  const formatDateForInput = (dateString: any) => {
    if (!dateString) return '';
    try {
      // Handle "1998 10 04" or standard "1998-10-04" or ISO
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Try parsing space-separated manually if native parsing fails
        if (typeof dateString === 'string' && dateString.includes(' ')) {
          const parts = dateString.split(' ');
          if (parts.length === 3) {
            return `${parts[0]}-${parts[1]}-${parts[2]}`;
          }
        }
        return '';
      }
      return date.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  useEffect(() => {
    if (id) {
      fetchDonorById(id).then((donor) => {
        if (donor) {
          // Debug log
          console.log('Fetched Donor for Edit:', donor);

          const formatMaritalStatus = (status: string) => {
            if (!status) return '';
            // Capitalize first letter (e.g. "single" -> "Single")
            return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
          };

          const locationString = donor.location || (donor.latitude && donor.longitude ? `${donor.latitude}, ${donor.longitude}` : '');

          setFormState({
            fullName: donor.fullName || '',
            bloodType: donor.bloodType || '',
            birthDate: formatDateForInput(donor.birthDate), // Use robust formatter
            age: donor.age?.toString() || '',
            weight: donor.weight?.toString() || '', // Keep as string
            maritalStatus: formatMaritalStatus(donor.maritalStatus || ''),
            gender: donor.gender || '',

            phone: donor.phone || '',
            email: donor.email || '',
            fanNumber: donor.fanNumber || '',
            username: donor.username || '',
            // Address
            region: donor.locationDetails?.region || '',
            city: donor.locationDetails?.city || '',
            subCity: donor.locationDetails?.subCity || '',
            woreda: donor.locationDetails?.woreda || '',
            kebele: donor.locationDetails?.kebele || '',
            street: donor.locationDetails?.street || '',
            homeNumber: donor.locationDetails?.homeNumber || '',
            location: locationString,
            latitude: donor.latitude || null,
            longitude: donor.longitude || null,
            // Medical
            medicalCondition: donor.medicalCondition || '',
            hasDisability: donor.hasDisability || 'No',
            disabilityType: donor.disabilityType || '',
            // Appointment
            appointmentRegion: donor.appointmentRegion || '',
            appointmentPlace: donor.appointmentPlace || '',
            appointmentTime: donor.appointmentTime || '',
            donationAppointmentDate: formatDateForInput(donor.donationAppointmentDate),
            idCardFront: donor.idCardFront || null,
            idCardBack: donor.idCardBack || null,
          });
          if (donor.profilePicture) {
            setProfilePicture(donor.profilePicture);
          }
        }
      });
    }
  }, [id]);

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;

    // Validation logic
    if (formState.fanNumber.length !== 16) {
      toast.error('FAN Number must be exactly 16 digits.');
      return;
    }

    // Location check
    if (!formState.location) {
      toast.error('Location (GPS) is required.');
      return;
    }

    try {
      const updateData = {
        ...formState,
        bloodType: formState.bloodType as any,
        age: formState.age ? parseInt(formState.age) : undefined,
        weight: formState.weight || undefined, // Send as string, handled by backend

        latitude: formState.latitude || undefined,
        longitude: formState.longitude || undefined,
        profilePicture: profilePicture || undefined,
        idCardFront: formState.idCardFront || undefined,
        idCardBack: formState.idCardBack || undefined,
      };

      await updateDonor(id, updateData);
      toast.success('Donor details updated successfully!');
    } catch (error: any) {
      console.error('Update failed', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update';
      toast.error('Failed to update: ' + errorMessage);
    }
  };

  const navigate = useNavigate();
  const [donors, setDonors] = useState<any[]>([]);

  useEffect(() => {
    if (!id) {
      fetchDonors().then(data => setDonors(data));
    }
  }, [id]);

  if (!id) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('editDonorDetails')}</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t('donors')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('emailAddress')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('phoneNumber')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('bloodType')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('address')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('availability')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donors.map((donor) => (
                  <tr key={donor.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        {donor.profilePicture ? (
                          <img src={donor.profilePicture} alt={donor.fullName} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        <span>{donor.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                        {donor.bloodType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="truncate">
                        {donor.location || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${donor.availability === 'ready'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                          }`}
                      >
                        {donor.availability === 'ready' ? t('ready') : t('resting')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => navigate(donor.id)}
                        className="text-red-600 hover:text-red-800 font-bold"
                      >
                        {t('edit')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('editDonorDetails')}</h2>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <p className="text-sm text-gray-600 mb-4">Editing donor ID: {id || 'N/A'}</p>


        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... */}
          {/* Profile Picture Upload code matches ... but replace_file_content needs context. I will target the wrapper div and the buttons at the end */}

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
                maxLength={35}
                type="text"
                value={formState.fullName}
                onChange={(e) => setFormState((prev) => ({ ...prev, fullName: e.target.value }))}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none transition ${formState.fullName.length === 35
                  ? 'border-red-500 focus:border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-red-500 focus:ring-red-200'
                  }`}
                placeholder={t('enterFullName')}
              />
              {formState.fullName.length === 35 && (
                <p className="text-red-500 text-xs mt-1">Max length reached (35 characters).</p>
              )}
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (Kg) <span className="text-red-500">*</span>
              </label>
              <input
                required
                min={45}
                type="number"
                value={formState.weight}
                onChange={(e) => setFormState((prev) => ({ ...prev, weight: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
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
                  const val = e.target.value.replace(/\D/g, '');
                  setFormState((prev) => ({ ...prev, fanNumber: val }));
                }}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 transition ${formState.fanNumber && formState.fanNumber.length !== 16
                  ? 'border-red-500 focus:border-red-500 bg-red-50 focus:ring-red-200'
                  : 'border-gray-300 focus:border-red-500 focus:ring-red-200'
                  }`}
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
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d+]/g, '');
                  setFormState((prev) => ({ ...prev, phone: val }));
                }}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${formState.phone && (formState.phone.length !== 10 && formState.phone.length !== 13)
                  ? 'border-red-500 bg-red-50 focus:ring-red-200'
                  : 'border-gray-300 focus:border-red-500 focus:ring-red-200'
                  }`}
                placeholder="+251 911 / 0911"
              />
              {formState.phone && (formState.phone.length !== 10 && formState.phone.length !== 13) && (
                <p className="text-red-500 text-xs mt-1">Must be 10 or 13 digits.</p>
              )}
            </div>



            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('emailAddress')}</label>
              <input
                type="email"
                value={formState.email}
                onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)
                  ? 'border-red-500 bg-red-50 focus:ring-red-200'
                  : 'border-gray-300 focus:border-red-500 focus:ring-red-200'
                  }`}
                placeholder={t('enterEmail')}
              />
              {formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email) && (
                <p className="text-red-500 text-xs mt-1">Example: amanuelbeyenee@gmail.com</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('username' as any) || 'Username'} <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                maxLength={20}
                value={formState.username}
                onChange={(e) => setFormState((prev) => ({ ...prev, username: e.target.value }))}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none transition ${formState.username && !/^[a-zA-Z0-9]+$/.test(formState.username)
                  ? 'border-red-500 focus:border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-red-500 focus:ring-red-200'
                  }`}
                placeholder={t('enterUsername' as any) || 'Enter Username'}
              />
              {formState.username && !/^[a-zA-Z0-9]+$/.test(formState.username) && (
                <p className="text-red-500 text-xs mt-1">Username must be alphanumeric (text and numbers only).</p>
              )}
              <p className="text-slate-500 text-xs mt-1">Example: amanuel / amanuel369</p>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('address')}</h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Location (GPS) <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formState.location}
                  onChange={(e) => setFormState((prev) => ({ ...prev, location: e.target.value }))}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="GPS Coordinates"
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  {isLocating ? 'Locating...' : (t('getLocation' as any) || 'Get Location')}
                </button>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 pb-4 border-t border-b border-gray-100">
              {/* Front ID Upload */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Front ID <span className="text-red-500">*</span></label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-red-500 hover:bg-red-50 transition cursor-pointer flex flex-col items-center justify-center min-h-[150px]"
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
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-500">Click to upload Front ID</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Back ID</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-red-500 hover:bg-red-50 transition cursor-pointer flex flex-col items-center justify-center min-h-[150px]"
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
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-500">Click to upload Back ID</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('region')} <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={formState.region}
                onChange={(e) => setFormState((prev) => ({ ...prev, region: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('subCity')}</label>
              <input
                type="text"
                value={formState.subCity}
                onChange={(e) => setFormState((prev) => ({ ...prev, subCity: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('woreda')}</label>
              <input
                type="text"
                value={formState.woreda}
                onChange={(e) => setFormState((prev) => ({ ...prev, woreda: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('kebele')}</label>
              <input
                type="text"
                value={formState.kebele}
                onChange={(e) => setFormState((prev) => ({ ...prev, kebele: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('street')}</label>
              <input
                type="text"
                value={formState.street}
                onChange={(e) => setFormState((prev) => ({ ...prev, street: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('homeNumber')}</label>
              <input
                type="text"
                value={formState.homeNumber}
                onChange={(e) => setFormState((prev) => ({ ...prev, homeNumber: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
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
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('medicalCondition')} <span className="text-red-500">*</span></label>
              <select
                required
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Has Disabilities? <span className="text-red-500">*</span></label>
              <select
                required
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

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              {t('updateDonor')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (user?.role === 'staff') {
                  navigate('/staff/view-donors');
                } else {
                  navigate('/admin/view-donors');
                }
              }}
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

export default EditDonorView;

