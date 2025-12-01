import { FormEvent, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { mockLogin } from '../../../controllers/authController';
import { useAppDispatch } from '../../../store/hooks';
import { login } from '../../../store/slices/authSlice';

const LoginView = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const response = await mockLogin(formState);
    dispatch(login({ role: response.role, fullName: response.fullName }));
    setIsSubmitting(false);
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fff5f8] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-card">
        <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to manage donors, requests, and reports.</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-600">Email</label>
            <input
              required
              type="email"
              value={formState.email}
              onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
              placeholder="admin@blood.gov.et"
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
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white disabled:opacity-70"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          New to the platform?{' '}
          <NavLink to="/register" className="font-semibold text-primary">
            Create an account
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default LoginView;


