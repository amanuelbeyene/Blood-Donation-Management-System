import { useEffect, useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { fetchAdmins, deleteAdmin, Admin } from '../../../controllers/adminController';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const ViewAdminsView = () => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

    const [loading, setLoading] = useState(true);

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

    const loadAdmins = async () => {
        try {
            setLoading(true);
            const data = await fetchAdmins();
            // Filter out super_admin to prevent self-deletion or managing other super admins
            setAdmins(data.filter(admin => admin.role !== 'super_admin'));
        } catch (err) {
            console.error("Failed to load admins", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdmins();
    }, []);

    const handleDelete = async (id: string) => {
        openConfirmation(
            "Delete Admin",
            "Are you sure you want to delete this admin? This action cannot be undone.",
            async () => {
                try {
                    await deleteAdmin(id);
                    setAdmins(admins.filter(admin => admin.id !== id));
                    if (selectedAdmin?.id === id) setSelectedAdmin(null);
                    toast.success('Admin deleted successfully');
                } catch (err) {
                    console.error("Failed to delete admin", err);
                    toast.error('Failed to delete admin');
                }
            },
            'danger',
            'Delete Admin'
        );
    };

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

    // Print Logic
    const [printAdmin, setPrintAdmin] = useState<Admin | null>(null);
    const [printMode, setPrintMode] = useState<'essential' | 'full'>('essential');

    const handlePrintClick = (admin: Admin) => {
        setPrintAdmin(admin);
    };

    const executePrint = (mode: 'essential' | 'full') => {
        if (printMode !== mode) {
            setPrintMode(mode);
        } else {
            setTimeout(() => {
                window.print();
            }, 100);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">View Admins</h2>

            {/* Print Modal */}
            {printAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:absolute print:inset-0 print:p-0 print:overflow-visible print:max-h-none">
                        <button
                            onClick={() => setPrintAdmin(null)}
                            className="absolute right-4 top-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 transition flex items-center justify-center h-10 w-10 z-10 print:hidden"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="text-center print:text-left space-y-4 pt-4">
                            <div className="mb-4 print:hidden">
                                <h2 className="text-xl font-bold text-gray-900 text-left">Print Admin Details</h2>
                            </div>

                            <div id="printable-area" className="bg-gray-50 rounded-xl p-6 text-left space-y-4 border border-gray-200 print:border-none print:bg-white print:p-0">
                                {/* Header with Profile & QR */}
                                <div className="flex justify-between items-start mb-6 border-b border-black pb-4">
                                    <div className="flex items-center gap-4">
                                        {printAdmin.profilePicture ? (
                                            <img src={printAdmin.profilePicture} className="h-24 w-24 rounded-full object-cover border border-gray-300" alt="Profile" />
                                        ) : (
                                            <div className="h-24 w-24 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 font-bold text-2xl">
                                                {printAdmin.fullName?.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h1 className="text-2xl font-bold">{printAdmin.fullName}</h1>
                                            <p className="text-gray-600">{printAdmin.role.toUpperCase()}</p>
                                            <p className="text-sm text-gray-500">ID: {printAdmin.id}</p>
                                        </div>
                                    </div>
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({ id: printAdmin.id, name: printAdmin.fullName, role: printAdmin.role }))}`}
                                        alt="QR Code"
                                        className="h-24 w-24"
                                    />
                                </div>

                                <div className="border-b border-gray-200 pb-2 mb-2 print:border-black">
                                    <h3 className="text-lg font-semibold text-gray-800">Account Info</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-500 block">Username</span>
                                        <span className="font-mono font-medium text-gray-900">{printAdmin.username}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 block">Password</span>
                                        <span className="font-mono font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-200">12345678</span>
                                        <span className="text-red-600 text-xs font-bold block mt-1">
                                            the password must change after first login
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 block">Email</span>
                                        <span className="font-medium text-gray-900 break-all">{printAdmin.email || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 block">Role</span>
                                        <span className="font-medium text-gray-900 capitalize">{printAdmin.role}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 block">Phone</span>
                                        <span className="font-medium text-gray-900">{printAdmin.phone || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 block">Landline</span>
                                        <span className="font-medium text-gray-900">{printAdmin.landline || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 block">Gender</span>
                                        <span className="font-medium text-gray-900 capitalize">{printAdmin.gender || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 block">Status</span>
                                        <span className="font-medium text-gray-900 capitalize">{printAdmin.status}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 block">Joined</span>
                                        <span className="font-medium text-gray-900">{printAdmin.createdAt ? new Date(printAdmin.createdAt).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Full Information Section */}
                                <div className={printMode === 'full' ? 'block' : 'hidden'}>
                                    <div className="mt-6 pt-4 border-t border-black">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Personal & Contact Information</h3>
                                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                                            <p><strong>Blood Type:</strong> {printAdmin.bloodType || 'N/A'}</p>
                                            <p><strong>Gender:</strong> {printAdmin.gender || 'N/A'}</p>
                                            <p><strong>Birth Date:</strong> {printAdmin.birthDate ? new Date(printAdmin.birthDate).toLocaleDateString() : 'N/A'}</p>
                                            <p><strong>Age:</strong> {printAdmin.age || 'N/A'}</p>
                                            <p><strong>Marital Status:</strong> {printAdmin.maritalStatus || 'N/A'}</p>
                                            <p><strong>FAN:</strong> {printAdmin.fanNumber || 'N/A'}</p>
                                            <div className="col-span-2 mt-2">
                                                <strong>Address:</strong><br />
                                                {printAdmin.region}, {printAdmin.city}<br />
                                                {printAdmin.subCity}, {printAdmin.woreda}, {printAdmin.kebele}<br />
                                                {printAdmin.street}, House #{printAdmin.homeNumber}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-6 print:hidden border-t border-gray-100 mt-4">
                                <button
                                    onClick={() => executePrint('full')}
                                    className={`flex-1 px-2 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm ${printMode === 'full' ? 'bg-purple-600 text-white hover:bg-purple-700 ring-2 ring-offset-2 ring-purple-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    {printMode === 'full' ? 'Print Full' : 'Preview Full'}
                                </button>
                                <button
                                    onClick={() => executePrint('essential')}
                                    className={`flex-1 px-2 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm ${printMode === 'essential' ? 'bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-offset-2 ring-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {printMode === 'essential' ? 'Print Essential' : 'Preview Essential'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-area, #printable-area * {
                        visibility: visible;
                    }
                    #printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        background: white;
                        padding: 0;
                        margin: 0;
                    }
                    /* Ensure background colors/images print */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            {/* Existing selectedAdmin View Modal */}
            {
                selectedAdmin && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-6">
                                {/* Profile Picture - Larger Display */}
                                <div className="flex-shrink-0">
                                    {selectedAdmin.profilePicture ? (
                                        <img
                                            src={selectedAdmin.profilePicture}
                                            alt={selectedAdmin.fullName}
                                            className="h-32 w-32 rounded-full object-cover border-4 border-purple-600 shadow-lg"
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
                                    <p className="text-sm text-gray-600">Admin ID: {selectedAdmin.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedAdmin(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Personal Info */}
                            <div className="md:col-span-3 pb-2 border-b border-gray-100">
                                <h4 className="text-lg font-semibold text-gray-800">Personal Information</h4>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">{t('fullName')}</p>
                                <p className="font-medium">{selectedAdmin.fullName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Username</p>
                                <p className="font-medium">@{selectedAdmin.username || 'N/A'}</p>
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
                                <p className="font-medium font-mono">{selectedAdmin.landline || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Gender</p>
                                <p className="font-medium text-gray-900 capitalize">{selectedAdmin.gender || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Blood Type</p>
                                <p className="font-medium text-red-600 font-bold">{selectedAdmin.bloodType || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Age</p>
                                <p className="font-medium">{selectedAdmin.age || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Birth Date</p>
                                <p className="font-medium">{selectedAdmin.birthDate ? new Date(selectedAdmin.birthDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Marital Status</p>
                                <p className="font-medium">{selectedAdmin.maritalStatus || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedAdmin.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {selectedAdmin.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">FAN Number</p>
                                <p className="font-medium font-mono bg-gray-50 px-2 py-1 rounded inline-block">
                                    {selectedAdmin.fanNumber || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Joined Date</p>
                                <p className="font-medium">
                                    {selectedAdmin.createdAt
                                        ? new Date(selectedAdmin.createdAt).toLocaleDateString()
                                        : 'N/A'}
                                </p>
                            </div>

                            {/* Address Info */}
                            <div className="md:col-span-3 pt-4 pb-2 border-b border-gray-100">
                                <h4 className="text-lg font-semibold text-gray-800">{t('address')}</h4>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Location (GPS)</p>
                                <p className="font-medium font-mono text-xs mt-1 bg-gray-50 p-1 rounded inline-block">{selectedAdmin.location || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">{t('region')}</p>
                                <p className="font-medium">{selectedAdmin.region || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">{t('city')}</p>
                                <p className="font-medium">{selectedAdmin.city || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">{t('subCity')}</p>
                                <p className="font-medium">{selectedAdmin.subCity || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">{t('woreda')}</p>
                                <p className="font-medium">{selectedAdmin.woreda || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">{t('kebele')}</p>
                                <p className="font-medium">{selectedAdmin.kebele || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">{t('street')}</p>
                                <p className="font-medium">{selectedAdmin.street || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">{t('homeNumber')}</p>
                                <p className="font-medium">{selectedAdmin.homeNumber || 'N/A'}</p>
                            </div>
                        </div>

                        {/* ID Cards */}
                        <div className="md:col-span-3 pt-4 pb-2 border-b border-gray-100 mt-4">
                            <h4 className="text-lg font-semibold text-gray-800">Identification Cards</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Front ID</p>
                                {(selectedAdmin as any).idCardFront ? (
                                    <div className="relative group">
                                        <img
                                            src={(selectedAdmin as any).idCardFront}
                                            alt="Front ID"
                                            className="w-full h-auto object-contain rounded-lg border border-gray-200 bg-gray-50"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-48 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                                        </svg>
                                        <p className="text-sm">No Front ID</p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Back ID</p>
                                {(selectedAdmin as any).idCardBack ? (
                                    <div className="relative group">
                                        <img
                                            src={(selectedAdmin as any).idCardBack}
                                            alt="Back ID"
                                            className="w-full h-auto object-contain rounded-lg border border-gray-200 bg-gray-50"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-48 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                                        </svg>
                                        <p className="text-sm">No Back ID</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    /* Redirect to Edit Page */
                                    window.location.href = `/super-admin/edit-admin/${selectedAdmin.id}`;
                                }}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Admin
                            </button>
                            <button
                                onClick={() => setSelectedAdmin(null)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )
            }

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Admins</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">{t('emailAddress')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">{t('phoneNumber')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Landline</th>

                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">{t('address')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        Loading admins...
                                    </td>
                                </tr>
                            ) : admins.length === 0 ? (
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{admin.email || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{admin.phone || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{admin.landline || 'N/A'}</td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs hidden md:table-cell">
                                            <div className="truncate" title={getFullAddress(admin)}>
                                                {formatLocation(admin)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm hidden md:table-cell">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${admin.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {admin.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                            <button
                                                onClick={() => setSelectedAdmin(admin)}
                                                className="text-purple-600 hover:text-purple-800 font-semibold"
                                            >
                                                {t('view')}
                                            </button>
                                            <button
                                                onClick={() => handlePrintClick(admin)}
                                                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                </svg>
                                                Print
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

export default ViewAdminsView;
