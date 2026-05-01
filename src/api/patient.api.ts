import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../constants/apiRoutes";

// Types
export interface PatientProfile {
  id: string;
  id_no: string;
  fullName: string;
  email: string;
  phoneNo: string;
  address: string;
  emergencyNo: string;
  dob: string;
  gender: string;
  photo?: string;
}

export interface UpdatePatientProfilePayload {
  fullName: string;
  email: string;
  phoneNo: string;
  address: string;
  emergencyNo: string;
  dob: string;
  gender: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PatientMedicalRecords {
  appointments: any[];
  consultations: any[];
  prescriptions: any[];
  labTests: any[];
  timeline: any[];
}

export interface DashboardData {
  stats: Stats;
  trends: Trends;
  upcomingAppointments: UpcomingAppointment[];
  recentActivity: RecentActivity[];
  healthMetrics: HealthMetrics | null;
  notifications: Notification[];
}

export interface Trend {
  label: string;
  direction: "up" | "down" | "neutral";
}

export interface Trends {
  upcomingAppointments: Trend;
  medicalRecords: Trend;
  activePrescriptions: Trend;
}

export interface Stats {
  upcomingAppointmentCount: number;
  totalMedicalRecords: number;
  activePrescriptions: number;
  outstandingBills: number;
}

export interface UpcomingAppointment {
  _id: string;
  doctorName: string;
  date: string;
  time: string;
  status: string;
  shift: string;
}

export interface RecentActivity {
  _id: string;
  type: "appointment" | "prescription" | "lab";
  message: string;
  time: string;
}

export interface HealthMetrics {
  bloodPressure: string | null;
  heartRate: number | null;
  temperature: number | null;
  weight: number | null;
  height: number | null;
  recordedAt: string;
}

// export interface IRecentActivityPatient {

// }

// API Functions
export const getPatientProfileApi = () =>
  axiosInstance.get<{ success: boolean; patient: PatientProfile }>(
    API_ENDPOINTS.PATIENT.PROFILE,
  );

export const updatePatientProfileApi = (payload: UpdatePatientProfilePayload) =>
  axiosInstance.put<{
    success: boolean;
    message: string;
    patient: PatientProfile;
  }>(API_ENDPOINTS.PATIENT.UPDATE_PROFILE, payload);

export const changePatientPasswordApi = (payload: ChangePasswordPayload) =>
  axiosInstance.put<{ success: boolean; message: string }>(
    API_ENDPOINTS.PATIENT.CHANGE_PASSWORD,
    payload,
  );

export const getPatientAppointmentsApi = (patientId: string) =>
  axiosInstance.get<{ success: boolean; appointments: any[] }>(
    API_ENDPOINTS.PATIENT.APPOINTMENTS.replace(":patientId", patientId),
  );

export const getPatientMedicalRecordsApi = (patientId: string) =>
  axiosInstance.get<{ success: boolean; records: PatientMedicalRecords }>(
    API_ENDPOINTS.PATIENT.MEDICAL_RECORDS.replace(":patientId", patientId),
  );

export const getPatientDashboardDataApi = () =>
  axiosInstance.get<{
    success: boolean;
    message: string;
    stats: {
      upcomingAppointmentCount: number;
      totalMedicalRecords: number;
      activePrescriptions: number;
      outstandingBills: number;
    };
    upcomingAppointments: UpcomingAppointment[];
    recentActivity: RecentActivity[];
    notifications: Notification[];
    healthMetrics: HealthMetrics;
  }>(API_ENDPOINTS.PATIENT.DASHBOARD_DATA);
