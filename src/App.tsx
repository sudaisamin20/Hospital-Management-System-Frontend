import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

// Shared Pages
import { Home, LearnMore, Login, Signup } from "./pages";

// Components
import { SidebarContentPage } from "./components/sidebar";

// Hooks
import { useLoadUser } from "./hooks";

// Patient Pages
import {
  BookAppointment,
  LabReports,
  MedicalRecords,
  MyAppointments,
  PatientNotifications,
  PatientDashboard,
  PatientPrescriptions,
  PatientProfile,
} from "./pages/patient";

// Doctor Pages
import {
  DoctorAppointments,
  DoctorDashboard,
  DoctorLabTestReports,
  DoctorPatientProfile,
  DoctorPrescriptions,
  DoctorProfile,
  Patients as DoctorPatients,
  DoctorNotifications,
} from "./pages/doctor";

// Receptionist Pages
import {
  AppointmentRescheduleRequests,
  ReceptionistAppointments,
  ReceptionistDashboard,
  ReceptionistNotifications,
} from "./pages/receptionist";

// Pharmacist Pages
import {
  DispensedHistory,
  Inventory,
  PharmacistDashboard,
  PharmacistProfile,
  Prescriptions,
} from "./pages/pharmacist";

// Lab Assistant Pages
import {
  LabAssistantDashboard,
  LabAssistantProfile,
  LabTests,
} from "./pages/lab assistant";

// Super Admin Pages
import {
  Patients,
  StaffManagement,
  SuperAdminDashboard,
} from "./pages/super admin";

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
          <Route path="book-appointment" element={<BookAppointment />} />
          <Route path="my-appointments" element={<MyAppointments />} />
          <Route path="records" element={<MedicalRecords />} />
          <Route path="notifications" element={<PatientNotifications />} />
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
          <Route path="notifications" element={<ReceptionistNotifications />} />
        </Route>
        <Route path="/doctor" element={<SidebarContentPage />}>
          <Route index element={<Navigate to="/doctor/dashboard" />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route
            path="patients/patient-profile/:patientId"
            element={<DoctorPatientProfile />}
          />
          <Route path="prescriptions" element={<DoctorPrescriptions />} />
          <Route path="lab-test-reports" element={<DoctorLabTestReports />} />
          <Route path="profile" element={<DoctorProfile />} />
          <Route path="notifications" element={<DoctorNotifications />} />
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
