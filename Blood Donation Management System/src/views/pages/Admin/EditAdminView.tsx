import { FormEvent, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { fetchAdminById, updateAdmin } from '../../../controllers/adminController';

const EditAdminView = () => {
    const { id } = useParams();
    const { t } = useLanguage();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [formState, setFormState] = useState({
        fullName: 'Sarah Johnson',
        role: 'admin',
        bloodType: '',
        birthDate: '',
        age: '',
        maritalStatus: '',
        fanNumber: '',
        username: '',
        gender: '',
        landline: '',
        phone: '',
        email: 'sarah.j@example.com',
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        subCity: 'Bole',
        woreda: '03',
        kebele: '05',
        street: 'Bole Road',
        homeNumber: '101',
        location: '',
        latitude: null as number | null,
        longitude: null as number | null,
        status: 'active',
        idCardFront: null as string | null,
        idCardBack: null as string | null,
    });

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

    useEffect(() => {
        if (id) {
            fetchAdminById(id)
                .then(data => {
                    setFormState(prev => ({
                        ...prev,
                        fullName: data.fullName,
                        role: data.role,
                        bloodType: data.bloodType || '',
                        birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : '', // Format date for input
                        age: data.age?.toString() || '',
                        maritalStatus: data.maritalStatus || '',
                        fanNumber: data.fanNumber || '',
                        username: data.username || '',
                        gender: data.gender || '',
                        landline: data.landline || '',
                        phone: data.phone || '',
                        email: data.email,
                        region: data.region || '',
                        city: data.city || '',
                        subCity: data.subCity || '',
                        woreda: data.woreda || '',
                        kebele: data.kebele || '',
                        street: data.street || '',
                        homeNumber: data.homeNumber || '',
                        location: data.location || '',
                        latitude: data.latitude || null,
                        longitude: data.longitude || null,
                        status: data.status || 'active',
                        idCardFront: data.idCardFront || null,
                        idCardBack: data.idCardBack || null,
                    }));
                    if (data.profilePicture) setProfilePicture(data.profilePicture);
                })
                .catch(err => console.error("Failed to fetch admin", err));
        }
    }, [id]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!id) return;

        // Validation logic
        if (formState.fanNumber.length !== 16) {
            toast.error('FAN Number must be exactly 16 digits.');
            return;
        }

        if (formState.phone.length !== 10 && formState.phone.length !== 13) {
            toast.error('Phone number must be exactly 10 or 13 digits.');
            return;
        }

        // Location check - check if string is empty, ignoring lat/lng nulls if string present (manual entry)
        if (!formState.location) {
            toast.error('Location (GPS) is required.');
            return;
        }

        try {
            await updateAdmin(id, {
                ...formState,
                latitude: formState.latitude ?? undefined,
                longitude: formState.longitude ?? undefined,
                profilePicture: profilePicture || undefined,
                idCardFront: formState.idCardFront || undefined,
                idCardBack: formState.idCardBack || undefined,
            });
            toast.success('Admin details updated successfully!');
        } catch (error: any) {
            console.error('Failed to update admin:', error);
            toast.error(error.response?.data?.message || 'Failed to update admin');
        }
    };

    const [admins, setAdmins] = useState<any[]>([]);

    useEffect(() => {
        if (!id) {
            import('../../../controllers/adminController').then(({ fetchAdmins }) => {
                fetchAdmins().then(data => setAdmins(data.filter(a => a.role !== 'super_admin')));
            });
        }
    }, [id]);

    const formatLocation = (admin: any): string => {
        return admin.city || 'N/A';
    };

    const navigate = useNavigate();

    if (!id) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Admin Details</h2>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Admin Members</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('emailAddress')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('phoneNumber')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('address')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {admins.map((admin) => (
                                    <tr key={admin.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <div className="flex items-center gap-3">
                                                {admin.profilePicture ? (
                                                    <img src={admin.profilePicture} alt={admin.fullName} className="h-10 w-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-gray-500 text-sm">
                                                            {admin.fullName.charAt(0)}
                                                        </span>
                                                    </div>
                                                )}
                                                <span>{admin.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                            <div className="truncate" title={formatLocation(admin)}>
                                                {formatLocation(admin)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${admin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {admin.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => navigate(`/super-admin/edit-admin/${admin.id}`)}
                                                className="text-purple-600 hover:text-purple-800 font-bold"
                                            >
                                                Edit
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
            <h2 className="text-2xl font-bold text-gray-900">Edit Admin Details</h2>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600 mb-4">Editing admin ID: {id || 'N/A'}</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Picture and Personal Info Group */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Profile Picture Column */}
                        <div className="flex flex-col items-center justify-start pt-4">
                            <div className="relative">
                                {profilePicture ? (
                                    <img
                                        src={profilePicture}
                                        alt="Admin Profile"
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

                        {/* Personal Details Columns */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
                                        }`}
                                    placeholder={t('enterFullName')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={formState.role}
                                    onChange={(e) => setFormState((prev) => ({ ...prev, role: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('bloodType' as any) || 'Blood Type'} <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={formState.bloodType}
                                    onChange={(e) => setFormState(prev => ({ ...prev, bloodType: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                >
                                    <option value="">Select Blood Type</option>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gender <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={formState.gender}
                                    onChange={(e) => setFormState(prev => ({ ...prev, gender: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
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
                                        setFormState(prev => ({
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
                                    onChange={(e) => setFormState(prev => ({ ...prev, age: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={formState.maritalStatus}
                                    onChange={(e) => setFormState(prev => ({ ...prev, maritalStatus: e.target.value }))}
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
                                        setFormState(prev => ({ ...prev, fanNumber: val }));
                                    }}
                                    className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 transition ${formState.fanNumber && formState.fanNumber.length !== 16
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
                                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
                                        }`}
                                    placeholder="Enter 16-digit FAN Number"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                        {/* Phone (Landline) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('phoneLandline' as any) || 'Phone (Landline)'} <span className="text-red-500">*</span></label>
                            <input
                                required
                                type="tel"
                                maxLength={13}
                                value={formState.landline || ''}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^\d+]/g, '');
                                    setFormState(prev => ({ ...prev, landline: val }));
                                }}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                placeholder="+251 911 / 0911"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('phoneNumber')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="tel"
                                maxLength={13}
                                value={formState.phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^\d+]/g, '');
                                    setFormState((prev) => ({ ...prev, phone: val }));
                                }}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                placeholder="+251 911 / 0911"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('emailAddress')}</label>
                            <input
                                type="email"
                                value={formState.email}
                                onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 transition ${formState.email && !/^[^\\s@]+@[^\\s@]+\.[^\\s@]+$/.test(formState.email)
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
                                    : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
                                    }`}
                                placeholder={t('enterEmail')}
                            />
                            {formState.email && !/^[^\\s@]+@[^\\s@]+\.[^\\s@]+$/.test(formState.email) && (
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
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                placeholder="Enter Username"
                            />
                            <p className="text-slate-500 text-xs mt-1">Example: amanuel / amanuel369</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={formState.status}
                                onChange={(e) => setFormState((prev) => ({ ...prev, status: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('address')}</h3>

                        <div className="space-y-6">
                            {/* Location (GPS) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location (GPS) <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formState.location}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, location: e.target.value }))}
                                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                        placeholder="GPS Coordinates"
                                        required
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

                            {/* IDs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Front ID */}
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

                                {/* Back ID */}
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

                            {/* Address Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('region')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={formState.region}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, region: e.target.value }))}
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
                                        onChange={(e) => setFormState((prev) => ({ ...prev, city: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                        placeholder={t('enterCity')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('subCity')}</label>
                                    <input
                                        type="text"
                                        value={formState.subCity}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, subCity: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                        placeholder={t('enterSubCity')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('woreda')}</label>
                                    <input
                                        type="text"
                                        value={formState.woreda}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, woreda: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                        placeholder={t('enterWoreda')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('kebele')}</label>
                                    <input
                                        type="text"
                                        value={formState.kebele}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, kebele: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                        placeholder={t('enterKebele')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('street')}</label>
                                    <input
                                        type="text"
                                        value={formState.street}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, street: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                        placeholder={t('enterStreet')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('homeNumber')}</label>
                                    <input
                                        type="text"
                                        value={formState.homeNumber}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, homeNumber: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                        placeholder={t('enterHomeNumber')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
                        >
                            Update Admin
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/super-admin/view-admins')}
                            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                            {t('cancel')}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default EditAdminView;
