import { useEffect, useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';

// Using Admin type from controller is better, but for now matching local state
import { Admin, deleteAdmin } from '../../../controllers/adminController';
import ConfirmationModal from '../../components/common/ConfirmationModal';



const DeleteAdminView = () => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

    // Confirmation Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: 'danger' | 'warning' | 'info' | 'success';
        confirmLabel?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger'
    });

    const openConfirmation = (
        title: string,
        message: string,
        onConfirm: () => void,
        type: 'danger' | 'warning' | 'info' | 'success' = 'danger',
        confirmLabel: string = 'Confirm'
    ) => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            onConfirm,
            type,
            confirmLabel
        });
    };

    useEffect(() => {
        const loadAdmins = async () => {
            try {
                // Dynamic import to avoid circular dependencies if any
                const { fetchAdmins } = await import('../../../controllers/adminController');
                const data = await fetchAdmins();
                // Filter out super_admin
                setAdmins(data.filter((admin: any) => admin.role !== 'super_admin'));
            } catch (error) {
                console.error("Failed to load admins", error);
            }
        };
        loadAdmins();
    }, []);

    const formatLocation = (admin: Admin): string => {
        return admin.city || 'N/A';
    };

    const getFullAddress = (admin: Admin): string => {
        const parts: string[] = [];
        if (admin.region) parts.push(`${t('region')}: ${admin.region}`);
        if (admin.city) parts.push(`${t('city')}: ${admin.city}`);
        if (admin.subCity) parts.push(`${t('subCity')}: ${admin.subCity}`);
        if (admin.woreda) parts.push(`${t('woreda')}: ${admin.woreda}`);
        if (admin.kebele) parts.push(`${t('kebele')}: ${admin.kebele}`);
        if (admin.street) parts.push(`${t('street')}: ${admin.street}`);
        if (admin.homeNumber) parts.push(`${t('homeNumber')}: ${admin.homeNumber}`);
        return parts.join(' | ') || admin.location || 'N/A';
    };

    const handleDelete = async (admin: Admin) => {

        openConfirmation(
            t('confirmDelete'),
            `${t('confirmDeleteDonor')} ${admin.fullName}? ${t('actionCannotBeUndone')}`,
            async () => {
                try {
                    await deleteAdmin(admin.id);
                    toast.success(`Admin ${admin.fullName} deleted successfully!`);
                    setAdmins((prev) => prev.filter((d) => d.id !== admin.id));
                    setSelectedAdmin(null);
                } catch (error) {
                    console.error("Delete failed", error);
                    toast.error("Failed to delete admin");
                }
            },
            'danger',
            t('delete')
        );
    };


    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Delete Admin Details</h2>

            {selectedAdmin && (
                <div className="bg-white rounded-lg shadow-sm border-2 border-red-300 p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-6">
                            {/* Profile Picture - Larger Display */}
                            <div className="flex-shrink-0">
                                {selectedAdmin.profilePicture ? (
                                    <img
                                        src={selectedAdmin.profilePicture}
                                        alt={selectedAdmin.fullName}
                                        className="h-32 w-32 rounded-full object-cover border-4 border-red-600 shadow-lg"
                                    />
                                ) : (
                                    <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300 shadow-lg">
                                        <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedAdmin.fullName}</h3>
                                <p className="text-sm text-red-600 font-semibold">{t('confirmDeleteMessage')}</p>
                                <p className="text-xs text-gray-500 mt-1">Admin ID: {selectedAdmin.id}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedAdmin(null)}
                            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-sm text-gray-600">{t('fullName')}</p>
                            <p className="font-medium">{selectedAdmin.fullName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Role</p>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                {selectedAdmin.role}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">{t('emailAddress')}</p>
                            <p className="font-medium">{selectedAdmin.email || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">{t('phoneNumber')}</p>
                            <p className="font-medium">{selectedAdmin.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Landline</p>
                            <p className="font-medium">{selectedAdmin.landline || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Gender</p>
                            <p className="font-medium capitalize">{selectedAdmin.gender || 'N/A'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">{t('address')}</p>
                            <p className="font-medium">{getFullAddress(selectedAdmin)}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleDelete(selectedAdmin)}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                        >
                            {t('confirmDelete')}
                        </button>
                        <button
                            onClick={() => setSelectedAdmin(null)}
                            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                            {t('cancel')}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Select Admin to Delete</h3>
                    <p className="text-sm text-gray-600 mt-1">{t('warningDeleteAction')}</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('emailAddress')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('phoneNumber')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Landline</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('address')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {admins.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No admins found.
                                    </td>
                                </tr>
                            ) : (
                                admins.map((admin) => (
                                    <tr key={admin.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <div className="flex items-center gap-3">
                                                {admin.profilePicture ? (
                                                    <img
                                                        src={admin.profilePicture}
                                                        alt={admin.fullName}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <span>{admin.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.phone || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.landline || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{admin.gender || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                            <div className="truncate" title={getFullAddress(admin)}>
                                                {formatLocation(admin)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => setSelectedAdmin(admin)}
                                                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                                            >
                                                {t('delete')}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmLabel={modalConfig.confirmLabel}
            />
        </div>
    );
};

export default DeleteAdminView;
