import "./App.css";
import Home from "./pages/Home";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SidebarContentPage from "./components/sidebar/SidebarContentPage";
import PatientDashboard from "./pages/patient/PatientDashboard";
import LearnMore from "./pages/LearnMore";
import { useLoadUser } from "./hooks/FetchDataFromLS";
import SuperAdminDashboard from "./pages/super admin/SuperAdminDashboard";
import Patients from "./pages/super admin/Patients";
import StaffManagement from "./pages/super admin/StaffManagement";
import MyAppointments from "./pages/patient/MyAppointments";
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";
import ReceptionistAppointments from "./pages/receptionist/ReceptionistAppointments";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import AppointmentRescheduleRequests from "./pages/receptionist/AppointmentRescheduleRequests";
import Notifications from "./pages/patient/Notifications";
import PharmacistDashboard from "./pages/pharmacist/PharmacistDashboard";
import Prescriptions from "./pages/pharmacist/Prescriptions";
import Inventory from "./pages/pharmacist/Inventory";
import PharmacistProfile from "./pages/pharmacist/PharmacistProfile";
import LabAssistantDashboard from "./pages/lab assistant/LabAssistantDashboard";
import LabTests from "./pages/lab assistant/LabTests";
import LabAssistantProfile from "./pages/lab assistant/LabAssistantProfile";
import DispensedHistory from "./pages/pharmacist/DispensedHistory";
import PatientPrescriptions from "./pages/patient/Prescriptions";
import LabReports from "./pages/patient/LabReports";
import PatientProfile from "./pages/patient/PatientProfile";
import MedicalRecords from "./pages/patient/MedicalRecords";

function App() {
  useLoadUser();
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn-more" element={<LearnMore />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/patient" element={<SidebarContentPage />}>
          <Route index element={<Navigate to="/patient/dashboard" />} />
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="my-appointments" element={<MyAppointments />} />
          <Route path="records" element={<MedicalRecords />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="prescriptions" element={<PatientPrescriptions />} />
          <Route path="lab-reports" element={<LabReports />} />
          <Route path="profile" element={<PatientProfile />} />
        </Route>
        <Route path="/receptionist" element={<SidebarContentPage />}>
          <Route index element={<Navigate to="/receptionist/dashboard" />} />
          <Route path="dashboard" element={<ReceptionistDashboard />} />
          <Route path="appointments" element={<ReceptionistAppointments />} />
          <Route
            path="appointment-reschedule-request"
            element={<AppointmentRescheduleRequests />}
          />
        </Route>
        <Route path="/doctor" element={<SidebarContentPage />}>
          <Route index element={<Navigate to="/doctor/dashboard" />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
        </Route>
        <Route path="/superadmin" element={<SidebarContentPage />}>
          <Route index element={<Navigate to="/superadmin/dashboard" />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="all-patients" element={<Patients />} />
          <Route path="staff-management" element={<StaffManagement />} />
        </Route>
        <Route path="/pharmacist" element={<SidebarContentPage />}>
          <Route index element={<Navigate to="/pharmacist/dashboard" />} />
          <Route path="dashboard" element={<PharmacistDashboard />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="dispensed-history" element={<DispensedHistory />} />
          <Route path="profile" element={<PharmacistProfile />} />
        </Route>
        <Route path="lab-assistant" element={<SidebarContentPage />}>
          <Route index element={<Navigate to="/lab-assistant/dashboard" />} />
          <Route path="dashboard" element={<LabAssistantDashboard />} />
          <Route path="lab-tests" element={<LabTests />} />
          <Route path="profile" element={<LabAssistantProfile />} />
        </Route>
        <Route path="/:role/*" element={<SidebarContentPage />} />
      </Routes>
    </>
  );
}

export default App;
