import { FormEvent, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validatePassword } from '../../../utils/validation';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { fetchDonorById, updateDonor } from '../../../controllers/donorController';
import { useToast } from '../../../contexts/ToastContext';

const EditProfileView = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLocating, setIsLocating] = useState(false);

    const [formState, setFormState] = useState({
        email: '',
        phone: '',
        weight: '',
        maritalStatus: '',

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

        // Password Change
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    useEffect(() => {
        if (user?.id) {
            fetchDonorById(user.id).then(donor => {
                if (donor) {
                    setFormState(prev => ({
                        ...prev,
                        email: donor.email || '',
                        phone: donor.phone || '',
                        weight: donor.weight?.toString() || '',
                        maritalStatus: donor.maritalStatus || '',

                        region: donor.locationDetails?.region || donor.location || '',
                        city: donor.locationDetails?.city || '',
                        subCity: donor.locationDetails?.subCity || '',
                        woreda: donor.locationDetails?.woreda || '',
                        kebele: donor.locationDetails?.kebele || '',
                        street: donor.locationDetails?.street || '',
                        homeNumber: donor.locationDetails?.homeNumber || '',

                        location: donor.location || '',
                        latitude: donor.latitude || null,
                        longitude: donor.longitude || null,
                    }));
                    if (donor.profilePicture) {
                        setProfilePicture(donor.profilePicture);
                    }
                }
                setIsLoading(false);
            });
        }
    }, [user?.id]);

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

        // Password Validation
        if (formState.newPassword || formState.confirmNewPassword) {
            if (!formState.currentPassword) {
                toast.error('Please enter your current password to set a new one.');
                return;
            }
            if (formState.newPassword !== formState.confirmNewPassword) {
                toast.error('New passwords do not match!');
                return;
            }
            const passwordValidation = validatePassword(formState.newPassword);
            if (!passwordValidation.isValid) {
                toast.error(passwordValidation.message);
                return;
            }
        }

        if (!formState.location || !formState.latitude || !formState.longitude) {
            toast.error('Location (GPS) is required. Please use the "Get Location" button.');
            return;
        }

        try {
            if (!user?.id) throw new Error('User not found');

            const updateData = {
                ...formState,
                profilePicture: profilePicture || undefined,
            };

            await updateDonor(user.id, updateData);

            toast.success('Profile updated successfully!');
            // Clear password fields on success
            setFormState(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            }));

            // Optional: navigate away or stay
            // navigate('/donor-dashboard'); 
        } catch (error: any) {
            console.error('Update failed:', error);
            const msg = error.response?.data?.message || error.message || 'Failed to update profile';
            toast.error(msg);
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
            <h1 className="text-3xl font-bold text-slate-900 mb-8">{t('editProfile' as any) || 'Edit Profile'}</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-card border border-slate-100 space-y-6">
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        {profilePicture ? (
                            <img
                                src={profilePicture}
                                alt="Profile"
                                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                        ) : (
                            <div className="h-32 w-32 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg text-slate-400">
                                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        )}
                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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
                    <p className="mt-2 text-sm text-slate-500">Tap to change photo</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('emailAddress' as any) || 'Email Address'} <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="email"
                            value={formState.email}
                            onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
                            className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-4 transition ${formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10 bg-red-50'
                                : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                                }`}
                        />
                        {formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email) && (
                            <p className="text-red-500 text-xs mt-1">Example: amanuelbeyenee@gmail.com</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('phoneNumber' as any) || 'Phone Number'} <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="tel"
                            value={formState.phone}
                            onChange={(e) => setFormState(prev => ({ ...prev, phone: e.target.value.replace(/[^\d+]/g, '') }))}
                            className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-4 transition ${formState.phone && (formState.phone.length !== 10 && formState.phone.length !== 13)
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10 bg-red-50'
                                : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                                }`}
                            placeholder="+251 911 / 0911"
                        />
                        {formState.phone && (formState.phone.length !== 10 && formState.phone.length !== 13) && (
                            <p className="text-red-500 text-xs mt-1">Must be 10 or 13 digits.</p>
                        )}
                    </div>

                    {/* Weight */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Weight (Kg) <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="number"
                            min={45}
                            value={formState.weight}
                            onChange={(e) => setFormState(prev => ({ ...prev, weight: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                        />
                    </div>

                    {/* Marital Status */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('maritalStatus' as any) || 'Marital Status'} <span className="text-red-500">*</span></label>
                        <select
                            required
                            value={formState.maritalStatus}
                            onChange={(e) => setFormState(prev => ({ ...prev, maritalStatus: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                        >
                            <option value="">Select Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Widowed">Widowed</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Separated">Separated</option>
                        </select>
                    </div>

                    {/* Address Section */}
                    <div className="md:col-span-2 pt-4">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">{t('address' as any) || 'Address'}</h3>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Location (GPS) <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <input
                                required
                                type="text"
                                value={formState.location}
                                onChange={(e) => setFormState(prev => ({ ...prev, location: e.target.value }))}
                                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
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

                    {['region', 'city', 'subCity', 'woreda', 'kebele', 'street', 'homeNumber'].map((field) => (
                        <div key={field}>
                            <label className="block text-sm font-medium text-slate-700 mb-2 capitalize">{field === 'homeNumber' ? 'Home Number' : t(field as any) || field} {['region', 'city'].includes(field) && <span className="text-red-500">*</span>}</label>
                            <input
                                required={['region', 'city'].includes(field)}
                                type="text"
                                value={(formState as any)[field]}
                                onChange={(e) => setFormState(prev => ({ ...prev, [field]: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                            />
                        </div>
                    ))}

                    {/* Account Info - Change Password */}
                    <div className="md:col-span-2 pt-4">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Change Password</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                        <input
                            type="password"
                            value={formState.currentPassword}
                            onChange={(e) => setFormState(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                            placeholder="Enter to change password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                        <input
                            type="password"
                            value={formState.newPassword}
                            onChange={(e) => setFormState(prev => ({ ...prev, newPassword: e.target.value }))}
                            disabled={!formState.currentPassword}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition disabled:bg-slate-50 disabled:text-slate-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            value={formState.confirmNewPassword}
                            onChange={(e) => setFormState(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                            disabled={!formState.newPassword}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition disabled:bg-slate-50 disabled:text-slate-400"
                        />
                    </div>

                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-100 mt-6">
                    <button
                        type="submit"
                        className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-600/20"
                    >
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/donor-dashboard')}
                        className="flex-1 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfileView;
