import { Route, Routes } from 'react-router-dom';
import MainLayout from '../views/components/layout/MainLayout';
import AdminLayout from '../views/components/layout/AdminLayout';
import SuperAdminLayout from '../views/components/layout/SuperAdminLayout';
import StaffLayout from '../views/components/layout/StaffLayout';
import LandingView from '../views/pages/Landing/LandingView';
import DonorDirectoryView from '../views/pages/Donors/DonorDirectoryView';
import DonorDashboardView from '../views/pages/Donors/DonorDashboardView';
import EditProfileView from '../views/pages/Donors/EditProfileView';
import RecipientRequestsView from '../views/pages/Requests/RecipientRequestsView';
import InventoryView from '../views/pages/Inventory/InventoryView';
import DonationHistoryView from '../views/pages/History/DonationHistoryView';
import AdminDashboardView from '../views/pages/Admin/AdminDashboardView';
import AddStaffView from '../views/pages/Admin/AddStaffView';
import ViewStaffView from '../views/pages/Admin/ViewStaffView';
import EditStaffView from '../views/pages/Admin/EditStaffView';

import DeleteStaffView from '../views/pages/Admin/DeleteStaffView';
import StaffActivityView from '../views/pages/Admin/StaffActivityView';
import ApproveDonorView from '../views/pages/Admin/ApproveDonorView';
import RejectDonorView from '../views/pages/Admin/RejectDonorView';
import HospitalApprovalView from '../views/pages/Admin/HospitalApprovalView';
import ApproveHospitalView from '../views/pages/Admin/ApproveHospitalView';
import RejectHospitalView from '../views/pages/Admin/RejectHospitalView';
import SuperAdminDashboardView from '../views/pages/Admin/SuperAdminDashboardView';
import AddAdminView from '../views/pages/Admin/AddAdminView';
import ViewAdminsView from '../views/pages/Admin/ViewAdminsView';
import EditAdminView from '../views/pages/Admin/EditAdminView';
import DeleteAdminView from '../views/pages/Admin/DeleteAdminView';
import AddDonorView from '../views/pages/Admin/AddDonorView';
import ViewDonorsView from '../views/pages/Admin/ViewDonorsView';
import EditDonorView from '../views/pages/Admin/EditDonorView';
import DeleteDonorView from '../views/pages/Admin/DeleteDonorView';
// import AdminFindDonorsView from '../views/pages/Admin/AdminFindDonorsView';
// import AdminFindHospitalView from '../views/pages/Admin/AdminFindHospitalView';
import AddHospitalView from '../views/pages/Admin/AddHospitalView';
import ViewHospitalsView from '../views/pages/Admin/ViewHospitalsView';
import EditHospitalView from '../views/pages/Admin/EditHospitalView';
import DeleteHospitalView from '../views/pages/Admin/DeleteHospitalView';
import AdminActivityView from '../views/pages/Admin/AdminActivityView';
import DonationsView from '../views/pages/Admin/DonationsView';
import BloodRequestsView from '../views/pages/Admin/BloodRequestsView';
import RequestHistoryView from '../views/pages/Admin/RequestHistoryView';
import BloodStockView from '../views/pages/Admin/BloodStockView';
// import AdminFindDonorView from '../views/pages/Admin/AdminFindDonorView';
import HospitalView from '../views/pages/Hospital/HospitalView';
import EmergencyRequestView from '../views/pages/Hospital/EmergencyRequestView';
import MyRequestsView from '../views/pages/Hospital/MyRequestsView';
import HospitalFindDonorsView from '../views/pages/Hospital/HospitalFindDonorsView';
import AwardsView from '../views/pages/Awards/AwardsView';
import DonorAwardsView from '../views/pages/Awards/DonorAwardsView';
import LoginView from '../views/pages/Auth/LoginView';
import RegisterView from '../views/pages/Auth/RegisterView';
import StaffDashboardView from '../views/pages/Staff/StaffDashboardView';
import StaffAppointmentsView from '../views/pages/Staff/StaffAppointmentsView';
import DonorActivityView from '../views/pages/Staff/DonorActivityView';
import DonorApprovalView from '../views/pages/Admin/DonorApprovalView'; // Was missing in previous imports list? Or check default export

