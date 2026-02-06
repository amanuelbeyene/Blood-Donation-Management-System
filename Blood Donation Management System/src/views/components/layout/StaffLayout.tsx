import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import StaffSidebar from '../navigation/StaffSidebar';
import AdminHeader from '../navigation/AdminHeader';
import { MockDataProvider } from '../../../contexts/MockDataContext';

const StaffLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <MockDataProvider>
            <div className="flex h-screen bg-gray-50 overflow-hidden">
                <StaffSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
                <div className="flex-1 flex flex-col min-w-0 h-full">
                    <AdminHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                    <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </MockDataProvider>
    );
};

export default StaffLayout;
