import { useEffect, useState } from 'react';
import { fetchDonationHistory } from '../../../controllers/adminController';
import type { DonationRecord } from '../../../models/Donation';
import SectionHeading from '../../components/common/SectionHeading';

const DonationHistoryView = () => {
  const [history, setHistory] = useState<DonationRecord[]>([]);

  useEffect(() => {
    fetchDonationHistory().then(setHistory);
  }, []);

  return (
    <div className="space-y-8">
      <SectionHeading
        align="left"
        eyebrow="History"
        title="Donation timeline"
        description="Audit-friendly record of every donation event with donor and hospital context."
      />

      <ol className="relative space-y-6 border-l border-primary/20 pl-6">
        {history.map((record) => (
          <li key={record.id} className="space-y-2">
            <span className="absolute -left-2 top-2 h-4 w-4 rounded-full border-4 border-white bg-primary" />
            <div className="rounded-2xl bg-white/90 p-5 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">{record.donorName}</h3>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {record.bloodType}
                </span>
              </div>
              <p className="text-sm text-slate-500">{record.hospital}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                <p>
                  Date:{' '}
                  <span className="font-semibold text-slate-900">
                    {new Date(record.donationDate).toLocaleDateString()}
                  </span>
                </p>
                <p>
                  Units: <span className="font-semibold text-slate-900">{record.units}</span>
                </p>
                <p className="font-semibold text-emerald-600 capitalize">{record.status}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default DonationHistoryView;


