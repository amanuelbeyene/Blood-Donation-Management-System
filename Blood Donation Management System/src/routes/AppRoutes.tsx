import { Route, Routes } from 'react-router-dom';
import MainLayout from '../views/components/layout/MainLayout';
import AdminLayout from '../views/components/layout/AdminLayout';
import LandingView from '../views/pages/Landing/LandingView';
import DonorDirectoryView from '../views/pages/Donors/DonorDirectoryView';
import DonorDashboardView from '../views/pages/Donors/DonorDashboardView';
import RecipientRequestsView from '../views/pages/Requests/RecipientRequestsView';
import InventoryView from '../views/pages/Inventory/InventoryView';
import DonationHistoryView from '../views/pages/History/DonationHistoryView';
import AdminDashboardView from '../views/pages/Admin/AdminDashboardView';
import AddDonorView from '../views/pages/Admin/AddDonorView';
import ViewDonorsView from '../views/pages/Admin/ViewDonorsView';
import EditDonorView from '../views/pages/Admin/EditDonorView';
import DeleteDonorView from '../views/pages/Admin/DeleteDonorView';
import AdminFindDonorsView from '../views/pages/Admin/AdminFindDonorsView';
import AddHospitalView from '../views/pages/Admin/AddHospitalView';
import ViewHospitalsView from '../views/pages/Admin/ViewHospitalsView';
import EditHospitalView from '../views/pages/Admin/EditHospitalView';
import DeleteHospitalView from '../views/pages/Admin/DeleteHospitalView';
import DonationsView from '../views/pages/Admin/DonationsView';
import BloodRequestsView from '../views/pages/Admin/BloodRequestsView';
import RequestHistoryView from '../views/pages/Admin/RequestHistoryView';
import BloodStockView from '../views/pages/Admin/BloodStockView';
import AdminFindDonorView from '../views/pages/Admin/AdminFindDonorView';
import HospitalView from '../views/pages/Hospital/HospitalView';
import EmergencyRequestView from '../views/pages/Hospital/EmergencyRequestView';
import MyRequestsView from '../views/pages/Hospital/MyRequestsView';
import HospitalFindDonorsView from '../views/pages/Hospital/HospitalFindDonorsView';
import AwardsView from '../views/pages/Awards/AwardsView';
import LoginView from '../views/pages/Auth/LoginView';
import RegisterView from '../views/pages/Auth/RegisterView';

const AppRoutes = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<LandingView />} />
      <Route path="/donors" element={<DonorDirectoryView />} />
      <Route path="/donor-dashboard" element={<DonorDashboardView />} />
      <Route path="/awards" element={<AwardsView />} />
      <Route path="/requests" element={<RecipientRequestsView />} />
      <Route path="/inventory" element={<InventoryView />} />
      <Route path="/history" element={<DonationHistoryView />} />
      <Route path="/hospital" element={<HospitalView />} />
      <Route path="/hospital/emergency-request" element={<EmergencyRequestView />} />
      <Route path="/hospital/my-requests" element={<MyRequestsView />} />
      <Route path="/hospital/find-donors" element={<HospitalFindDonorsView />} />
      <Route path="/register" element={<RegisterView />} />
      <Route path="/login" element={<LoginView />} />
    </Route>
    <Route element={<AdminLayout />}>
      <Route path="/dashboard" element={<AdminDashboardView />} />
      <Route path="/admin/find-donors" element={<AdminFindDonorsView />} />
      <Route path="/admin/add-donor" element={<AddDonorView />} />
      <Route path="/admin/view-donors" element={<ViewDonorsView />} />
      <Route path="/admin/edit-donor/:id?" element={<EditDonorView />} />
      <Route path="/admin/delete-donor" element={<DeleteDonorView />} />
      <Route path="/admin/add-hospital" element={<AddHospitalView />} />
      <Route path="/admin/view-hospitals" element={<ViewHospitalsView />} />
      <Route path="/admin/edit-hospital/:id?" element={<EditHospitalView />} />
      <Route path="/admin/delete-hospital" element={<DeleteHospitalView />} />
      <Route path="/admin/donations" element={<DonationsView />} />
      <Route path="/admin/blood-requests" element={<BloodRequestsView />} />
      <Route path="/admin/request-history" element={<RequestHistoryView />} />
      <Route path="/admin/blood-stock" element={<BloodStockView />} />
      <Route path="/admin/find-donor" element={<AdminFindDonorView />} />
    </Route>
  </Routes>
);


export default AppRoutes;


