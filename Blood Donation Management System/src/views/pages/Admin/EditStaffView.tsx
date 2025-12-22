import { FormEvent, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';

const EditStaffView = () => {
    const { id } = useParams();
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [formState, setFormState] = useState({
        fullName: 'Abebe Kebede',
        role: 'Nurse',
        phone: '+251 911 000 001',
        email: 'abebe.k@example.com',
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        subCity: 'Arada',
        woreda: '01',
        kebele: '04',
        street: 'King George VI St',
        homeNumber: '202',
        status: 'active',
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
        alert('Staff details updated successfully! Backend integration coming soon.');
    };

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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('fullName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="text"
                                value={formState.fullName}
                                onChange={(e) => setFormState((prev) => ({ ...prev, fullName: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
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
                                <option value="Nurse">Nurse</option>
                                <option value="Lab Technician">Lab Technician</option>
                                <option value="Receptionist">Receptionist</option>
                                <option value="Staff">Staff</option>
                            </select>
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
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                placeholder={t('enterPhoneNumber')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('emailAddress')}</label>
                            <input
                                type="email"
                                value={formState.email}
                                onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                placeholder={t('enterEmail')}
                            />
                        </div>

                        <div>
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

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
                        >
                            Update Staff
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

export default EditStaffView;
