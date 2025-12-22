import { FormEvent, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';

import { createAdmin } from '../../../controllers/adminController';

const AddAdminView = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    const [formState, setFormState] = useState({
        fullName: '',
        role: 'admin',
        bloodType: '',
        birthDate: '',
        age: '',
        maritalStatus: '',
        fanNumber: '',
        username: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
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

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (formState.password !== formState.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            await createAdmin({
                ...formState,
                profilePicture
            });
            alert('Admin added successfully!');
            navigate('/view-admins');
        } catch (error: any) {
            console.error('Failed to create admin:', error);
            alert(error.response?.data?.message || 'Failed to create admin');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Add Admin</h1>

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
                    <p className="mt-2 text-sm text-slate-500">{t('uploadProfilePicture')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('fullName')} <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="text"
                            value={formState.fullName}
                            onChange={(e) => setFormState(prev => ({ ...prev, fullName: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition"
                            placeholder={t('enterFullName')}
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('phoneNumber')} <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="tel"
                            value={formState.phone}
                            onChange={(e) => setFormState(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition"
                            placeholder={t('enterPhoneNumber')}
                        />
                    </div>

                    {/* Blood Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('bloodType' as any) || 'Blood Type'} <span className="text-red-500">*</span></label>
                        <select
                            required
                            value={formState.bloodType}
                            onChange={(e) => setFormState(prev => ({ ...prev, bloodType: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition"
                        >
                            <option value="">Select Blood Type</option>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {/* Birth Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('birthDate' as any) || 'Birth Date'} <span className="text-red-500">*</span></label>
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
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition"
                        />
                    </div>

                    {/* Age */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('age' as any) || 'Age'} <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="number"
                            value={formState.age}
                            onChange={(e) => setFormState(prev => ({ ...prev, age: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition"
                        />
                    </div>

                    {/* Marital Status */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Marital Status <span className="text-red-500">*</span></label>
                        <select
                            required
                            value={formState.maritalStatus}
                            onChange={(e) => setFormState(prev => ({ ...prev, maritalStatus: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition"
                        >
                            <option value="">Select Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Widowed">Widowed</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Separated">Separated</option>
                        </select>
                    </div>

                    {/* FAN Number */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">FAN Number <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="text"
                            maxLength={16}
                            value={formState.fanNumber}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setFormState(prev => ({ ...prev, fanNumber: val }));
                            }}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition"
                        />
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('emailAddress')}</label>
                        <input
                            type="email"
                            value={formState.email}
                            onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition"
                            placeholder={t('enterEmail')}
                        />
                    </div>

                    {/* Address Section */}
                    <div className="md:col-span-2 pt-4">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">{t('address')}</h3>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Location (GPS)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={formState.location}
                                onChange={(e) => setFormState(prev => ({ ...prev, location: e.target.value }))}
                                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 focus:border-purple-500 focus:outline-none"
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
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('region')} <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="text"
                            value={formState.region}
                            onChange={(e) => setFormState(prev => ({ ...prev, region: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition"
                            placeholder={t('enterRegion')}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('city')} <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="text"
                            value={formState.city}
                            onChange={(e) => setFormState(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition"
                            placeholder={t('enterCity')}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('subCity')}</label>
                        <input
                            type="text"
                            value={formState.subCity}
                            onChange={(e) => setFormState(prev => ({ ...prev, subCity: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition"
                            placeholder={t('enterSubCity')}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('woreda')}</label>
                        <input
                            type="text"
                            value={formState.woreda}
                            onChange={(e) => setFormState(prev => ({ ...prev, woreda: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition"
                            placeholder={t('enterWoreda')}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('kebele')}</label>
                        <input
                            type="text"
                            value={formState.kebele}
                            onChange={(e) => setFormState(prev => ({ ...prev, kebele: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition"
                            placeholder={t('enterKebele')}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('street')}</label>
                        <input
                            type="text"
                            value={formState.street}
                            onChange={(e) => setFormState(prev => ({ ...prev, street: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition"
                            placeholder={t('enterStreet')}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('homeNumber')}</label>
                        <input
                            type="text"
                            value={formState.homeNumber}
                            onChange={(e) => setFormState(prev => ({ ...prev, homeNumber: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition"
                            placeholder={t('enterHomeNumber')}
                        />
                    </div>

                    {/* Account Info */}
                    <div className="md:col-span-2 pt-4">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Account Information</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('username' as any) || 'Username'} <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="text"
                            value={formState.username}
                            onChange={(e) => setFormState(prev => ({ ...prev, username: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition"
                            placeholder={t('enterUsername' as any) || 'Enter Username'}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('password' as any) || 'Password'} <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="password"
                            value={formState.password}
                            onChange={(e) => setFormState(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition"
                            placeholder={t('enterPassword' as any) || 'Enter Password'}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="password"
                            value={formState.confirmPassword}
                            onChange={(e) => setFormState(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition"
                            placeholder="Confirm Password"
                        />
                    </div>

                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-100 mt-6">
                    <button
                        type="submit"
                        className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-600/20"
                    >
                        Add Admin
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/super-admin')}
                        className="flex-1 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition"
                    >
                        {t('cancel')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddAdminView;
