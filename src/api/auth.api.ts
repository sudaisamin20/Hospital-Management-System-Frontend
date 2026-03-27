import { axiosInstance } from './axiosInstance';
import { AUTH_BASE_ROUTES } from '../constants/apiRoutes';
import type { Role } from '../features/auth/authTypes';

// ─── Login ────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  id_no: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  // User data is returned under a role-specific key (e.g. "patient", "doctor")
  [key: string]: unknown;
}

export const loginApi = (role: Role, payload: LoginPayload) =>
  axiosInstance.post<LoginResponse>(`${AUTH_BASE_ROUTES[role]}/login`, payload);

// ─── Patient Registration ─────────────────────────────────────────────────────

export interface RegisterPatientPayload {
  fullName: string;
  dob: string;
  gender: string;
  phoneNo: string;
  email: string;
  address: string;
  emergencyNo: string;
  password: string;
  agreeTerms: boolean;
}

export interface RegisterPatientResponse {
  success: boolean;
  message: string;
  patient: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    dob: string;
    gender: string;
    phoneNo: string;
    address: string;
    emergencyNo: string;
  };
  token: string;
}

export const registerPatientApi = (payload: RegisterPatientPayload) =>
  axiosInstance.post<RegisterPatientResponse>('/api/patient/auth/register', payload);
