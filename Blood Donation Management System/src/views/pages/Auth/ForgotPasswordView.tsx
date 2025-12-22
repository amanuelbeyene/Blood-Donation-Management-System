import { useState, FormEvent } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const ForgotPasswordView = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSent(true);
        }, 1500);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#fff5f8] px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-card">
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-semibold text-slate-900">Forgot Password?</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Enter your email address to get the password reset link.
                    </p>
                </div>

                {isSent ? (
                    <div className="text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-medium text-slate-900">Check your email</h3>
                        <p className="mt-2 text-sm text-slate-500 mb-6">
                            We have sent a password reset link to <span className="font-semibold text-slate-900">{email}</span>
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
                        >
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-slate-600">Email Address</label>
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
                                placeholder="name@example.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white disabled:opacity-70 hover:bg-red-700 transition shadow-lg shadow-primary/20"
                        >
                            {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
                        </button>

                        <div className="text-center">
                            <NavLink to="/login" className="text-sm font-medium text-slate-500 hover:text-primary transition">
                                Back to Login
                            </NavLink>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordView;
