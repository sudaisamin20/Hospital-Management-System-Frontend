# Frontend Architecture - Implementation Complete

## Overview

This document summarizes the complete frontend architecture refactoring implemented according to clean architecture principles.

## Folder Structure

```
src/
├── api/
│   ├── axiosInstance.ts
│   ├── auth.api.ts
│   ├── patient.api.ts
│   ├── doctor.api.ts
│   ├── receptionist.api.ts
│   ├── pharmacist.api.ts
│   ├── labAssistant.api.ts
│   ├── superadmin.api.ts
│   └── index.ts (barrel export)
├── constants/
│   └── apiRoutes.ts
├── hooks/
│   ├── useAppDispatch.ts
│   ├── useAppSelector.ts
│   ├── useModal.tsx
│   ├── FetchDataFromLS.tsx
│   └── index.ts (barrel export)
├── features/
│   ├── auth/
│   │   ├── authTypes.ts
│   │   ├── authSlice.ts
│   │   ├── auth.hooks.ts
│   │   └── index.ts (barrel export)
│   └── index.ts (barrel export)
├── components/
│   ├── auth/
│   │   ├── DoctorForm.tsx
│   │   ├── LabAssistantForm.tsx
│   │   ├── PatientForm.tsx
│   │   ├── PharmacistForm.tsx
│   │   ├── ReceptionistForm.tsx
│   │   ├── RoleSelector.tsx
│   │   ├── SuperAdminForm.tsx
│   │   └── index.ts (barrel export)
│   ├── dropdown/
│   │   ├── Dropdown.tsx
│   │   ├── DropdownButton.tsx
│   │   ├── DropdownContent.tsx
│   │   ├── DropdownItem.tsx
│   │   ├── DropdownContent.css
│   │   └── index.ts (barrel export)
│   ├── sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── SidebarConfig.tsx
│   │   ├── SidebarContentPage.tsx
│   │   └── index.ts (barrel export)
│   ├── Footer.tsx
│   ├── Modal.tsx
│   ├── Navbar.tsx
│   └── index.ts (barrel export)
├── pages/
│   ├── doctor/
│   │   ├── DoctorDashboard.tsx
│   │   ├── DoctorAppointments.tsx
│   │   ├── DoctorPatientProfile.tsx
│   │   ├── DoctorPrescriptions.tsx
│   │   ├── DoctorLabTestReports.tsx
│   │   ├── DoctorProfile.tsx
│   │   ├── Patients.tsx
│   │   └── index.ts (barrel export)
│   ├── patient/
│   │   ├── PatientDashboard.tsx
│   │   ├── BookAppointment.tsx
│   │   ├── MyAppointments.tsx
│   │   ├── PatientPrescriptions.tsx
│   │   ├── LabReports.tsx
│   │   ├── MedicalRecords.tsx
│   │   ├── Notifications.tsx
│   │   ├── PatientProfile.tsx
│   │   └── index.ts (barrel export)
│   ├── receptionist/
│   │   ├── ReceptionistDashboard.tsx
│   │   ├── ReceptionistAppointments.tsx
│   │   ├── AppointmentRescheduleRequests.tsx
│   │   └── index.ts (barrel export)
│   ├── pharmacist/
│   │   ├── PharmacistDashboard.tsx
│   │   ├── PharmacistProfile.tsx
│   │   ├── Prescriptions.tsx
│   │   ├── Inventory.tsx
│   │   ├── DispensedHistory.tsx
│   │   └── index.ts (barrel export)
│   ├── lab assistant/
│   │   ├── LabAssistantDashboard.tsx
│   │   ├── LabAssistantProfile.tsx
│   │   ├── LabTests.tsx
│   │   └── index.ts (barrel export)
│   ├── super admin/
│   │   ├── SuperAdminDashboard.tsx
│   │   ├── StaffManagement.tsx
│   │   ├── Patients.tsx
│   │   └── index.ts (barrel export)
│   ├── Home.tsx
│   ├── LearnMore.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   └── index.ts (barrel export)
├── App.tsx
├── index.css
├── App.css
├── main.tsx
└── ...
```

