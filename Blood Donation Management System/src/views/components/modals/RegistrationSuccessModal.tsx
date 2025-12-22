import { useRef } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface RegistrationSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'donor' | 'hospital';
    data: {
        // Common fields
        phone: string;
        email: string;
        address: string;
        registrationDate: string;

        // Donor specific
        donorId?: string;
        lotteryId?: string;
        fullName?: string;
        bloodType?: string;
        medicalCondition?: string;

        // Hospital specific
        hospitalId?: string;
        hospitalName?: string;
        hospitalType?: string;
        contactDoctorName?: string;
        licenseNumber?: string;
    };
}

const RegistrationSuccessModal = ({ isOpen, onClose, type, data }: RegistrationSuccessModalProps) => {
    const { t } = useLanguage();
    const printRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    const isDonor = type === 'donor';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:bg-white print:p-0">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden print:shadow-none print:max-w-none print:w-full">

                {/* Printable Content Area */}
                <div ref={printRef} className="p-8 space-y-6 print:p-0">

                    {/* Header */}
                    <div className="text-center border-b border-dashed border-slate-300 pb-6 print:pb-4">
                        <div className="flex justify-center mb-4 print:mb-2">
                            <div className={`h-16 w-16 ${isDonor ? 'bg-primary' : 'bg-blue-600'} rounded-full flex items-center justify-center text-white text-2xl font-bold print:h-12 print:w-12 print:text-lg`}>
                                B
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 print:text-xl">BDMS Ethiopia</h2>
                        <p className="text-slate-500 print:text-sm">
                            {isDonor ? 'Official Donor Registration Card' : 'Official Hospital Registration Card'}
                        </p>
                    </div>

                    {/* IDs Section */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 print:bg-white print:border-black print:p-4">
                        {isDonor ? (
                            <>
                                <div className="text-center border-r border-slate-200 print:border-black">
                                    <p className="text-sm text-slate-500 uppercase tracking-wider print:text-black">Donor ID</p>
                                    <p className="text-2xl font-mono font-bold text-primary mt-1 print:text-black">{data.donorId}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-slate-500 uppercase tracking-wider print:text-black">Lottery ID</p>
                                    <p className="text-2xl font-mono font-bold text-purple-600 mt-1 print:text-black">{data.lotteryId}</p>
                                </div>
                            </>
                        ) : (
                            <div className="col-span-2 text-center">
                                <p className="text-sm text-slate-500 uppercase tracking-wider print:text-black">Hospital ID</p>
                                <p className="text-3xl font-mono font-bold text-blue-600 mt-1 print:text-black">{data.hospitalId}</p>
                            </div>
                        )}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm print:grid-cols-2 print:text-black">
                        {isDonor ? (
                            <>
                                <div>
                                    <span className="block text-slate-500 font-medium print:text-black">Full Name</span>
                                    <span className="block text-slate-900 font-semibold text-lg print:text-black">{data.fullName}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-500 font-medium print:text-black">Blood Type</span>
                                    <span className="block text-red-600 font-bold text-lg print:text-black">{data.bloodType}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="col-span-2">
                                    <span className="block text-slate-500 font-medium print:text-black">Hospital Name</span>
                                    <span className="block text-slate-900 font-semibold text-xl print:text-black">{data.hospitalName}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-500 font-medium print:text-black">Hospital Type</span>
                                    <span className="block text-slate-900 font-semibold print:text-black">{data.hospitalType}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-500 font-medium print:text-black">License Number</span>
                                    <span className="block text-slate-900 font-mono print:text-black">{data.licenseNumber}</span>
                                </div>
                                {data.contactDoctorName && (
                                    <div className="col-span-2">
                                        <span className="block text-slate-500 font-medium print:text-black">Contact Doctor</span>
                                        <span className="block text-slate-900 print:text-black">{data.contactDoctorName}</span>
                                    </div>
                                )}
                            </>
                        )}

                        <div>
                            <span className="block text-slate-500 font-medium print:text-black">Phone Number</span>
                            <span className="block text-slate-900 print:text-black">{data.phone}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-medium print:text-black">Email</span>
                            <span className="block text-slate-900 print:text-black">{data.email}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="block text-slate-500 font-medium print:text-black">Address</span>
                            <span className="block text-slate-900 print:text-black">{data.address}</span>
                        </div>

                        {isDonor && data.medicalCondition && (
                            <div className="col-span-2">
                                <span className="block text-slate-500 font-medium print:text-black">Medical Condition</span>
                                <span className="block text-slate-900 print:text-black">{data.medicalCondition}</span>
                            </div>
                        )}

                        <div className="col-span-2 pt-4 border-t border-slate-100 print:border-black">
                            <span className="block text-slate-500 font-medium print:text-black">Registration Date</span>
                            <span className="block text-slate-900 print:text-black">{data.registrationDate}</span>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-xs text-slate-400 print:text-black print:mt-4">
                        <p>Thank you for saving lives! Keep this card for your records.</p>
                        <p>Blood Donation Management System - Ethiopia</p>
                    </div>
                </div>

                {/* Action Buttons (Hidden when printing) */}
                <div className="flex gap-4 p-6 bg-slate-50 border-t border-slate-100 print:hidden">
                    <button
                        onClick={handlePrint}
                        className={`flex-1 rounded-xl ${isDonor ? 'bg-primary hover:bg-primary-dark' : 'bg-blue-600 hover:bg-blue-700'} py-3 text-white font-semibold transition flex items-center justify-center gap-2`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print Card
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl bg-white border border-slate-300 py-3 text-slate-700 font-semibold hover:bg-slate-50 transition"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Tailwind Print Styles */}
            <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed.inset-0 {
            position: absolute;
            background: white;
            padding: 0;
            display: block;
          }
           /* Hide other modals or overlays if any */
          
          /* Specifically target the modal content to show */
          .fixed.inset-0 .w-full {
             visibility: visible;
             position: absolute;
             left: 0;
             top: 0;
             width: 100%;
             margin: 0;
             box-shadow: none;
          }
          
          /* Make all children of the modal content visible */
          .fixed.inset-0 .w-full * {
            visibility: visible;
          }

          /* Explicitly hide the button area again just in case */
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
        </div>
    );
};

export default RegistrationSuccessModal;
