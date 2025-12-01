import { Outlet, useLocation } from 'react-router-dom';
import MainNav from '../navigation/MainNav';
import SiteFooter from './SiteFooter';

const MainLayout = () => {
  const location = useLocation();
  const isHospitalPage = location.pathname.startsWith('/hospital');
  const bgClass = isHospitalPage
    ? 'bg-gradient-to-b from-blue-50 to-blue-100/50'
    : 'bg-[#fff5f8]';

  return (
    <div className={`flex min-h-screen flex-col ${bgClass}`}>
      <MainNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
};

export default MainLayout;