## Architecture Principles

### 1. **Separation of Concerns**

- **Components (Dumb)**: Presentational components with no business logic. Receive data via props and emit callbacks.
- **Hooks (Smart)**: Custom hooks handle all business logic, API calls, state management, and dispatch.
- **API Layer (Centralized)**: Domain-based API files with typed endpoints and error handling.

### 2. **API Layer**

#### Files Created

- **auth.api.ts**: Authentication endpoints (login, signup, logout, OTP verification)
- **patient.api.ts**: Patient profile, appointments, medical records
- **doctor.api.ts**: Doctor dashboard, patients, appointments, prescriptions, lab tests
- **receptionist.api.ts**: Appointment management, rescheduling, confirmation
- **pharmacist.api.ts**: Prescription dispensing, medicine inventory
- **labAssistant.api.ts**: Lab test management, results submission
- **superadmin.api.ts**: System administration, user management, dashboard stats

#### API Structure Pattern

```typescript
// Types for request/response
export interface PayloadType { ... }
export interface ResponseType { ... }

// API Functions
export const functionNameApi = (param: Type) =>
  axiosInstance.method<ResponseType>('/api/endpoint', payload);
```

#### Key Features

- ✅ Strongly typed with TypeScript (no `any` types)
- ✅ Proper error handling with AxiosError typing
- ✅ Centralized axiosInstance with interceptors
- ✅ Named exports only (no default exports)
- ✅ Uses centralized API_ENDPOINTS constants

### 3. **Constants**

#### constants/apiRoutes.ts

Centralizes all API endpoints and authentication routes:

```typescript
export const AUTH_BASE_ROUTES: Record<Role, string> = {
  patient: '/dashboard/patient',
  doctor: '/dashboard/doctor',
  receptionist: '/dashboard/receptionist',
  pharmacist: '/dashboard/pharmacist',
  labAssistant: '/dashboard/lab-assistant',
  superadmin: '/dashboard/superadmin',
};

export const DASHBOARD_ROUTES: Record<Role, string> = {
  patient: '/patient',
  doctor: '/doctor',
  // ...
};

export const API_ENDPOINTS = {
  AUTH: { LOGIN: '/api/auth/login', LOGOUT: '/api/auth/logout', ... },
  PATIENT: { PROFILE: '/api/patient/profile', ... },
  DOCTOR: { DASHBOARD: '/api/doctor/dashboard', ... },
  // ...
};
```

### 4. **Typed Redux Hooks**

#### hooks/useAppDispatch.ts

Type-safe Redux dispatch wrapper:

```typescript
export const useAppDispatch = () => useDispatch<AppDispatch>();
```

#### hooks/useAppSelector.ts

Type-safe Redux selector wrapper:

```typescript
export const useAppSelector = useSelector.withTypes<RootState>();
```

#### hooks/index.ts

Barrel export all hooks for clean imports:

```typescript
import { useAppDispatch, useAppSelector } from "../../hooks";
```

### 5. **Features (Redux)**

#### features/auth/

- **authTypes.ts**: TypeScript interfaces (User, Role, AuthState, etc.)
- **authSlice.ts**: Redux slice with actions (login, logout, loadUser, etc.)
- **auth.hooks.ts**: Custom hooks for auth logic
  - `useAuth()`: Get current auth state
  - `useLogin()`: Handle login API call
  - `useSignup()`: Handle signup API call
  - `useLogout()`: Handle logout
  - `useVerifyOtp()`: Verify OTP
  - `useUpdateProfile()`: Update user profile
  - `useRestoreAuth()`: Restore auth from localStorage

### 6. **Components (Reusable)**

#### Dumb Component Pattern

Components receive ALL props and call parent callbacks:

