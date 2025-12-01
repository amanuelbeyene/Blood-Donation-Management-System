import { FormEvent, useState } from 'react';
import { NavLink } from 'react-router-dom';

const EmergencyRequestView = () => {
  const [formState, setFormState] = useState({
    bloodType: '',
    urgencyLevel: '',
    hospitalLocation: '',
    contactInfo: '',
    additionalNotes: '',
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert('Emergency request submitted! Backend integration coming soon.');
  };

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <div className="rounded-xl bg-white border border-slate-200 p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Emergency Blood Request</h1>
            <p className="text-sm text-slate-600">Submit an urgent blood request and find matching donors</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Required Blood Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formState.bloodType}
                onChange={(e) => setFormState((prev) => ({ ...prev, bloodType: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select blood type</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Urgency Level <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formState.urgencyLevel}
                onChange={(e) => setFormState((prev) => ({ ...prev, urgencyLevel: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select urgency</option>
                <option value="critical">Critical - Immediate Need</option>
                <option value="urgent">Urgent - Within 24 hours</option>
                <option value="moderate">Moderate - Within 3 days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Hospital/Location <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={formState.hospitalLocation}
              onChange={(e) => setFormState((prev) => ({ ...prev, hospitalLocation: e.target.value }))}
              placeholder="e.g., Black Lion Hospital, Addis Ababa"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contact Information <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={formState.contactInfo}
              onChange={(e) => setFormState((prev) => ({ ...prev, contactInfo: e.target.value }))}
              placeholder="Phone number or email"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</label>
            <textarea
              value={formState.additionalNotes}
              onChange={(e) => setFormState((prev) => ({ ...prev, additionalNotes: e.target.value }))}
              placeholder="Any additional information about the emergency..."
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              Submit Emergency Request
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Search Donors
            </button>
          </div>
        </form>
      </div>

      {/* Matching Donors Section */}
      <div className="rounded-xl bg-white border border-slate-200 p-8 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Matching Donors (0)</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Matching Donors Found</h3>
          <p className="mt-2 text-slate-600">
            Unfortunately, we couldn't find any donors with compatible blood type. Please try again later or contact
            hospitals directly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyRequestView;