const AppRoutes = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<LandingView />} />
      <Route path="/donors" element={<DonorDirectoryView />} />
      <Route path="/donor-dashboard" element={<DonorDashboardView />} />
      <Route path="/awards" element={<AwardsView />} />
      <Route path="/donor-awards" element={<DonorAwardsView />} />
      <Route path="/requests" element={<RecipientRequestsView />} />
      <Route path="/inventory" element={<InventoryView />} />
      <Route path="/history" element={<DonationHistoryView />} />
      <Route path="/hospital" element={<HospitalView />} />
      <Route path="/login/admin" element={<LoginView role="admin" />} />
      <Route path="/login/super-admin" element={<LoginView role="super-admin" />} />
      <Route path="/login/staff" element={<LoginView role="staff" />} />
      <Route path="/login/donor" element={<LoginView role="donor" />} />
      <Route path="/login/hospital" element={<LoginView role="hospital" />} />
      <Route path="/hospital/emergency-request" element={<EmergencyRequestView />} />
      <Route path="/hospital/my-requests" element={<MyRequestsView />} />
      <Route path="/hospital/find-donors" element={<HospitalFindDonorsView />} />
      <Route path="/register" element={<RegisterView />} />
      <Route path="/login" element={<LoginView />} />
      <Route path="/edit-donor" element={<EditProfileView />} />
    </Route>
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<AdminDashboardView />} />
      <Route path="add-staff" element={<AddStaffView />} />
      <Route path="view-staff" element={<ViewStaffView />} />
      <Route path="edit-staff" element={<EditStaffView />} />

      <Route path="delete-staff" element={<DeleteStaffView />} />
      <Route path="manage-staff" element={<StaffActivityView />} />

      <Route path="donations" element={<DonationsView />} />
      <Route path="blood-requests" element={<BloodRequestsView />} />
      <Route path="request-history" element={<RequestHistoryView />} />
      <Route path="blood-stock" element={<BloodStockView />} />
      <Route path="donor-approval" element={<DonorApprovalView />} />
      <Route path="approve-donor" element={<ApproveDonorView />} />
      <Route path="reject-donor" element={<RejectDonorView />} />
      <Route path="hospital-approval" element={<HospitalApprovalView />} />
      <Route path="approve-hospital" element={<ApproveHospitalView />} />
      <Route path="reject-hospital" element={<RejectHospitalView />} />
      {/* Admin Management Routes */}
      <Route path="add-donor" element={<AddDonorView />} />
      <Route path="view-donors" element={<ViewDonorsView />} />
      <Route path="edit-donor/:id?" element={<EditDonorView />} />
      <Route path="delete-donor" element={<DeleteDonorView />} />
      <Route path="add-hospital" element={<AddHospitalView />} />
      <Route path="view-hospitals" element={<ViewHospitalsView />} />
      <Route path="edit-hospital/:id?" element={<EditHospitalView />} />
      <Route path="delete-hospital" element={<DeleteHospitalView />} />
      {/* <Route path="find-donors" element={<AdminFindDonorsView />} /> */}
      {/* <Route path="find-hospital" element={<AdminFindHospitalView />} /> */}
    </Route>

    <Route path="/super-admin" element={<SuperAdminLayout />}>
      <Route index element={<SuperAdminDashboardView />} />
      <Route path="add-admin" element={<AddAdminView />} />
      <Route path="view-admins" element={<ViewAdminsView />} />
      <Route path="edit-admin" element={<EditAdminView />} />
      <Route path="delete-admin" element={<DeleteAdminView />} />
      <Route path="manage-admins" element={<AdminActivityView />} />
      <Route path="donations" element={<DonationsView />} />
      <Route path="blood-requests" element={<BloodRequestsView />} />
      <Route path="request-history" element={<RequestHistoryView />} />
      <Route path="blood-stock" element={<BloodStockView />} />
    </Route>

    {/* Staff Routes */}
    <Route path="/staff" element={<StaffLayout />}>
      <Route index element={<StaffDashboardView />} />
      <Route path="dashboard" element={<StaffDashboardView />} />
      {/* <Route path="find-donors" element={<AdminFindDonorsView />} /> */}
      {/* <Route path="find-hospital" element={<AdminFindHospitalView />} /> */}
      <Route path="add-donor" element={<AddDonorView />} />
      <Route path="view-donors" element={<ViewDonorsView />} />
      <Route path="edit-donor/:id?" element={<EditDonorView />} />
      <Route path="delete-donor" element={<DeleteDonorView />} />
      <Route path="manage-donors" element={<DonorActivityView />} />
      <Route path="add-hospital" element={<AddHospitalView />} />
      <Route path="view-hospitals" element={<ViewHospitalsView />} />
      <Route path="edit-hospital/:id?" element={<EditHospitalView />} />
      <Route path="delete-hospital" element={<DeleteHospitalView />} />
      {/* <Route path="find-donor" element={<AdminFindDonorView />} /> */}
      <Route path="donor-approval" element={<DonorApprovalView />} />
      <Route path="approve-donor" element={<ApproveDonorView />} />
      <Route path="reject-donor" element={<RejectDonorView />} />
      <Route path="hospital-approval" element={<HospitalApprovalView />} />
      <Route path="approve-hospital" element={<ApproveHospitalView />} />
      <Route path="reject-hospital" element={<RejectHospitalView />} />
      <Route path="appointments" element={<StaffAppointmentsView />} />
    </Route>
  </Routes>
);

export default AppRoutes;