```typescript
interface ComponentProps {
  data: Type;
  onAction: (payload: Type) => void;
  isLoading?: boolean;
  error?: string;
}

export const Component = ({ data, onAction, isLoading, error }: ComponentProps) => {
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

#### Barrel Exports

Each component folder has index.ts:

```typescript
// components/auth/index.ts
export { DoctorForm } from "./DoctorForm";
export { PatientForm } from "./PatientForm";
// ...
```

### 7. **Pages (Role-Based)**

#### Organization

- `pages/patient/`: Patient dashboard and features
- `pages/doctor/`: Doctor dashboard and features
- `pages/receptionist/`: Receptionist dashboard and features
- `pages/pharmacist/`: Pharmacist dashboard and features
- `pages/lab assistant/`: Lab assistant dashboard and features
- `pages/super admin/`: Super admin dashboard and features

#### Barrel Exports

Each role folder has index.ts for clean imports:

```typescript
import { PatientDashboard, BookAppointment } from "../pages/patient";
```

## Usage Examples

### Importing from API Layer

```typescript
import {
  getPatientProfileApi,
  updatePatientProfileApi,
} from "../api/patient.api";
```

### Using Auth Hooks

```typescript
import { useAuth, useLogin, useLogout } from "../features/auth";

const MyComponent = () => {
  const { user, isAuthenticated, role } = useAuth();
  const login = useLogin();
  const logout = useLogout();

  // Use in component
};
```

### Using Typed Redux

```typescript
import { useAppDispatch, useAppSelector } from "../hooks";

const MyComponent = () => {
  const dispatch = useAppDispatch(); // Typed dispatch
  const data = useAppSelector((state) => state.data); // Typed state
};
```

### Importing Components

```typescript
import { DoctorForm, PatientForm, RoleSelector } from "../components/auth";
import { Sidebar, SidebarConfig } from "../components/sidebar";
```

### Importing Pages

```typescript
import { PatientDashboard, BookAppointment } from "../pages/patient";
import { DoctorDashboard, DoctorAppointments } from "../pages/doctor";
```

## Key Improvements

✅ **Type Safety**: No `any` types, full TypeScript coverage
✅ **Maintainability**: Clear separation between API, logic, and UI
✅ **Scalability**: Easy to add new features by following established patterns
✅ **DRY (Don't Repeat Yourself)**: Barrel exports prevent import path duplication
✅ **Error Handling**: Centralized error handling with proper typing
✅ **Single Source of Truth**:

- API endpoints in constants/apiRoutes.ts
- Auth state in features/auth
- Typed hooks in hooks/index.ts
  ✅ **Clean Imports**: Using barrel exports instead of deep imports

## Migration Notes

When working with existing files:

1. Replace direct imports with barrel exports
2. Use custom hooks instead of API calls in components
3. Keep components pure (no API calls, no Redux dispatch)
4. Move all business logic to hooks

### Before (Old Pattern)

```typescript
import { getPatientProfileApi } from "../api/patient.api";
import { useState } from "react";

const MyComponent = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    getPatientProfileApi().then((res) => setData(res.data));
  }, []);
};
```

### After (New Pattern)

```typescript
import { usePatientProfile } from "../features/patient/patient.hooks";

const MyComponent = () => {
  const { data, isLoading, error } = usePatientProfile();
};
```

## Testing

All components are designed to be easily testable:

- **Dumb Components**: Mock props and test output
- **Hooks**: Use hooks testing library to test logic
- **API Layer**: Mock axiosInstance to test API functions

## Next Steps

1. ✅ Create all API files
2. ✅ Set up typed hooks
3. ✅ Create barrel exports
4. ⏳ Update all existing components to use new barrel exports
5. ⏳ Create remaining feature hooks (patient, doctor, etc.)
6. ⏳ End-to-end testing
7. ⏳ Performance optimization

---

**Architecture Version**: 1.0  
**Last Updated**: 2024  
**Status**: Implementation in progress
