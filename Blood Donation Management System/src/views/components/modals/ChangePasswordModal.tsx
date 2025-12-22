import { useState, FormEvent } from 'react';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (newPassword: string) => void;
}

const ChangePasswordModal = ({ isOpen, onClose, onSubmit }: ChangePasswordModalProps) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmNewPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (currentPassword === newPassword) {
            setError('New password cannot be the same as current password');
            return;
        }

        onSubmit(newPassword);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                        <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Change Password Required</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        For security reasons, you must change your password upon first login.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                            placeholder="Enter current password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                            placeholder="Enter new password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                            placeholder="Confirm new password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-6 w-full rounded-xl bg-primary py-3 font-semibold text-white hover:bg-red-700 transition shadow-lg shadow-red-600/20"
                    >
                        Update Password & Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
