import type { Role } from "../features/auth/authTypes";

// Maps each role to its login API base path
export const AUTH_BASE_ROUTES: Record<Role, string> = {
  patient: "/patient/auth",
  doctor: "/doctor/auth",
  receptionist: "/receptionist/auth",
  pharmacist: "/pharmacist/auth",
  labAssistant: "/lab-assistant/auth",
  superadmin: "/superadmin/auth",
};

// Maps each role to its dashboard route
export const DASHBOARD_ROUTES: Record<Role, string> = {
  patient: "/patient/dashboard",
  doctor: "/doctor/dashboard",
  receptionist: "/receptionist/dashboard",
  pharmacist: "/pharmacist/dashboard",
  labAssistant: "/lab-assistant/dashboard",
  superadmin: "/superadmin/dashboard",
};

// API Endpoints by domain
export const API_ENDPOINTS = {
  AUTH: {
    PATIENT_LOGIN: "/patient/auth/login",
    PATIENT_REGISTER: "/patient/auth/register",
    DOCTOR_LOGIN: "/doctor/auth/login",
    DOCTOR_REGISTER: "/doctor/auth/register",
    RECEPTIONIST_LOGIN: "/receptionist/auth/login",
    PHARMACIST_LOGIN: "/pharmacist/auth/login",
    LAB_ASSISTANT_LOGIN: "/lab/auth/login",
    SUPERADMIN_LOGIN: "/superadmin/auth/login",
  },
  PATIENT: {
    PROFILE: "/patient/profile-details",
    UPDATE_PROFILE: "/patient/update-profile",
    CHANGE_PASSWORD: "/patient/change-password",
    APPOINTMENTS: "/appointment/fetch/patient-all-appointments/:patientId",
    MEDICAL_RECORDS: "/patient/medical-records/:patientId",
    DASHBOARD_DATA: "/patient/fetch/dashboard-data",
  },
  DOCTOR: {
    PROFILE: "/doctor/profile-details",
    DASHBOARD: "/doctor/dashboard/:doctorId",
    PATIENTS: "/doctor/patients",
    APPOINTMENTS: "/doctor/appointments/:doctorId",
    PRESCRIPTIONS: "/doctor/prescriptions",
    LAB_TESTS: "/doctor/fetch/lab-tests",
    PROFILE_UPDATE: "/doctor/update-profile",
    CHANGE_PASSWORD: "/doctor/change-password",
  },
  RECEPTIONIST: {
    MARK_AS_SEEN_RES_REQ_APTS:
      "/receptionist/appointment/mark-as-seen/res-req-apts",
    DASHBOARD_DATA: "/receptionist/fetch/dashboard-data",
  },
  APPOINTMENT: {
    CREATE: "/appointment/add-appointment",
    LIST: "/appointment/fetch/all-appointments/:recId",
    CANCEL: "/appointment/cancel-appointment",
    UPDATE_STATUS: "/appointment/confirm-apt-status",
    MARK_AS_SEEN: "/appointment/mark-as-seen",
    REJECT_RESCHEDULE_REQUEST: "/appointment/reject-reschedule-request",
  },
  PRESCRIPTION: {
    CREATE: "/prescription/create-prescription",
    LIST: "prescription/fetch/all-prescriptions/:doctorId",
    MARK_AS_SEEN: "/prescription/mark-as-seen",
  },
  LAB_TEST: {
    CREATE: "/lab-orders/create",
    LIST: "/lab-orders/fetch/:patientId",
    MARK_AS_SEEN: "/lab/mark-as-seen",
  },
  NOTIFICATION: {
    FETCH: "/notification/fetch",
    MARK_ALL_AS_READ: "/notification/mark-all-as-read",
    MARK_AS_READ: "/notification/mark-as-read/:notificationId",
    DELETE: "/notification/delete/:notificationId",
    MARK_AS_SEEN: "/notification/mark-as-seen",
    UNREAD: "/notification/fetch/unread-count",
  },
} as const;
