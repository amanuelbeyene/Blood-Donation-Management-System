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
            alert("Both Medical Condition and Blood Test must be 'Pass' to proceed.");
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative border-4 border-pink-600">
                {/* Header */}
                <div className="text-center py-4 border-b border-gray-200">
                    <h2 className="text-2xl font-serif text-black">Laboratory Test</h2>
                    <p className="text-sm text-gray-500 mt-1">Donor: {donorName}</p>
                </div>

                <div className="p-6 space-y-6">
                    {!showFailInput ? (
                        <>
                            {/* Medical Condition Row */}
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-serif text-black">Medical Condition</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setMedicalCondition('Pass')}
                                        className={`px-4 py-1 rounded text-white font-bold transition-colors ${medicalCondition === 'Pass' ? 'bg-green-600 ring-2 ring-green-800' : 'bg-green-500 hover:bg-green-600 opacity-60'
                                            }`}
                                    >
                                        Pass
                                    </button>
                                    <button
                                        onClick={() => setMedicalCondition('Fail')}
                                        className={`px-4 py-1 rounded text-white font-bold transition-colors ${medicalCondition === 'Fail' ? 'bg-red-600 ring-2 ring-red-800' : 'bg-red-500 hover:bg-red-600 opacity-60'
                                            }`}
                                    >
                                        Fail
                                    </button>
                                </div>
                            </div>

                            {/* Blood Test Row */}
                            <div className="flex justify-between items-center border-l-2 border-gray-200 pl-0">
                                {/* Note: The image showed a vertical line separator roughly in middle, simplified via flex/grid or just basic layout. keeping simple layout for now */}
                                <span className="text-xl font-serif text-black">Blood Test</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setBloodTest('Pass')}
                                        className={`px-4 py-1 rounded text-white font-bold transition-colors ${bloodTest === 'Pass' ? 'bg-green-600 ring-2 ring-green-800' : 'bg-green-500 hover:bg-green-600 opacity-60'
                                            }`}
                                    >
                                        Pass
                                    </button>
                                    <button
                                        onClick={() => setBloodTest('Fail')}
                                        className={`px-4 py-1 rounded text-white font-bold transition-colors ${bloodTest === 'Fail' ? 'bg-red-600 ring-2 ring-red-800' : 'bg-red-500 hover:bg-red-600 opacity-60'
                                            }`}
                                    >
                                        Fail
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-between gap-4 pt-4 border-t border-gray-200">
                                <button
                                    onClick={handleMainPass}
                                    className="flex-1 bg-lime-500 hover:bg-lime-600 text-black font-bold py-2 rounded text-lg uppercase tracking-wider shadow-md"
                                >
                                    Pass
                                </button>
                                <button
                                    onClick={handleMainFail}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded text-lg uppercase tracking-wider shadow-md"
                                >
                                    Fail
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-red-50 p-4 rounded border border-red-200">
                                <h3 className="text-red-800 font-bold mb-2">Report Failure</h3>
                                <textarea
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:outline-none"
                                    rows={4}
                                    placeholder="Enter reason for failure..."
                                    value={failReason}
                                    onChange={(e) => setFailReason(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowFailInput(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={submitFailure}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Submit Report
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Close X (Optional, not in image but good for UX) */}
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl font-bold">
                    ✕
                </button>
            </div>
        </div>
    );
};

export default LaboratoryTestModal;
