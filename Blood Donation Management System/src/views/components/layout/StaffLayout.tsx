import { Outlet } from 'react-router-dom';
import StaffSidebar from '../navigation/StaffSidebar'; // Ensure this matches file path
import AdminHeader from '../navigation/AdminHeader'; // Reusing AdminHeader for now or create StaffHeader
import { MockDataProvider } from '../../../contexts/MockDataContext';

const StaffLayout = () => {
    return (
        <MockDataProvider>
            <div className="flex h-screen w-full overflow-hidden bg-white">
                <StaffSidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <AdminHeader /> {/* Ideally create a specific Header or generic Header */}
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </MockDataProvider>
    );
};

export default StaffLayout;
