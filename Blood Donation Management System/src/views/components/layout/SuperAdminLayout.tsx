import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from '../navigation/SuperAdminSidebar';
import AdminHeader from '../navigation/AdminHeader';

const SuperAdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <SuperAdminSidebar />
            <div className="flex-1 flex flex-col">
                <AdminHeader />
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SuperAdminLayout;
