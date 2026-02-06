import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { fetchStaff, fetchStaffById, deleteStaff, Staff } from '../../../controllers/staffController';

const ViewStaffView = () => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            setLoading(true);
            const data = await fetchStaff();
            setStaffList(data);
        } catch (error) {
            console.error("Failed to load staff", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewStaff = async (staff: Staff) => {
        try {
            // Optimistically show current data while loading
            setSelectedStaff(staff);
            // Fetch fresh data to trigger 'VIEW_STAFF' log in backend
            const detailedStaff = await fetchStaffById(staff.id);
            if (detailedStaff) {
                setSelectedStaff(detailedStaff);
            }
        } catch (error) {
            console.error("Failed to fetch staff details", error);
        }
    };

    const formatLocation = (staff: any): string => {
        // ... existing code ...

        if (staff.locationDetails) {
            const parts = [
                staff.locationDetails.region,
                staff.locationDetails.city,
                staff.locationDetails.subCity,
                staff.locationDetails.woreda,
                staff.locationDetails.kebele,
                staff.locationDetails.street,
                staff.locationDetails.homeNumber,
            ].filter(Boolean);
            return parts.join(', ') || staff.location || 'N/A';
        }
        return staff.city || staff.location || 'N/A';
    };

    const getFullAddress = (staff: any): string => {
        if (staff.locationDetails) {
            const parts: string[] = [];
            if (staff.locationDetails.region) parts.push(`${t('region')}: ${staff.locationDetails.region}`);
            if (staff.locationDetails.city) parts.push(`${t('city')}: ${staff.locationDetails.city}`);
            if (staff.locationDetails.subCity) parts.push(`${t('subCity')}: ${staff.locationDetails.subCity}`);
            if (staff.locationDetails.woreda) parts.push(`${t('woreda')}: ${staff.locationDetails.woreda}`);
            if (staff.locationDetails.kebele) parts.push(`${t('kebele')}: ${staff.locationDetails.kebele}`);
            if (staff.locationDetails.street) parts.push(`${t('street')}: ${staff.locationDetails.street}`);
            if (staff.locationDetails.homeNumber) parts.push(`${t('homeNumber')}: ${staff.locationDetails.homeNumber}`);
            return parts.join(' | ') || staff.location || 'N/A';
        }
        // Fallback for flat structure if needed, similar to Admin
        const parts: string[] = [];
        if (staff.region) parts.push(`${t('region')}: ${staff.region}`);
        if (staff.city) parts.push(`${t('city')}: ${staff.city}`);
        if (staff.subCity) parts.push(`${t('subCity')}: ${staff.subCity}`);
        return parts.join(' | ') || staff.location || 'N/A';
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            try {
                await deleteStaff(id);
                setStaffList(staffList.filter(s => s.id !== id));
                if (selectedStaff?.id === id) setSelectedStaff(null);
                toast.success('Staff deleted successfully');
            } catch (error) {
                console.error("Failed to delete staff", error);
                toast.error("Failed to delete staff member");
            }
        }
    };

    // Print Logic
    const [printStaff, setPrintStaff] = useState<Staff | null>(null);
    const [printMode, setPrintMode] = useState<'essential' | 'full'>('essential');

    const handlePrintClick = (staff: Staff) => {
        setPrintStaff(staff);
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
            <h2 className="text-2xl font-bold text-gray-900">View Staff</h2>

            {/* Print Modal */}
            {printStaff && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:absolute print:inset-0 print:p-0 print:overflow-visible print:max-h-none">
                        <button
                            onClick={() => setPrintStaff(null)}
                            className="absolute right-4 top-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 transition flex items-center justify-center h-10 w-10 z-10 print:hidden"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="text-center print:text-left space-y-4 pt-4">
                            <div className="mb-4 print:hidden">
                                <h2 className="text-xl font-bold text-gray-900 text-left">Print Staff Details</h2>
                            </div>

                            <div id="printable-area" className="bg-gray-50 rounded-xl p-6 text-left space-y-4 border border-gray-200 print:border-none print:bg-white print:p-0">
                                {/* Header with Profile & QR */}
                                <div className="flex justify-between items-start mb-6 border-b border-black pb-4">
                                    <div className="flex items-center gap-4">
                                        {printStaff.profilePicture ? (
                                            <img src={printStaff.profilePicture} className="h-24 w-24 rounded-full object-cover border border-gray-300" alt="Profile" />
                                        ) : (
                                            <div className="h-24 w-24 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 font-bold text-2xl">
                                                {printStaff.fullName?.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h1 className="text-2xl font-bold">{printStaff.fullName}</h1>
                                            <p className="text-gray-600">{printStaff.role.toUpperCase()}</p>
                                            <p className="text-sm text-gray-500">ID: {printStaff.id}</p>
                                        </div>
                                    </div>
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({ id: printStaff.id, name: printStaff.fullName, role: printStaff.role }))}`}
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
                                        {/* Assuming staff has username field matching interface update */}
                                        <span className="font-mono font-medium text-gray-900">{(printStaff as any).username || 'N/A'}</span>
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
                                        <span className="font-medium text-gray-900 break-all">{printStaff.email || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 block">Role</span>
                                        <span className="font-medium text-gray-900 capitalize">{printStaff.role}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 block">Phone</span>
                                        <span className="font-medium text-gray-900">{printStaff.phone || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 block">Landline</span>
                                        <span className="font-medium text-gray-900">{printStaff.landline || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 block">Gender</span>
                                        <span className="font-medium text-gray-900 capitalize">{(printStaff as any).gender || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 block">Status</span>
                                        <span className="font-medium text-gray-900 capitalize">{printStaff.status}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 block">Joined</span>
                                        <span className="font-medium text-gray-900">{printStaff.createdAt ? new Date(printStaff.createdAt).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Full Information Section */}
                                <div className={printMode === 'full' ? 'block' : 'hidden'}>
                                    <div className="mt-6 pt-4 border-t border-black">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Personal & Contact Information</h3>
                                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                                            <p><strong>Blood Type:</strong> {(printStaff as any).bloodType || 'N/A'}</p>
                                            <p><strong>Gender:</strong> {(printStaff as any).gender || 'N/A'}</p>
                                            <p><strong>Birth Date:</strong> {(printStaff as any).birthDate ? new Date((printStaff as any).birthDate).toLocaleDateString() : 'N/A'}</p>
                                            <p><strong>Age:</strong> {(printStaff as any).age || 'N/A'}</p>
                                            <p><strong>Marital Status:</strong> {(printStaff as any).maritalStatus || 'N/A'}</p>
                                            <p><strong>FAN:</strong> {(printStaff as any).fanNumber || 'N/A'}</p>
                                            <div className="col-span-2 mt-2">
                                                <strong>Address:</strong><br />
                                                {(printStaff as any).region}, {(printStaff as any).city}<br />
                                                {(printStaff as any).subCity}, {(printStaff as any).woreda}, {(printStaff as any).kebele}<br />
                                                {(printStaff as any).street}, House #{(printStaff as any).homeNumber}
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

            {selectedStaff && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-6">
                            {/* Profile Picture - Larger Display */}
                            <div className="flex-shrink-0">
                                {selectedStaff.profilePicture ? (
                                    <img
                                        src={selectedStaff.profilePicture}
                                        alt={selectedStaff.fullName}
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
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedStaff.fullName}</h3>
                                <p className="text-sm text-gray-600">Staff ID: {selectedStaff.id}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedStaff(null)}
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
                            <p className="font-medium">{selectedStaff.fullName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Username</p>
                            <p className="font-medium">@{(selectedStaff as any).username || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Role</p>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                {selectedStaff.role}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">{t('emailAddress')}</p>
                            <p className="font-medium">{selectedStaff.email || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">{t('phoneNumber')}</p>
                            <p className="font-medium">{selectedStaff.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Landline</p>
                            <p className="font-medium">{selectedStaff.landline || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Gender</p>
                            <p className="font-medium">{(selectedStaff as any).gender || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Blood Type</p>
                            <p className="font-medium text-red-600 font-bold">{(selectedStaff as any).bloodType || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Age</p>
                            <p className="font-medium">{(selectedStaff as any).age || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Birth Date</p>
                            <p className="font-medium">{(selectedStaff as any).birthDate ? new Date((selectedStaff as any).birthDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Marital Status</p>
                            <p className="font-medium">{(selectedStaff as any).maritalStatus || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedStaff.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}
                            >
                                {selectedStaff.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">FAN Number</p>
                            <p className="font-medium font-mono bg-gray-50 px-2 py-1 rounded inline-block">
                                {(selectedStaff as any).fanNumber || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Joined Date</p>
                            <p className="font-medium">
                                {selectedStaff.createdAt
                                    ? new Date(selectedStaff.createdAt).toLocaleDateString()
                                    : 'N/A'}
                            </p>
                        </div>
                        {/* Medical Info */}
                        <div className="md:col-span-3 pt-4 pb-2 border-b border-gray-100">
                            <h4 className="text-lg font-semibold text-gray-800">Medical Information</h4>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Medical Condition</p>
                            <p className="font-medium">{(selectedStaff as any).medicalCondition || 'None'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Disability</p>
                            <p className="font-medium">
                                {(selectedStaff as any).hasDisability === 'Yes'
                                    ? `Yes (${(selectedStaff as any).disabilityType || 'Unspecified'})`
                                    : 'No'}
                            </p>
                        </div>

                        {/* Address Info */}
                        <div className="md:col-span-3 pt-4 pb-2 border-b border-gray-100">
                            <h4 className="text-lg font-semibold text-gray-800">{t('address')}</h4>
                        </div>
                        <div className="md:col-span-3">
                            <p className="font-medium">{getFullAddress(selectedStaff)}</p>
                        </div>
                    </div>

                    {/* ID Cards */}
                    <div className="md:col-span-3 pt-4 pb-2 border-b border-gray-100 mt-4">
                        <h4 className="text-lg font-semibold text-gray-800">Identification Cards</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Front ID</p>
                            {(selectedStaff as any).idCardFront ? (
                                <div className="relative group">
                                    <img
                                        src={(selectedStaff as any).idCardFront}
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
                            {(selectedStaff as any).idCardBack ? (
                                <div className="relative group">
                                    <img
                                        src={(selectedStaff as any).idCardBack}
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
                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            onClick={() => {
                                navigate(`/admin/edit-staff/${selectedStaff.id}`);
                            }}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Staff
                        </button>
                        <button
                            onClick={() => setSelectedStaff(null)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Staff Members</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">{t('emailAddress')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">{t('phoneNumber')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Landline</th>

                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">{t('address')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        Loading staff...
                                    </td>
                                </tr>
                            ) : staffList.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No staff found.
                                    </td>
                                </tr>
                            ) : (
                                staffList.map((staff) => (
                                    <tr key={staff.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <div className="flex items-center gap-3">
                                                {staff.profilePicture ? (
                                                    <img
                                                        src={staff.profilePicture}
                                                        alt={staff.fullName}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <span>{staff.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{staff.email || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{staff.phone || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{staff.landline || 'N/A'}</td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                                {staff.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs hidden xl:table-cell">
                                            <div className="truncate" title={getFullAddress(staff)}>
                                                {formatLocation(staff)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm hidden lg:table-cell">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${staff.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {staff.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                                            <button
                                                onClick={() => handleViewStaff(staff)}
                                                className="text-purple-600 hover:text-purple-800 font-semibold"
                                            >
                                                {t('view')}
                                            </button>
                                            <button
                                                onClick={() => handlePrintClick(staff)}
                                                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                </svg>
                                                Print
                                            </button>
                                            {/* Edit/Delete if needed here too, ViewAdmins has them? ViewAdmins has selectedAdmin modal actions mostly but table has View/Print */}
                                            {/* ViewAdminsView has View and Print. Wait, ViewAdmins line 476: View, Print. No Edit/Delete in table? 
                                                Ah, ViewAdmins line 380 has "Edit Admin" button in the modal.
                                                But ViewStaffView original had Edit/Delete in table. I should KEEP Edit/Delete in table if user wants exact same as SuperAdmin or keep existing?
                                                User said "apply my all update from Super Admin page side bar Admin -> View Admin Details apply updates to Admin Page side bar Staff".
                                                SuperAdmin ViewAdmins only has View and Print in table. Edit/Delete are inside the View Modal.
                                                However, standard Admin table usually has actions.
                                                I will stick to View and Print in table to match ViewAdmins exactly as requested.
                                                Wait, ViewAdminsView lines 28-39 has `handleDelete` but it is NOT used in the table! It is logic that might be dead code or used in other context.
                                                Actually, let's keep it safe. I'll add View and Print to match ViewAdmins.
                                                But I'll keep Edit/Delete logic available if I need to restore it. 
                                                Actually, let's look at `ViewAdminsView.tsx` again.
                                                It has `handleDelete` defined but I don't see it used in the `return` JSX for the table. It only has View and Print buttons.
                                                So I will match that pattern.
                                              */}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ViewStaffView;
