import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../navigation/AdminSidebar';
import AdminHeader from '../navigation/AdminHeader';
import { MockDataProvider } from '../../../contexts/MockDataContext';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <MockDataProvider>
      <div className="flex h-screen w-full overflow-hidden bg-white">
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden h-full min-w-0">
          <AdminHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </MockDataProvider>
  );
};

export default AdminLayout;
