import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface RoleCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  features: string[];
  ctaLabel: string;
  to: string;
  accent: 'rose' | 'blue' | 'green' | 'purple';
}

const accents = {
  rose: 'bg-white shadow-lg border border-primary/10',
  blue: 'bg-white shadow-lg border border-blue-200',
  green: 'bg-white shadow-lg border border-emerald-200',
  purple: 'bg-white shadow-lg border border-purple-200',
};

const buttonClasses = {
  rose: 'bg-primary text-white hover:bg-primary-dark',
  blue: 'bg-accent text-white hover:bg-blue-600',
  green: 'bg-emerald-600 text-white hover:bg-emerald-700',
  purple: 'bg-purple-600 text-white hover:bg-purple-700',
};

const iconBgClasses = {
  rose: 'bg-primary/10 text-primary border-2 border-primary/20',
  blue: 'bg-blue-100 text-accent border-2 border-blue-200',
  green: 'bg-emerald-100 text-emerald-600 border-2 border-emerald-200',
  purple: 'bg-purple-100 text-purple-600 border-2 border-purple-200',
};

const RoleCard = ({ icon, title, description, features, ctaLabel, to, accent }: RoleCardProps) => (
  <div className={`flex flex-col rounded-2xl p-6 ${accents[accent]}`}>
    <div className="flex flex-col items-center text-center">
      <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${iconBgClasses[accent]}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
    </div>
    <p className="mt-3 text-center text-sm text-slate-600">{description}</p>
    <ul className="mt-4 space-y-2 text-sm text-slate-700">
      {features.map((feature) => (
        <li key={feature} className="flex items-center gap-2">
          <span className="text-green-600">✓</span>
          {feature}
        </li>
      ))}
    </ul>
    <NavLink
      to={to}
      className={`mt-6 inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition ${buttonClasses[accent]}`}
    >
      {ctaLabel} →
    </NavLink>
  </div>
);

export default RoleCard;


