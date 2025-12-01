const MyRequestsView = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white border border-slate-200 p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">My Emergency Requests</h1>
        <p className="mt-2 text-slate-600">View and manage all your submitted emergency blood requests.</p>

        {/* Empty State */}
        <div className="mt-12 flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">No Requests Yet</h2>
          <p className="mt-2 text-slate-600">
            You haven't submitted any emergency requests. Create your first request to find matching donors.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyRequestsView;

