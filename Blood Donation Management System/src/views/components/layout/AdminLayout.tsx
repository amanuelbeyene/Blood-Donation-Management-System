import { Outlet } from 'react-router-dom';
import AdminSidebar from '../navigation/AdminSidebar';
import AdminHeader from '../navigation/AdminHeader';
import { MockDataProvider } from '../../../contexts/MockDataContext';

const AdminLayout = () => {
  return (
    <MockDataProvider>
      <div className="flex h-screen w-full overflow-hidden bg-white">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </MockDataProvider>
  );
};

export default AdminLayout;
