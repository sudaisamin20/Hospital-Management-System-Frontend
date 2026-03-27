import type { Role } from '../features/auth/authTypes';

// Maps each role to its auth API base path
export const AUTH_BASE_ROUTES: Record<Role, string> = {
  patient:      '/api/patient/auth',
  doctor:       '/api/doctor/auth',
  receptionist: '/api/receptionist/auth',
  pharmacist:   '/api/pharmacist/auth',
  labAssistant: '/api/labAssistant/auth',
  superadmin:   '/api/superadmin/auth',
};

// Maps each role to its backend response key (backend returns user under different keys)
export const AUTH_RESPONSE_KEYS: Record<Role, string> = {
  patient:      'patient',
  doctor:       'doctor',
  receptionist: 'receptionist',
  pharmacist:   'pharmacist',
  labAssistant: 'labAssistant',
  superadmin:   'superAdmin',
};

// Maps each role to its frontend dashboard route
export const DASHBOARD_ROUTES: Record<Role, string> = {
  patient:      '/patient/dashboard',
  doctor:       '/doctor/dashboard',
  receptionist: '/receptionist/dashboard',
  pharmacist:   '/pharmacist/dashboard',
  labAssistant: '/lab-assistant/dashboard',
  superadmin:   '/superadmin/dashboard',
};
