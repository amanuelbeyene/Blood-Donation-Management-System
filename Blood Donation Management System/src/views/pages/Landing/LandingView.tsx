import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RoleCard from '../../components/cards/RoleCard';
import { fetchDashboardStats } from '../../../controllers/adminController';
import { useLanguage } from '../../../contexts/LanguageContext';

const LandingView = () => {
  const [stats, setStats] = useState<any>({});
  const { t } = useLanguage();

  useEffect(() => {
    fetchDashboardStats().then(setStats);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pb-10 pt-16 lg:pt-20">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.05]"></div>
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-rose-100 mix-blend-multiply blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-50 mix-blend-multiply blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-rose-600 p-3 shadow-lg shadow-rose-200">
            <span className="text-3xl">🩸</span>
          </div>

          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {t('heroTitlePrefix')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-600">{t('heroTitleSuffix')}</span>
          </h1>

          <p className="mx-auto mb-6 max-w-2xl text-lg text-slate-600">
            {t('heroSubtitleHtml')}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-10">
            <Link
              to="/login/donor"
              className="rounded-full bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg shadow-rose-200 transition-all hover:scale-105 hover:bg-rose-700 hover:shadow-xl"
            >
              {t('donateNow')}
            </Link>
            <Link
              to="/login/hospital"
              className="rounded-full border border-slate-200 bg-white px-8 py-3 text-base font-semibold text-slate-700 shadow-sm transition-all hover:border-primary/20 hover:bg-slate-50 hover:text-primary"
            >
              {t('requestBlood')}
            </Link>
          </div>

          {/* Stats */}
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:grid-cols-3 border border-slate-100">
              <div className="text-center">
                <p className="text-4xl font-bold text-slate-900 tracking-tight">{stats?.totalDonors ?? 0}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('registeredDonors')}</p>
              </div>
              <div className="text-center sm:border-l sm:border-r sm:border-slate-100">
                <p className="text-4xl font-bold text-slate-900 tracking-tight">{stats?.approvedRequests ?? 0}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('livesSaved')}</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-slate-900 tracking-tight">{stats?.availableBloodUnits ?? 0}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('unitsAvailable')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="bg-slate-50/50 py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200/60">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{t('getStarted')}</h2>
            <p className="mt-2 text-slate-500">{t('selectRole')}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {/* Public Roles */}
            <RoleCard
              accent="rose"
              title={t('roleDonorTitle')}
              description={t('roleDonorDesc')}
              features={t('roleDonorFeatures')}
              icon={<span className="text-3xl">❤️</span>}
              ctaLabel={t('roleDonorCta')}
              to="/login/donor"
              state={{ role: 'donor' }}
            />
            <RoleCard
              accent="blue"
              title={t('roleHospitalTitle')}
              description={t('roleHospitalDesc')}
              features={t('roleHospitalFeatures')}
              icon={<span className="text-3xl">🏥</span>}
              ctaLabel={t('roleHospitalCta')}
              to="/login/hospital"
              state={{ role: 'hospital' }}
            />
            <RoleCard
              accent="green"
              title={t('roleStaffTitle')}
              description={t('roleStaffDesc')}
              features={t('roleStaffFeatures')}
              icon={<span className="text-3xl">👨‍⚕️</span>}
              ctaLabel={t('roleStaffCta')}
              to="/login/staff"
              state={{ role: 'staff' }}
            />
          </div>

          {/* Admin Roles */}
          <div className="flex justify-center">
            <div className="grid w-full gap-6 md:max-w-2xl md:grid-cols-2">
              <RoleCard
                accent="purple"
                title={t('roleAdminTitle')}
                description={t('roleAdminDesc')}
                features={t('roleAdminFeatures')}
                icon={<span className="text-3xl">⚡</span>}
                ctaLabel={t('roleAdminCta')}
                to="/login/admin"
                state={{ role: 'admin' }}
              />
              <RoleCard
                accent="purple"
                title={t('roleSuperAdminTitle')}
                description={t('roleSuperAdminDesc')}
                features={t('roleSuperAdminFeatures')}
                icon={<span className="text-3xl">🛡️</span>}
                ctaLabel={t('roleSuperAdminCta')}
                to="/login/super-admin"
                state={{ role: 'super_admin' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Impact & Analytics Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">{t('whyMatters')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              {t('whyMattersDesc')}
            </p>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-8 lg:grid-cols-2 mb-20">
            {/* Donation Trends Chart */}
            <div className="rounded-3xl bg-slate-50 p-8 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('monthlyGrowth')}</h3>
              <p className="text-sm text-slate-500 mb-8">{t('monthlyGrowthDesc')}</p>
              <div className="h-64 w-full relative">
                {/* Simple SVG Area Chart */}
                <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible preserve-3d">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e11d48" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,50 L0,35 Q20,45 40,25 T80,15 L100,5 L100,50 Z" fill="url(#chartGradient)" />
                  <path d="M0,35 Q20,45 40,25 T80,15 L100,5" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" className="drop-shadow-sm" />
                  {/* Points */}
                  <circle cx="0" cy="35" r="1.5" fill="white" stroke="#e11d48" strokeWidth="1" />
                  <circle cx="40" cy="25" r="1.5" fill="white" stroke="#e11d48" strokeWidth="1" />
                  <circle cx="80" cy="15" r="1.5" fill="white" stroke="#e11d48" strokeWidth="1" />
                  <circle cx="100" cy="5" r="1.5" fill="white" stroke="#e11d48" strokeWidth="1" />
                </svg>
                {/* Labels */}
                <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-slate-400 font-medium px-1">
                  <span>Jan</span>
                  <span>Mar</span>
                  <span>Jun</span>
                  <span>Sep</span>
                </div>
              </div>
            </div>

            {/* Blood Type Dist Chart */}
            <div className="rounded-3xl bg-slate-50 p-8 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('bloodTypeDemand')}</h3>
              <p className="text-sm text-slate-500 mb-8">{t('bloodTypeDemandDesc')}</p>
              <div className="flex items-center justify-center h-64">
                <div className="relative h-48 w-48">
                  {/* Donut Chart */}
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {/* O+ (40%) */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e11d48" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="0" className="opacity-100" />
                    {/* A+ (30%) */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#2563eb" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="100.48" className="opacity-90" />
                    {/* B+ (20%) */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="175.84" className="opacity-90" />
                    {/* Others (10%) */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="226.08" className="opacity-90" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900">{t('highDemand')}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-widest">{t('demand')}</span>
                  </div>
                </div>
                {/* Legend */}
                <div className="ml-8 space-y-3">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary"></span><span className="text-sm text-slate-600">O+ (40%)</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-600"></span><span className="text-sm text-slate-600">A+ (30%)</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><span className="text-sm text-slate-600">B+ (20%)</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span><span className="text-sm text-slate-600">Other (10%)</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Before vs After */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-slate-900">{t('digitalEfficiency')}</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-0 overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
              {/* Before */}
              <div className="bg-slate-100 p-10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-300"></div>
                <span className="absolute top-6 left-6 inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">{t('beforeBdms')}</span>
                <h4 className="mt-8 text-xl font-bold text-slate-800 mb-4">{t('manualChaos')}</h4>
                <ul className="space-y-4 relative z-10">
                  {t('impactBeforeList').map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 opacity-60">
                      <span className="text-xl">❌</span>
                      <span className="text-slate-600 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* After */}
              <div className="bg-gradient-to-br from-primary to-rose-700 p-10 relative overflow-hidden text-white">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
                <span className="absolute top-6 left-6 inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white border border-white/30 backdrop-blur-sm">{t('afterBdms')}</span>
                <h4 className="mt-8 text-xl font-bold text-white mb-4">{t('digitalEfficiency')}</h4>
                <ul className="space-y-4 relative z-10">
                  {t('impactAfterList').map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs text-white">✓</span>
                      <span className="text-white/90 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Why Important (Benefits) */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 mx-auto bg-rose-50 rounded-2xl flex items-center justify-center text-2xl mb-4 text-primary">⚡</div>
              <h4 className="font-bold text-slate-900 mb-2">{t('fastResponse')}</h4>
              <p className="text-sm text-slate-500">{t('fastResponseDesc')}</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center text-2xl mb-4 text-blue-600">🛡️</div>
              <h4 className="font-bold text-slate-900 mb-2">{t('secureData')}</h4>
              <p className="text-sm text-slate-500">{t('secureDataDesc')}</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mb-4 text-emerald-600">📍</div>
              <h4 className="font-bold text-slate-900 mb-2">{t('liveTracking')}</h4>
              <p className="text-sm text-slate-500">{t('liveTrackingDesc')}</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 mx-auto bg-purple-50 rounded-2xl flex items-center justify-center text-2xl mb-4 text-purple-600">🤝</div>
              <h4 className="font-bold text-slate-900 mb-2">{t('community')}</h4>
              <p className="text-sm text-slate-500">{t('communityDesc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingView;


