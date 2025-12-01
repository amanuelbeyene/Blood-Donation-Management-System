import { FormEvent, useState } from 'react';
import { NavLink } from 'react-router-dom';

const RegisterView = () => {
  const [formState, setFormState] = useState({
    fullName: '',
    email: '',
    role: 'donor',
    bloodType: 'O+',
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert('Registration submitted! Backend integration coming soon.');
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-[#fff5f8] px-4 py-8">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-10 shadow-card">
        <h1 className="text-3xl font-semibold text-slate-900">Create your profile</h1>
        <p className="mt-2 text-sm text-slate-500">
          Donors, hospitals, and administrators can onboard in minutes.
        </p>
        <form className="mt-8 grid gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-600">Full Name</label>
            <input
              required
              value={formState.fullName}
              onChange={(event) => setFormState((prev) => ({ ...prev, fullName: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-600">Email</label>
            <input
              required
              type="email"
              value={formState.email}
              onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Role</label>
            <select
              value={formState.role}
              onChange={(event) => setFormState((prev) => ({ ...prev, role: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
            >
              <option value="donor">Donor</option>
              <option value="hospital">Hospital</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Blood Type</label>
            <select
              value={formState.bloodType}
              onChange={(event) => setFormState((prev) => ({ ...prev, bloodType: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
            >
              {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-600">Organization (optional)</label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
              placeholder="Blood bank, NGO, or hospital"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-600">Phone</label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none"
              placeholder="+251 900 000 000"
            />
          </div>

          <button
            type="submit"
            className="md:col-span-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-white"
          >
            Complete Registration
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <NavLink to="/login" className="font-semibold text-primary">
            Log in
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default RegisterView;


