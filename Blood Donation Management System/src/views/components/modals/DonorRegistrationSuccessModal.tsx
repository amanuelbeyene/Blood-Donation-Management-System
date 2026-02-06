import { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface DonorRegistrationSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        donorId: string;
        lotteryId: string;
        fullName: string;
        username: string;
        password?: string; // Optional if we want to show it
        phone: string;
        email?: string;
        bloodType: string;
        medicalCondition?: string;
        address: string;
        registrationDate: string;
        profilePicture?: string | null;
    };
}

const DonorRegistrationSuccessModal = ({ isOpen, onClose, data }: DonorRegistrationSuccessModalProps) => {
    const { t } = useLanguage();
    const [printMode, setPrintMode] = useState<'essential' | 'full'>('full');

    if (!isOpen) return null;

    const qrData = JSON.stringify({
        id: data.donorId,
        lotteryId: data.lotteryId,
        username: data.username,
        name: data.fullName,
        role: 'donor'
    });

    // Quick QR code generation using a public API (same as Admin view)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

    const handlePrint = (mode: 'essential' | 'full') => {
        if (printMode !== mode) {
            setPrintMode(mode);
            // Allow state to update before printing
            setTimeout(() => {
                window.print();
            }, 100);
        } else {
            window.print();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:absolute print:inset-0 print:p-0 print:overflow-visible print:max-h-none">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 transition flex items-center justify-center h-10 w-10 z-10 print:hidden"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="text-center print:text-left space-y-4 pt-4">
                    <div className="flex justify-center mb-4 print:hidden">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 print:text-3xl print:mb-6">Registration Submitted</h2>
                    <p className="text-gray-600 print:hidden">{t('registrationPendingApproval' as any) || 'The donor registration has been submitted successfully and is pending approval by an Admin.'}</p>

                    <div id="printable-area" className="bg-gray-50 rounded-xl p-6 text-left space-y-4 border border-gray-200 print:border-none print:bg-white print:p-0">
                        {/* Header with Profile & QR - Visible in Print */}
                        <div className="hidden print:flex justify-between items-start mb-6 border-b border-black pb-4">
                            <div className="flex items-center gap-4">
                                {data.profilePicture ? (
                                    <img src={data.profilePicture} className="h-24 w-24 rounded-full object-cover border border-gray-300" alt="Profile" />
                                ) : (
                                    <div className="h-24 w-24 rounded-full bg-gray-200 border border-gray-300"></div>
                                )}
                                <div>
                                    <h1 className="text-2xl font-bold">{data.fullName}</h1>
                                    <p className="text-gray-600">DONOR ID: {data.donorId}</p>
                                </div>
                            </div>
                            <img src={qrCodeUrl} alt="QR Code" className="h-24 w-24" />
                        </div>

                        <div className="border-b border-gray-200 pb-2 mb-2 print:border-black">
                            <h3 className="text-lg font-semibold text-gray-800">Account Credentials</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-gray-500 block">Username</span>
                                <span className="font-mono font-medium text-gray-900">{data.username}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">Temp Password</span>
                                <span className="font-mono font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-200">{data.password}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">Lottery ID</span>
                                {data.lotteryId && data.lotteryId !== 'PENDING' ? (
                                    <span className="font-bold text-red-600 underline text-lg">{data.lotteryId}</span>
                                ) : (
                                    <span className="font-bold text-gray-400 text-lg">-</span>
                                )}
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">Phone</span>
                                <span className="font-medium text-gray-900">{data.phone}</span>
                            </div>
                        </div>

                        {/* Full Information Section - Conditional Render based on printMode */}
                        {printMode === 'full' && (
                            <div className="mt-6 pt-4 border-t border-black">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Details</h3>
                                <div className="grid grid-cols-2 gap-y-2 text-sm">
                                    <p><strong>Blood Type:</strong> {data.bloodType}</p>
                                    <p><strong>Medical:</strong> {data.medicalCondition || 'None'}</p>
                                    <p><strong>Address:</strong> {data.address}</p>
                                    <p><strong>Registered:</strong> {data.registrationDate}</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 flex items-start mt-4 print:mt-4">
                            <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>
                                <strong>Security Notice:</strong> Please change your password immediately upon your first login. Keep your Lottery ID safe for record-keeping.
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-6 print:hidden border-t border-gray-100 mt-4">
                        <button
                            onClick={() => handlePrint('full')}
                            className={`flex-1 px-2 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm ${printMode === 'full' ? 'bg-primary text-white hover:bg-primary-dark ring-2 ring-offset-2 ring-primary' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            {printMode === 'full' ? 'Print Full' : 'Preview Full'}
                        </button>
                        <button
                            onClick={() => handlePrint('essential')}
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
                            background: white;
                            padding: 2rem;
                        }
                    }
                `}</style>
        </div>
    );
};

export default DonorRegistrationSuccessModal;
