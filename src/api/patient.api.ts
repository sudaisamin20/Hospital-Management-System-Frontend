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
