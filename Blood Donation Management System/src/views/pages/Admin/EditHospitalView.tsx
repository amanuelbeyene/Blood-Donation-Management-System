import { FormEvent, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { fetchHospitalById, updateHospital, fetchHospitals } from '../../../controllers/hospitalController';
import { validatePassword } from '../../../utils/validation';
import type { Hospital } from '../../../models/Hospital';

const EditHospitalView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Mode Logic: List vs Edit
  const isSelfEdit = user?.role === 'hospital';
  const showList = !id && !isSelfEdit;

  // List State
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  // Form State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [licenseImage, setLicenseImage] = useState<string | null>(null);
  const [licenseFileName, setLicenseFileName] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    name: '',
    landline: '',
    phone: '',
    email: '',
    contactDoctorName: '',
    contactDoctorPhone: '',
    fanNumber: '',
    // Address
    region: '',
    city: '',
    subCity: '',
    woreda: '',
    kebele: '',
    street: '',
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
    status: 'Active',
    idCardFront: null as string | null,
    idCardBack: null as string | null,
  });
  // Track original data for diffing
  const [originalData, setOriginalData] = useState<any>(null);

  // Determine Base Path based on Role
  const getBasePath = (role?: string) => {
    switch (role) {
      case 'super_admin': return '/super-admin';
      case 'staff': return '/staff';
      case 'hospital': return '/hospital';
      case 'admin':
      default: return '/admin';
    }
  };
  const basePath = getBasePath(user?.role);

  useEffect(() => {
    if (showList) {
      // Load List
      fetchHospitals().then(data => {
        setHospitals(data);
        setIsLoading(false);
      });
    } else {
      // Load Form Data
      const targetId = id || (isSelfEdit ? user?.id : null);
      if (targetId) {
        fetchHospitalById(targetId as string).then(hospital => {
          if (hospital) {
            const loadedData = {
              name: hospital.name || '',
              landline: hospital.landline || '',
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

              businessLicenseName: hospital.businessLicenseName || '',
              businessLicenseNumber: hospital.businessLicenseNumber || '',

              hospitalType: hospital.hospitalType || 'Government Hospital',

              location: hospital.location || '',
              latitude: hospital.latitude || null,
              longitude: hospital.longitude || null,

              username: hospital.username || '',
              password: hospital.password || '',
              confirmPassword: hospital.password || '',
              status: hospital.status || 'Active',

            };
            setFormState(loadedData);
            setOriginalData(loadedData); // Set original data clone

            if (hospital.profilePicture) setProfilePicture(hospital.profilePicture);
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
    }
  }, [id, showList, isSelfEdit, user?.id]);

  const handleGetLocation = async () => {
    setIsLocating(true);
    try {
      const { getCurrentLocation, getAddressFromCoordinates } = await import('../../../utils/geoUtils');
      const position = await getCurrentLocation();
      const { latitude, longitude } = position.coords;
      const address = await getAddressFromCoordinates(latitude, longitude);

      setFormState((prev) => ({
        ...prev,
        location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        latitude,
        longitude,
        region: address.region || prev.region,
        city: address.city || prev.city,
        subCity: address.subCity || prev.subCity,
        woreda: address.woreda || prev.woreda,
        kebele: address.kebele || prev.kebele,
        street: address.street || prev.street,
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
      reader.onloadend = () => setProfilePicture(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLicenseImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLicenseFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setLicenseImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formState.password !== formState.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (formState.landline && formState.landline.length !== 10) {
      toast.error('Landline must be exactly 10 digits.');
      return;
    }
    if (formState.phone && formState.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits.');
      return;
    }
    if (formState.contactDoctorPhone && formState.contactDoctorPhone.length !== 10) {
      toast.error('Contact person phone must be exactly 10 digits.');
      return;
    }

    if (formState.fanNumber.length !== 16) {
      toast.error('FAN Number must be exactly 16 digits.');
      return;
    }
    if (!formState.location || !formState.latitude || !formState.longitude) {
      toast.error('Location (GPS) is required.');
      return;
    }
    if (formState.password) {
      const passwordValidation = validatePassword(formState.password);
      if (!passwordValidation.isValid) {
        toast.error(passwordValidation.message);
        return;
      }
    }

    const updatedHospital = {
      ...formState,
      profilePicture: profilePicture || undefined,
      businessLicenseImage: licenseImage || undefined,
      latitude: formState.latitude || undefined,
      longitude: formState.longitude || undefined,
      status: formState.status as 'Active' | 'Pending' | 'Rejected',
      idCardFront: formState.idCardFront || undefined,
      idCardBack: formState.idCardBack || undefined,
    };

    try {
      const targetId = id || (isSelfEdit ? user?.id : null);
      if (!targetId) throw new Error("No ID found");

      await updateHospital(targetId, updatedHospital);

      // Log Activity
      if (user && user.role === 'staff') {
        const { ActivityTracker } = await import('../../../utils/ActivityTracker');

        // Calculate changes
        const changes: string[] = [];
        if (originalData) {
          Object.keys(formState).forEach((key) => {
            const k = key as keyof typeof formState;
            // Skip password if blank/unchanged logic, but here we treat it simply
            if (k === 'password' || k === 'confirmPassword') return;

            if (formState[k] !== originalData[k]) {
              // Convert camelCase to Title Case (e.g. contactDoctorName -> ContactDoctorName)
              const label = k.charAt(0).toUpperCase() + k.slice(1);
              changes.push(label);
            }
          });
          // Check images explicitly if needed (approximated here by null checks if desired, but simplifying to form fields mostly)
        }

        const details = changes.length > 0 ? changes.join(', ') : 'Updated hospital details';

        ActivityTracker.addLog({
          staffId: user.id,
          actionType: 'UPDATE_HOSPITAL',
          targetId: targetId,
          targetName: formState.name,
          targetProfilePicture: profilePicture, // Use updated or existing
          details: details,
          staff: { ...user, role: 'staff' } as any // Pass partial staff info for immediate UI update
        });
      }

      toast.success('Hospital details updated successfully!');
      if (id) {
        navigate(`${basePath}/view-hospitals`);
      } else {
        navigate('/hospital');
      }
    } catch (error: any) {
      console.error('Update failed', error);
      toast.error('Failed to update: ' + error.message);
    }
  };

  const formatLocation = (hospital: Hospital): string => {
    if (hospital.locationDetails) {
      return hospital.locationDetails.city || hospital.location || 'N/A';
    }
    return hospital.location || 'N/A';
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // --- List View for Admin ---
  if (showList) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('editHospitalDetails')}</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t('hospitals')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('emailAddress')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('phoneNumber')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('address')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hospitals.map(hospital => (
                  <tr key={hospital.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        {hospital.profilePicture ? (
                          <img src={hospital.profilePicture} alt={hospital.name} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-bold">{hospital.name.charAt(0)}</span>
                          </div>
                        )}
                        <span>{hospital.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">{formatLocation(hospital)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${hospital.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {hospital.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => navigate(`${basePath}/edit-hospital/${hospital.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
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

  // --- Edit Form ---
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('editHospitalDetails')}</h2>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <p className="text-sm text-gray-600 mb-4">Editing Hospital ID: {id || 'Self-Edit'}</p>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Hospital Profile"
                  className="h-32 w-32 rounded-full object-cover border-4 border-blue-600"
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
                className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePictureChange} className="hidden" />
            </div>
            <p className="mt-2 text-sm text-gray-500">{t('uploadProfilePicture')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fields adapted to Admin Style (no big rounded-xl, standard borders) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('hospitalName')} <span className="text-red-500">*</span>
              </label>
              <input
                required
                maxLength={35}
                type="text"
                value={formState.name}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  setFormState({ ...formState, name: val });
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Type <span className="text-red-500">*</span></label>
              <select
                required
                value={formState.hospitalType}
                onChange={(e) => setFormState({ ...formState, hospitalType: e.target.value as any })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="Government Hospital">{t('governmentHospital')}</option>
                <option value="Non-Government Hospital">{t('nonGovernmentHospital')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formState.status}
                onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('emailAddress')}</label>
              <input
                type="email"
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 transition ${formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                placeholder="Example: hospital@gmail.com"
              />
              {formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email) && (
                <p className="text-red-500 text-xs mt-1">Example: amanuelbeyenee@gmail.com</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Landline) <span className="text-red-500">*</span></label>
              <input
                required
                type="tel"
                maxLength={10}
                value={formState.landline}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setFormState({ ...formState, landline: val });
                }}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 transition ${formState.landline && formState.landline.length !== 10
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                placeholder="011 9"
              />
              {formState.landline && formState.landline.length !== 10 && (
                <p className="text-red-500 text-xs mt-1">Must be exactly 10 digits.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('phoneNumber')} <span className="text-red-500">*</span></label>
              <input
                required
                type="tel"
                maxLength={10}
                value={formState.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setFormState({ ...formState, phone: val });
                }}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 transition ${formState.phone && formState.phone.length !== 10
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                placeholder="+251 911 / 0911"
              />
              {formState.phone && formState.phone.length !== 10 && (
                <p className="text-red-500 text-xs mt-1">Must be exactly 10 digits.</p>
              )}
            </div>

            {/* Contact Person */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('contactPerson')}</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formState.contactDoctorName}
                onChange={(e) => setFormState({ ...formState, contactDoctorName: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                maxLength={10}
                value={formState.contactDoctorPhone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setFormState({ ...formState, contactDoctorPhone: val });
                }}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 transition ${formState.contactDoctorPhone && formState.contactDoctorPhone.length !== 10
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
              />
              {formState.contactDoctorPhone && formState.contactDoctorPhone.length !== 10 && (
                <p className="text-red-500 text-xs mt-1">Must be exactly 10 digits.</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">FAN Number <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                maxLength={16}
                value={formState.fanNumber}
                onChange={(e) => setFormState({ ...formState, fanNumber: e.target.value.replace(/\D/g, '') })}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 transition ${formState.fanNumber && formState.fanNumber.length !== 16
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                placeholder="Enter 16-digit FAN Number"
              />
              {formState.fanNumber && formState.fanNumber.length !== 16 && (
                <p className="text-red-500 text-xs mt-1">FAN Number must be exactly 16 digits.</p>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('address')}</h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Location (GPS) <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input
                  required
                  type="text"
                  value={formState.location}
                  onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  {isLocating ? '...' : (t('getLocation' as any) || 'Locate')}
                </button>
              </div>
            </div>

            {['region', 'city', 'subCity', 'woreda', 'kebele', 'street'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{field}</label>
                <input
                  type="text"
                  value={(formState as any)[field]}
                  onChange={(e) => setFormState({ ...formState, [field]: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            ))}

            {/* License */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('businessLicense')}</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Name</label>
              <input
                type="text"
                value={formState.businessLicenseName}
                onChange={(e) => setFormState({ ...formState, businessLicenseName: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
              <input
                type="text"
                value={formState.businessLicenseNumber}
                onChange={(e) => setFormState({ ...formState, businessLicenseNumber: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('uploadHospitalLicense')}</label>
              <div
                onClick={() => licenseInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition group"
              >
                <div className="bg-blue-50 p-4 rounded-full mb-3 group-hover:bg-blue-100 transition">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium text-sm mb-1">
                  Drag and Drop here
                </p>
                <p className="text-gray-400 text-xs mb-2">or</p>
                <span className="text-blue-600 font-bold text-sm hover:underline">Browse files</span>
                <input
                  ref={licenseInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLicenseImageChange}
                  className="hidden"
                />
              </div>
              <div className="mt-2 text-sm text-gray-500 italic flex items-center gap-2">
                {(licenseFileName || licenseImage) && (
                  <>
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {licenseFileName ? `Selected: ${licenseFileName}` : 'Existing License Loaded'}
                  </>
                )}
              </div>
            </div>

            {/* Account */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Account</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('username' as any) || 'Username'}</label>
              <input
                type="text"
                maxLength={20}
                value={formState.username}
                onChange={(e) => setFormState({ ...formState, username: e.target.value })}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none transition ${formState.username && !/^[a-zA-Z0-9]+$/.test(formState.username)
                  ? 'border-red-500 focus:border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                placeholder={t('enterUsername' as any) || 'Enter Username'}
              />
              {formState.username && !/^[a-zA-Z0-9]+$/.test(formState.username) && (
                <p className="text-red-500 text-xs mt-1">Username must be alphanumeric (text and numbers only).</p>
              )}
              <p className="text-slate-500 text-xs mt-1">Example: amanuel / amanuel369</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={formState.password}
                onChange={(e) => setFormState({ ...formState, password: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-100">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {t('saveChanges' as any) || 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (id) {
                  // Generic cancel based on basepath
                  navigate(`${basePath}/view-hospitals`);
                } else {
                  // Self Edit
                  navigate('/hospital');
                }
              }}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHospitalView;
