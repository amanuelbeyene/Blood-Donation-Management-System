interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  accent?: 'primary' | 'blue';
}

const accentClasses: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'from-primary/15 via-white to-white',
  blue: 'from-blue-100 via-white to-white',
};

const StatCard = ({ label, value, subtext, accent = 'primary' }: StatCardProps) => (
  <div className={`rounded-3xl bg-gradient-to-br p-6 shadow-card ${accentClasses[accent]}`}>
    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">{label}</p>
    <p className="mt-3 text-4xl font-bold text-slate-900">{value}</p>
    {subtext && <p className="mt-2 text-sm text-slate-500">{subtext}</p>}
  </div>
);

export default StatCard;


