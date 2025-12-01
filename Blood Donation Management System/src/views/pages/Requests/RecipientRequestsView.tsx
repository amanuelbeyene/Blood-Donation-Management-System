import { useEffect, useState } from 'react';
import { fetchRequests } from '../../../controllers/requestController';
import type { RecipientRequest } from '../../../models/RecipientRequest';
import SectionHeading from '../../components/common/SectionHeading';

const urgencyBadge: Record<RecipientRequest['urgency'], string> = {
  emergency: 'bg-rose-100 text-rose-600',
  high: 'bg-amber-100 text-amber-600',
  standard: 'bg-emerald-100 text-emerald-600',
};

const statusPalette: Record<RecipientRequest['status'], string> = {
  pending: 'text-rose-500',
  matched: 'text-amber-500',
  fulfilled: 'text-emerald-500',
};

const RecipientRequestsView = () => {
  const [requests, setRequests] = useState<RecipientRequest[]>([]);

  useEffect(() => {
    fetchRequests().then(setRequests);
  }, []);

  return (
    <div className="space-y-8">
      <SectionHeading
        align="left"
        eyebrow="Emergency Requests"
        title="Track live hospital needs"
        description="Prioritize urgent cases and assign the right donors before critical thresholds are breached."
      />

      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{request.hospital}</h3>
                <p className="text-sm text-slate-500">{request.patient}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-primary/10 px-3 py-2 text-lg font-semibold text-primary">
                  {request.bloodType}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${urgencyBadge[request.urgency]}`}>
                  {request.urgency}
                </span>
              </div>
            </div>
            <div className="mt-4 grid gap-4 text-sm text-slate-500 sm:grid-cols-3">
              <p>
                <span className="font-semibold text-slate-900">{request.unitsNeeded}</span> units needed
              </p>
              <p>
                Requested:{' '}
                <span className="font-semibold text-slate-900">
                  {new Date(request.requestedAt).toLocaleString()}
                </span>
              </p>
              <p className={`font-semibold capitalize ${statusPalette[request.status]}`}>{request.status}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
              >
                Notify Donors
              </button>
              <button
                type="button"
                className="rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary"
              >
                View Map
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipientRequestsView;


