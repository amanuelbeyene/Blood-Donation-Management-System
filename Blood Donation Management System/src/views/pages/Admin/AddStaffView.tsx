import { FormEvent, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';

const AddStaffView = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    // Initial empty state
    const [formState, setFormState] = useState({
        fullName: '',
        email: '',
        phone: '',
        bloodType: '',
        birthDate: '',
        age: '',
        maritalStatus: '',
        fanNumber: '',
        username: '',
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
        // Medical
        medicalCondition: '',
        hasDisability: '',
        disabilityType: '',
        role: 'Staff',
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

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (formState.password !== formState.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        // Here you would call addStaff(formState)
        console.log('Adding Staff:', formState);
        alert('Staff added successfully!');
        navigate('/admin');
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">{t('addStaff' as any) || 'Add Staff'}</h1>

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
                    <p className="mt-2 text-sm text-slate-500">{t('uploadProfilePicture' as any) || 'Upload Profile Picture'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('fullName' as any) || 'Full Name'} <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="text"
                            value={formState.fullName}
                            onChange={(e) => setFormState(prev => ({ ...prev, fullName: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Role <span className="text-red-500">*</span></label>
                        <select
                            required
                            disabled
                            value={formState.role}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                        >
                            <option value="Staff">Staff</option>
                        </select>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('emailAddress' as any) || 'Email Address'} <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="email"
                            value={formState.email}
                            onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('phoneNumber' as any) || 'Phone Number'} <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="tel"
                            value={formState.phone}
                            onChange={(e) => setFormState(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                        />
                    </div>

                    {/* Blood Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('bloodType' as any) || 'Blood Type'} <span className="text-red-500">*</span></label>
                        <select
                            required
                            value={formState.bloodType}
                            onChange={(e) => setFormState(prev => ({ ...prev, bloodType: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
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
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
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
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                        />
                    </div>

                    {/* Marital Status */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Marital Status <span className="text-red-500">*</span></label>
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
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                        />
                    </div>

                    {/* Address Section */}
                    <div className="md:col-span-2 pt-4">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">{t('address' as any) || 'Address'}</h3>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Location (GPS)</label>
                        <div className="flex gap-2">
                            <input
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

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('region' as any) || 'Region'} <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="text"
                            value={formState.region}
                            onChange={(e) => setFormState(prev => ({ ...prev, region: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('city' as any) || 'City'} <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="text"
                            value={formState.city}
                            onChange={(e) => setFormState(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('subCity' as any) || 'Sub-City'}</label>
                        <input
                            type="text"
                            value={formState.subCity}
                            onChange={(e) => setFormState(prev => ({ ...prev, subCity: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('woreda' as any) || 'Woreda'}</label>
                        <input
                            type="text"
                            value={formState.woreda}
                            onChange={(e) => setFormState(prev => ({ ...prev, woreda: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('kebele' as any) || 'Kebele'}</label>
                        <input
                            type="text"
                            value={formState.kebele}
                            onChange={(e) => setFormState(prev => ({ ...prev, kebele: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('street' as any) || 'Street'}</label>
                        <input
                            type="text"
                            value={formState.street}
                            onChange={(e) => setFormState(prev => ({ ...prev, street: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('homeNumber' as any) || 'Home Number'}</label>
                        <input
                            type="text"
                            value={formState.homeNumber}
                            onChange={(e) => setFormState(prev => ({ ...prev, homeNumber: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                        />
                    </div>


                    {/* Medical Condition & Disability */}
                    <div className="md:col-span-2 pt-4">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Medical & Disability Info</h3>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('medicalCondition' as any) || 'Medical Condition'}</label>
                        <select
                            value={formState.medicalCondition}
                            onChange={(e) => setFormState(prev => ({ ...prev, medicalCondition: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
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
                        <label className="block text-sm font-medium text-slate-700 mb-2">Has Disabilities?</label>
                        <select
                            value={formState.hasDisability}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFormState(prev => ({
                                    ...prev,
                                    hasDisability: val,
                                    disabilityType: val === 'No' ? '' : prev.disabilityType
                                }));
                            }}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                        >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>

                    {formState.hasDisability === 'Yes' && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Disabilities List</label>
                            <select
                                value={formState.disabilityType}
                                onChange={(e) => setFormState(prev => ({ ...prev, disabilityType: e.target.value }))}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                            >
                                <option value="">Select Disability</option>
                                <option value="Physical">Physical</option>
                                <option value="Mobility Issues">Mobility Issues</option>
                                <option value="Blindness">Blindness</option>
                                <option value="Deafness">Deafness</option>
                            </select>
                        </div>
                    )}


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
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('password' as any) || 'Password'} <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="password"
                            value={formState.password}
                            onChange={(e) => setFormState(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                        />
                    </div>



                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="password"
                            value={formState.confirmPassword}
                            onChange={(e) => setFormState(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                        />
                    </div>

                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-100 mt-6">
                    <button
                        type="submit"
                        className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-600/20"
                    >
                        {t('addStaff' as any) || 'Add Staff'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        className="flex-1 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition"
                    >
                        {t('cancel' as any) || 'Cancel'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddStaffView;
