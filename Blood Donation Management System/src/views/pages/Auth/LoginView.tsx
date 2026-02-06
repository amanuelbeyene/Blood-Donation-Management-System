import { FormEvent, useState } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import ChangePasswordModal from '../../components/modals/ChangePasswordModal';

interface LoginViewProps {
  role?: string;
}

const LoginView = ({ role }: LoginViewProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Destructure login from useAuth
  const { t } = useLanguage();
  const { toast } = useToast();
  const initialRole = (location.state as any)?.role || role || 'donor';
  const [formState, setFormState] = useState({ identifier: '', password: '', role: initialRole });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

  const navigateAfterLogin = (userRole: string) => {
    if (userRole === 'admin') navigate('/admin');
    else if (userRole === 'super_admin') navigate('/super-admin');
    else if (userRole === 'medical_staff') navigate('/medical-staff');
    else if (userRole === 'staff') navigate('/staff');
    else if (userRole === 'hospital') navigate('/hospital');
    else navigate('/donor-dashboard');
  };

  const handlePasswordUpdate = async (currentPassword: string, newPassword: string) => {
    try {
      const { updatePassword } = await import('../../../controllers/authController');
      await updatePassword({
        identifier: formState.identifier,
        role: formState.role,
        currentPassword,
        newPassword
      });

      // After update, proceed to login with the new password
      const { loginUser } = await import('../../../controllers/authController');
      const response = await loginUser({
        identifier: formState.identifier,
        password: newPassword,
        role: formState.role
      });

      const userRole = (response.role as string).toLowerCase();
      login({
        id: response.userId || 'unknown',
        fullName: response.fullName,
        role: userRole as any,
        profilePicture: response.profilePicture
      });

      sessionStorage.setItem(`token_${userRole}`, response.token);
      localStorage.setItem(`token_${userRole}`, response.token);
      setShowPasswordChangeModal(false);
      navigateAfterLogin(userRole);
    } catch (error: any) {
      console.error('Password update or login failed', error);
      toast.error('Failed to update password: ' + (error.message || 'Error occurred'));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Force password change if using default password
    if (formState.password === '12345678') {
      setShowPasswordChangeModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const { loginUser } = await import('../../../controllers/authController');
      const response = await loginUser({
        identifier: formState.identifier,
        password: formState.password,
        role: formState.role
      });

      // Login success
      // Use type assertion for role to match AuthContext expected type
      const userRole = (response.role as string).toLowerCase();

      login({
        id: response.userId || 'unknown',
        fullName: response.fullName,
        role: userRole as any,
        profilePicture: response.profilePicture,
        status: response.status
      });

      sessionStorage.setItem(`token_${userRole}`, response.token);
      localStorage.setItem(`token_${userRole}`, response.token);

      setIsSubmitting(false);
      if (userRole) {
        navigateAfterLogin(userRole);
      } else {
        // Fallback default navigation
        navigate('/');
      }
    } catch (error: any) {
      console.error('Login failed', error);
      toast.error('Login failed: ' + (error.message || 'Invalid credentials'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fff5f8] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-card">
        <div className="mx-auto h-20 w-20 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm border border-slate-100 mb-6">
          <img src="/logo.png" alt="BDMS Logo" className="h-full w-full object-cover" />
        </div>
        <h1 className="text-3xl font-semibold text-slate-900">{t('welcomeBack')}</h1>
        <p className="mt-2 text-sm text-slate-500">{t('signInDesc')}</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-600">{t('selectRoleTitle')}</label>
            <select
              value={formState.role}
              onChange={(event) => setFormState((prev) => ({ ...prev, role: event.target.value as any }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
            >
              <option value="donor">{t('roleDonorTitle')}</option>
              <option value="hospital">{t('roleHospitalTitle')}</option>
              <option value="staff">{t('roleStaffTitle')}</option>
              <option value="medical_staff">{t('roleMedicalStaffTitle' as any)}</option>
              <option value="admin">{t('roleAdminTitle')}</option>
              <option value="super_admin">{t('roleSuperAdminTitle')}</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">{t('identifierLabel')}</label>
            <input
              required
              type="text"
              value={formState.identifier}
              onChange={(event) => setFormState((prev) => ({ ...prev, identifier: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
              placeholder={t('identifierPlaceholder')}
            />
          </div>


          <div>
            <label className="text-sm font-medium text-slate-600">{t('passwordLabel')}</label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={formState.password}
                onChange={(event) => setFormState((prev) => ({ ...prev, password: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-primary mt-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <NavLink to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-dark">
                {t('forgotPassword')}
              </NavLink>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white disabled:opacity-70"
          >
            {isSubmitting ? t('signingIn') : t('signInBtn')}
          </button>
        </form>
        {['donor', 'hospital'].includes(formState.role) && (
          <p className="mt-6 text-center text-sm text-slate-500">
            {t('newToPlatform')}{' '}
            <NavLink to="/register" className="font-semibold text-primary">
              {t('createAccount')}
            </NavLink>
          </p>
        )}
      </div>

      <ChangePasswordModal
        isOpen={showPasswordChangeModal}
        onClose={() => setShowPasswordChangeModal(false)}
        onSubmit={handlePasswordUpdate}
        defaultCurrentPassword="12345678"
      />
    </div>
  );
};

export default LoginView;


