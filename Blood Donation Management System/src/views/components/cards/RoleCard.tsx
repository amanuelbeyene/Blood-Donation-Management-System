import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

interface RoleCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  features: string[];
  ctaLabel: string;
  to: string;
  state?: any;
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

const RoleCard = ({ icon, title, description, features, ctaLabel, to, state, accent }: RoleCardProps) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated && user?.role === state?.role) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'super_admin') navigate('/super-admin');
      else if (user.role === 'staff') navigate('/staff');
      else if (user.role === 'hospital') navigate('/hospital');
      else navigate('/donor-dashboard');
    } else {
      navigate(to, { state });
    }
  };

  return (
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
      <a
        href={to}
        onClick={handleNavigation}
        className={`mt-6 inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition cursor-pointer ${buttonClasses[accent]}`}
      >
        {ctaLabel} →
      </a>
    </div>
  );
};

export default RoleCard;


