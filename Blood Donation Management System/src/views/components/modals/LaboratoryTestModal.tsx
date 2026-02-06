import React, { useState, useEffect } from 'react';

interface LaboratoryTestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (result: { passed: boolean; reason?: string }) => void;
    donorName: string;
}

const LaboratoryTestModal: React.FC<LaboratoryTestModalProps> = ({ isOpen, onClose, onConfirm, donorName }) => {
    const [medicalCondition, setMedicalCondition] = useState<'Pass' | 'Fail' | null>(null);
    const [bloodTest, setBloodTest] = useState<'Pass' | 'Fail' | null>(null);
    const [failReason, setFailReason] = useState('');
    const [showFailInput, setShowFailInput] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setMedicalCondition(null);
            setBloodTest(null);
            setFailReason('');
            setShowFailInput(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleMainPass = () => {
        if (medicalCondition === 'Pass' && bloodTest === 'Pass') {
            onConfirm({ passed: true });
        } else {
            // Shake effect or toast ideally, but alert is fine for now
            alert("Both checks must be 'PASS' to report a successful donation.");
        }
    };

    const handleMainFail = () => {
        setShowFailInput(true);
    };

    const submitFailure = () => {
        if (!failReason.trim()) {
            alert('Please provide a reason for failure.');
            return;
        }
        onConfirm({ passed: false, reason: failReason });
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-700 to-red-600 px-6 py-5 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-wide">Laboratory Screening</h2>
                        <p className="text-red-100 text-sm mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-1 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            {donorName}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6">
                    {!showFailInput ? (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                                <p className="text-sm text-blue-700">
                                    Perform the preliminary checks below. Both must pass for the donor to proceed.
                                </p>
                            </div>

                            {/* Medical Condition Row */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <span className="font-semibold text-gray-700 text-lg">Medical History</span>
                                </div>
                                <div className="flex rounded-lg bg-gray-200 p-1">
                                    <button
                                        onClick={() => setMedicalCondition('Pass')}
                                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${medicalCondition === 'Pass' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                                    >
                                        Pass
                                    </button>
                                    <button
                                        onClick={() => setMedicalCondition('Fail')}
                                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${medicalCondition === 'Fail' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                                    >
                                        Fail
                                    </button>
                                </div>
                            </div>

                            {/* Blood Test Row */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                    </div>
                                    <span className="font-semibold text-gray-700 text-lg">Vital Signs</span>
                                </div>
                                <div className="flex rounded-lg bg-gray-200 p-1">
                                    <button
                                        onClick={() => setBloodTest('Pass')}
                                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${bloodTest === 'Pass' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                                    >
                                        Pass
                                    </button>
                                    <button
                                        onClick={() => setBloodTest('Fail')}
                                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${bloodTest === 'Fail' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                                    >
                                        Fail
                                    </button>
                                </div>
                            </div>

                            {/* Main Actions */}
                            <div className="pt-4 grid grid-cols-2 gap-4">
                                <button
                                    onClick={handleMainFail}
                                    className="px-4 py-3 border-2 border-red-100 text-red-600 font-bold rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors uppercase tracking-wide text-sm"
                                >
                                    Log Failure / Rejection
                                </button>
                                <button
                                    onClick={handleMainPass}
                                    disabled={medicalCondition !== 'Pass' || bloodTest !== 'Pass'}
                                    className={`px-4 py-3 font-bold rounded-lg shadow-md transition-all uppercase tracking-wide text-sm flex items-center justify-center ${medicalCondition === 'Pass' && bloodTest === 'Pass' ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer transform hover:-translate-y-0.5' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Approve Donor
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5 animate-fadeIn">
                            <div className="text-center">
                                <div className="inline-flex p-3 bg-red-100 text-red-600 rounded-full mb-3">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Report Test Failure</h3>
                                <p className="text-sm text-gray-500">Please verify the reason for rejection.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Reason</label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow outline-none resize-none bg-gray-50"
                                    rows={4}
                                    placeholder="e.g., Low hemoglobin levels, High blood pressure..."
                                    value={failReason}
                                    onChange={(e) => setFailReason(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowFailInput(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitFailure}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md transition-colors"
                                >
                                    Submit Rejection
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LaboratoryTestModal;
