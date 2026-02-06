import { FormEvent, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { fetchStaffById, updateStaff, fetchStaff, Staff } from '../../../controllers/staffController';

const EditStaffView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [formState, setFormState] = useState<any>({
        fullName: '',
        email: '',
        landline: '',
        phone: '',
        bloodType: '',
        birthDate: '',
        age: '',
        gender: '',
        maritalStatus: '',
        fanNumber: '',
        username: '',
        region: '',
        city: '',
        subCity: '',
        woreda: '',
        kebele: '',
        street: '',
        homeNumber: '',
        location: '',
        latitude: null,
        longitude: null,
        medicalCondition: '',
        hasDisability: '',
        disabilityType: '',
        role: 'Staff',
        status: 'active',
        idCardFront: null as string | null,
        idCardBack: null as string | null,
    });

    useEffect(() => {
        const loadStaff = async () => {
            if (!id) return;
            try {
                const staff = await fetchStaffById(id);
                if (staff) {
                    // Explicitly remove password to prevent sending it back
                    const { password, ...cleanStaff } = staff as any;
                    setFormState({
                        ...cleanStaff,
                        age: staff.age?.toString() || '',
                        birthDate: staff.birthDate ? new Date(staff.birthDate).toISOString().split('T')[0] : '',
                    });
                    if (staff.profilePicture) {
                        setProfilePicture(staff.profilePicture);
                    }
                    if (staff.idCardFront) {
                        setFormState((prev: any) => ({ ...prev, idCardFront: staff.idCardFront }));
                    }
                    if (staff.idCardBack) {
                        setFormState((prev: any) => ({ ...prev, idCardBack: staff.idCardBack }));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch staff', error);
                toast.error('Failed to load staff details');
            } finally {
                setIsLoading(false);
            }
        };
        loadStaff();
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

            setFormState((prev: any) => ({
                ...prev,
                location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                latitude,
                longitude,
                // Auto-fill address fields
                region: address.region || prev.region,
                city: address.city || prev.city,
                subCity: address.subCity || prev.subCity,
                woreda: address.woreda || prev.woreda,
                kebele: address.kebele || prev.kebele,
                street: address.street || prev.street,
                homeNumber: address.homeNumber || prev.homeNumber
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
        try {
            if (!id) return;

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

            if (formState.phone.length !== 10) {
                toast.error('Phone number must be exactly 10 digits.');
                return;
            }

            if (!formState.hasDisability) {
                toast.error('Please specify if you have any disabilities.');
                return;
            }

            await updateStaff(id, {
                ...formState,
                age: formState.age ? parseInt(formState.age) : undefined,
                latitude: formState.latitude || undefined,
                longitude: formState.longitude || undefined,
                profilePicture: profilePicture || undefined,
                idCardFront: formState.idCardFront || undefined,
                idCardBack: formState.idCardBack || undefined,
            });
            toast.success('Staff details updated successfully!');
            navigate('/admin');
        } catch (error: any) {
            console.error('Update failed', error);
            toast.error('Failed to update staff');
        }
    };


    useEffect(() => {
        if (!id) {
            const loadData = async () => {
                try {
                    const data = await fetchStaff();
                    setStaffList(data);
                } catch (error) {
                    console.error("Failed to load staff list", error);
                } finally {
                    setIsLoading(false);
                }
            };
            loadData();
        }
    }, [id]);

    const formatLocation = (staff: Staff): string => {
        if (!staff) return 'N/A';
        return staff.city || staff.location || 'N/A';
    };

    if (!id) {
        if (isLoading) {
            return (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('editStaffDetails')}</h2>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">{t('staffMembers' as any) || 'Staff Members'}</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('emailAddress')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('phoneNumber')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('role' as any) || 'Role'}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('address')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {staffList.map((staff) => (
                                    <tr key={staff.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <div className="flex items-center gap-3">
                                                {staff.profilePicture ? (
                                                    <img src={staff.profilePicture} alt={staff.fullName} className="h-10 w-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-gray-500 text-sm">
                                                            {staff.fullName ? staff.fullName.charAt(0) : 'S'}
                                                        </span>
                                                    </div>
                                                )}
                                                <span>{staff.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                                {staff.role || 'Staff'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                            <div className="truncate" title={formatLocation(staff)}>
                                                {formatLocation(staff)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${staff.status === 'active' || staff.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {staff.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => navigate(`/admin/edit-staff/${staff.id}`)}
                                                className="text-purple-600 hover:text-purple-800 font-bold"
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


    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Staff Details</h2>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600 mb-4">Editing staff ID: {id || 'N/A'}</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            {profilePicture ? (
                                <img
                                    src={profilePicture}
                                    alt="Staff Profile"
                                    className="h-32 w-32 rounded-full object-cover border-4 border-purple-600"
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
                                className="absolute bottom-0 right-0 bg-purple-600 text-white rounded-full p-2 hover:bg-purple-700 transition"
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('fullName')} <span className="text-red-500">*</span></label>
                            <input
                                required
                                maxLength={35}
                                type="text"
                                value={formState.fullName}
                                onChange={(e) => setFormState((prev: Staff) => ({ ...prev, fullName: e.target.value }))}
                                className={`w-full rounded-lg border px-4 py-2 focus:outline-none transition ${formState.fullName.length === 35
                                    ? 'border-red-500 focus:border-red-500 bg-red-50'
                                    : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
                                    }`}
                            />
                            {formState.fullName.length === 35 && (
                                <p className="text-red-500 text-xs mt-1">Max length reached (35 characters).</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Role <span className="text-red-500">*</span></label>
                            <select
                                required
                                value={formState.role}
                                onChange={(e) => setFormState((prev: Staff) => ({ ...prev, role: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                            >
                                <option value="Staff">Staff</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('emailAddress')} <span className="text-red-500">*</span></label>
                            <input
                                required
                                type="email"
                                value={formState.email}
                                onChange={(e) => setFormState((prev: any) => ({ ...prev, email: e.target.value }))}
                                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 transition ${formState.email && !/^[^\\s@]+@[^\\s@]+\.[^\\s@]+$/.test(formState.email)
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
                                    : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
                                    }`}
                            />
                            {formState.email && !/^[^\\s@]+@[^\\s@]+\.[^\\s@]+$/.test(formState.email) && (
                                <p className="text-red-500 text-xs mt-1">Example: amanuelbeyenee@gmail.com</p>
                            )}
                        </div>

                        {/* Phone (Landline) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('phoneLandline' as any) || 'Phone (Landline)'}</label>
                            <input
                                type="tel"
                                maxLength={10}
                                value={formState.landline || ''}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setFormState((prev: any) => ({ ...prev, landline: val }));
                                }}
                                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 transition ${formState.landline && formState.landline.length < 10
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
                                    : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
                                    }`}
                                placeholder="011..."
                            />
                            {formState.landline && formState.landline.length < 10 && (
                                <p className="text-red-500 text-xs mt-1">Must be 10 digits. Example 011 4141764</p>
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
                                    setFormState((prev: any) => ({ ...prev, phone: val }));
                                }}
                                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 transition ${formState.phone && formState.phone.length !== 10
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
                                    : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
                                    }`}
                                placeholder="+251 911 / 0911"
                            />
                            {formState.phone && formState.phone.length !== 10 && (
                                <p className="text-red-500 text-xs mt-1">Must be exactly 10 digits.</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('username' as any) || 'Username'} <span className="text-red-500">*</span></label>
                            <input
                                required
                                type="text"
                                maxLength={20}
                                value={formState.username}
                                onChange={(e) => setFormState((prev: any) => ({ ...prev, username: e.target.value }))}
                                className={`w-full rounded-lg border px-4 py-2 focus:outline-none transition ${formState.username && !/^[a-zA-Z0-9]+$/.test(formState.username)
                                    ? 'border-red-500 focus:border-red-500 bg-red-50'
                                    : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
                                    }`}
                                placeholder={t('enterUsername' as any) || 'Enter Username'}
                            />
                            {formState.username && !/^[a-zA-Z0-9]+$/.test(formState.username) && (
                                <p className="text-red-500 text-xs mt-1">Username must be alphanumeric (text and numbers only).</p>
                            )}
                            <p className="text-slate-500 text-xs mt-1">Example: amanuel / amanuel369</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={formState.status}
                                onChange={(e) => setFormState((prev: any) => ({ ...prev, status: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* New Fields */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('bloodType' as any) || 'Blood Type'} <span className="text-red-500">*</span></label>
                            <select
                                required
                                value={formState.bloodType}
                                onChange={(e) => setFormState((prev: any) => ({ ...prev, bloodType: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                            >
                                <option value="">Select Blood Type</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('birthDate' as any) || 'Birth Date'} <span className="text-red-500">*</span></label>
                            <input
                                required
                                type="date"
                                value={formState.birthDate}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormState((prev: any) => ({
                                        ...prev,
                                        birthDate: val,
                                        age: calculateAge(val)
                                    }));
                                }}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('age' as any) || 'Age'} <span className="text-red-500">*</span></label>
                            <input
                                required
                                type="number"
                                value={formState.age}
                                onChange={(e) => setFormState((prev: any) => ({ ...prev, age: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('gender' as any) || 'Gender'} <span className="text-red-500">*</span></label>
                            <select
                                required
                                value={formState.gender}
                                onChange={(e) => setFormState((prev: any) => ({ ...prev, gender: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status <span className="text-red-500">*</span></label>
                            <select
                                required
                                value={formState.maritalStatus}
                                onChange={(e) => setFormState((prev: any) => ({ ...prev, maritalStatus: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">FAN Number <span className="text-red-500">*</span></label>
                            <input
                                required
                                type="text"
                                maxLength={16}
                                value={formState.fanNumber}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setFormState((prev: any) => ({ ...prev, fanNumber: val }));
                                }}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                placeholder="Enter 16-digit FAN Number"
                            />
                            {formState.fanNumber && formState.fanNumber.length !== 16 && (
                                <p className="text-red-500 text-xs mt-1">FAN Number must be exactly 16 digits.</p>
                            )}
                        </div>

                        {/* Medical Section moved here for flow or keep detailed? */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('medicalCondition' as any) || 'Medical Condition'} <span className="text-red-500">*</span></label>
                            <select
                                required
                                value={formState.medicalCondition}
                                onChange={(e) => setFormState((prev: any) => ({ ...prev, medicalCondition: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Has Disabilities? <span className="text-red-500">*</span></label>
                            <select
                                required
                                value={formState.hasDisability}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormState((prev: any) => ({
                                        ...prev,
                                        hasDisability: val,
                                        disabilityType: val === 'No' ? '' : prev.disabilityType
                                    }));
                                }}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                            >
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>

                        {formState.hasDisability === 'Yes' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Disabilities List</label>
                                <select
                                    value={formState.disabilityType}
                                    onChange={(e) => setFormState((prev: any) => ({ ...prev, disabilityType: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                >
                                    <option value="">Select Disability</option>
                                    <option value="Physical">Physical</option>
                                    <option value="Mobility Issues">Mobility Issues</option>
                                    <option value="Blindness">Blindness</option>
                                    <option value="Deafness">Deafness</option>
                                </select>
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location (GPS) <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input
                                    required
                                    type="text"
                                    value={formState.location}
                                    onChange={(e) => setFormState((prev: any) => ({ ...prev, location: e.target.value }))}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                    placeholder="GPS Coordinates"
                                />
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    disabled={isLocating}
                                    className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition border border-purple-200"
                                >
                                    {isLocating ? 'Locating...' : (t('getLocation' as any) || 'Get Location')}
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 pb-4 border-t border-b border-gray-100">
                            {/* Front ID Upload */}
                            <div className="flex flex-col">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Front ID <span className="text-red-500">*</span></label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-500 hover:bg-purple-50 transition cursor-pointer flex flex-col items-center justify-center min-h-[150px]"
                                    onClick={() => document.getElementById('frontIdInput')?.click()}
                                >
                                    {formState.idCardFront ? (
                                        <div className="relative w-full h-full flex flex-col items-center justify-center">
                                            <img src={formState.idCardFront} alt="Front ID" className="h-32 object-contain rounded-md" />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFormState((prev: any) => ({ ...prev, idCardFront: null }));
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
                                                reader.onloadend = () => setFormState((prev: any) => ({ ...prev, idCardFront: reader.result as string }));
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Back ID Upload */}
                            <div className="flex flex-col">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Back ID</label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-500 hover:bg-purple-50 transition cursor-pointer flex flex-col items-center justify-center min-h-[150px]"
                                    onClick={() => document.getElementById('backIdInput')?.click()}
                                >
                                    {formState.idCardBack ? (
                                        <div className="relative w-full h-full flex flex-col items-center justify-center">
                                            <img src={formState.idCardBack} alt="Back ID" className="h-32 object-contain rounded-md" />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFormState((prev: any) => ({ ...prev, idCardBack: null }));
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
                                                reader.onloadend = () => setFormState((prev: any) => ({ ...prev, idCardBack: reader.result as string }));
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
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
                                onChange={(e) => setFormState((prev: any) => ({ ...prev, region: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
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
                                onChange={(e) => setFormState((prev: any) => ({ ...prev, city: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                placeholder={t('enterCity')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('subCity')}</label>
                            <input
                                type="text"
                                value={formState.subCity}
                                onChange={(e) => setFormState((prev: any) => ({ ...prev, subCity: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                placeholder={t('enterSubCity')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('woreda')}</label>
                            <input
                                type="text"
                                value={formState.woreda}
                                onChange={(e) => setFormState((prev: any) => ({ ...prev, woreda: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                placeholder={t('enterWoreda')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('kebele')}</label>
                            <input
                                type="text"
                                value={formState.kebele}
                                onChange={(e) => setFormState((prev: any) => ({ ...prev, kebele: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                placeholder={t('enterKebele')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('street')}</label>
                            <input
                                type="text"
                                value={formState.street}
                                onChange={(e) => setFormState((prev: any) => ({ ...prev, street: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                placeholder={t('enterStreet')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('homeNumber')}</label>
                            <input
                                type="text"
                                value={formState.homeNumber}
                                onChange={(e) => setFormState((prev: any) => ({ ...prev, homeNumber: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                placeholder={t('enterHomeNumber')}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
                        >
                            Update Staff
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/view-staff')}
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

export default EditStaffView;
