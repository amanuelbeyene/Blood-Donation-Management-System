import { FormEvent, useState } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import ChangePasswordModal from '../../components/modals/ChangePasswordModal';

interface LoginViewProps {
  role?: string;
}

const LoginView = ({ role }: LoginViewProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Destructure login from useAuth
  const initialRole = (location.state as any)?.role || 'donor';
  const [formState, setFormState] = useState({ identifier: '', password: '', role: initialRole });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

  const navigateAfterLogin = (userRole: string) => {
    if (userRole === 'admin') navigate('/admin');
    else if (userRole === 'super_admin') navigate('/super-admin');
    else if (userRole === 'staff') navigate('/staff');
    else if (userRole === 'hospital') navigate('/hospital');
    else navigate('/donor-dashboard');
  };

  const handlePasswordUpdate = (newPassword: string) => {
    // Call API to update password
    console.log('Updating password to:', newPassword);

    // After update, proceed to login
    const mockId = formState.role === 'hospital' ? 'hosp-1' : 'dnr-1';
    login({ id: mockId, name: 'User', role: formState.role || 'donor' });

    setShowPasswordChangeModal(false);
    navigateAfterLogin(formState.role || 'donor');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    // MOCK LOGIN LOGIC
    // In a real app, the API would return a flag like `mustChangePassword: true`
    const isFirstLogin = formState.password === '12345678' || formState.identifier.includes('new');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (isFirstLogin) {
      setIsSubmitting(false);
      setShowPasswordChangeModal(true);
      return;
    }

    const mockId = formState.role === 'hospital' ? 'hosp-1' : 'dnr-1';
    login({ id: mockId, name: 'User', role: formState.role || 'donor' });
    setIsSubmitting(false);
    navigateAfterLogin(formState.role || 'donor');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fff5f8] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-card">
        <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to manage donors, requests, and reports.</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-600">Select Role</label>
            <select
              value={formState.role}
              onChange={(event) => setFormState((prev) => ({ ...prev, role: event.target.value as any }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
            >
              <option value="donor">Donor</option>
              <option value="hospital">Hospital</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Email, Username, or Phone Number</label>
            <input
              required
              type="text"
              value={formState.identifier}
              onChange={(event) => setFormState((prev) => ({ ...prev, identifier: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
              placeholder="e.g., aman, +251..., or admin@blood.gov.et"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Password</label>
            <input
              required
              type="password"
              value={formState.password}
              onChange={(event) => setFormState((prev) => ({ ...prev, password: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
              placeholder="••••••••"
            />
            <div className="flex justify-end mt-2">
              <NavLink to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-dark">
                Forgot Password?
              </NavLink>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white disabled:opacity-70"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        {['donor', 'hospital'].includes(formState.role) && (
          <p className="mt-6 text-center text-sm text-slate-500">
            New to the platform?{' '}
            <NavLink to="/register" className="font-semibold text-primary">
              Create an account
            </NavLink>
          </p>
        )}
      </div>

      <ChangePasswordModal
        isOpen={showPasswordChangeModal}
        onClose={() => setShowPasswordChangeModal(false)}
        onSubmit={handlePasswordUpdate}
      />
    </div>
  );
};

export default LoginView;


