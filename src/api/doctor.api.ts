import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../constants/apiRoutes";

// Types
export interface DoctorProfileData {
  _id: string;
  id_no: string;
  fullName: string;
  email: string;
  specialistId: {
    _id: string;
    name: string;
  };
  departmentId: {
    _id: string;
    name: string;
  };
  specialization: string;
  licenseNo: string;
  dob: string;
  doj: string;
  qualification: string;
  role: string;
  isActive: boolean;
  emergencyNo: string;
  maritalStatus: string;
  salary: string;
  createdAt: string;
  updatedAt: string;
  address: string;
  phoneNo: string;
  photo: string;
  yearsOfExperience: string;
}

export interface DoctorDashboardData {
  stats: {
    todayAppointments: number;
    pendingConsultations: number;
    completedToday: number;
    totalPatients: number;
    avgConsultationTime: number;
    completionRate: number;
  };
  nextPatients: any[];
  todayAppointments: any[];
  recentActivity: any[];
  notifications: any[];
}

export interface DoctorPatients {
  totalPatients: number;
  totalFollowUpRequired: number;
  totalActiveCases: number;
  patients: any[];
}

// API Functions
export const getDoctorProfileApi = () =>
  axiosInstance.get<{ success: boolean; doctor: DoctorProfileData }>(
    API_ENDPOINTS.DOCTOR.PROFILE,
  );

export const getDoctorDashboardApi = (doctorId: string) =>
  axiosInstance.get<{ success: boolean; data: DoctorDashboardData }>(
    API_ENDPOINTS.DOCTOR.DASHBOARD.replace(":doctorId", doctorId),
  );

export const getDoctorPatientsApi = (doctorId: string) =>
  axiosInstance.get<{ success: boolean; patientRecords: DoctorPatients }>(
    API_ENDPOINTS.DOCTOR.PATIENTS,
  );

export const getDoctorAppointmentsApi = (doctorId: string) =>
  axiosInstance.get<{ success: boolean; appointments: any[] }>(
    API_ENDPOINTS.DOCTOR.APPOINTMENTS.replace(":doctorId", doctorId),
  );

export const getDoctorPrescriptionsApi = () =>
  axiosInstance.get<{ success: boolean; prescriptions: any[] }>(
    API_ENDPOINTS.DOCTOR.PRESCRIPTIONS,
  );

export const getDoctorLabTestsApi = () =>
  axiosInstance.get<{ success: boolean; labTests: any[] }>(
    API_ENDPOINTS.DOCTOR.LAB_TESTS,
  );

export const updateDoctorProfileApi = (formData: FormData) =>
  axiosInstance.put<{
    success: boolean;
    message: string;
    doctor: DoctorProfileData;
  }>(API_ENDPOINTS.DOCTOR.PROFILE_UPDATE, formData);
