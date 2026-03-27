sa# Code Architecture Guide

> This is the **reference document** for how every feature in this codebase must be structured.
> The `auth` module has been fully refactored to this architecture. All new features and refactors must follow this guide.

---

## Guiding Principles

1. **Components are dumb** — they render UI only. No API calls, no business logic.
2. **Hooks own the logic** — form state, API calls, dispatch, navigation all live in custom hooks.
3. **API layer is centralized** — one Axios instance, one file per domain for API functions.
4. **Types are shared** — all interfaces live in `*.types.ts`, imported everywhere they're needed.
5. **Barrel exports** — every folder has an `index.ts` so imports stay clean.
6. **No `any`** — strict TypeScript throughout.
7. **No `console.log`** — remove before committing.
8. **Named exports only** — no default exports (easier refactoring and IDE support).

---

## Folder Structure

```
src/
│
├── api/                            # ★ API LAYER — all HTTP calls live here
│   ├── axiosInstance.ts            # Single Axios instance with interceptors
│   ├── auth.api.ts                 # Auth endpoints (login, register)
│   ├── patient.api.ts              # Patient endpoints
│   ├── doctor.api.ts               # Doctor endpoints
│   ├── receptionist.api.ts         # Receptionist endpoints
│   ├── pharmacist.api.ts           # Pharmacist endpoints
│   ├── labAssistant.api.ts         # Lab Assistant endpoints
│   └── superadmin.api.ts           # Super Admin endpoints
│
├── app/
│   └── store.ts                    # Redux store + RootState + AppDispatch types
│
├── constants/
│   └── apiRoutes.ts                # All API URL paths and dashboard routes
│
├── features/                       # ★ FEATURE LAYER — domain logic per role
│   └── auth/
│       ├── auth.types.ts           # TypeScript interfaces (User, Role, etc.)
│       ├── auth.slice.ts           # Redux slice + selectors
│       ├── auth.hooks.ts           # Custom hooks: useLogin, useSignup, useLogout
│       └── index.ts                # Barrel export
│
├── hooks/                          # ★ SHARED HOOKS — used across features
│   ├── useAppDispatch.ts           # Typed dispatch hook
│   ├── useAppSelector.ts           # Typed selector hook
│   └── useLoadUser.ts              # Rehydrates auth state from localStorage
│
├── components/                     # ★ UI COMPONENTS — render only, no logic
│   ├── auth/
│   │   ├── LoginForm.tsx           # Unified login form (all roles)
│   │   ├── RoleSelector.tsx        # Role dropdown
│   │   └── index.ts                # Barrel export
│   ├── dropdown/
│   ├── sidebar/
│   ├── Footer.tsx
│   ├── Modal.tsx
│   └── Navbar.tsx
│
├── pages/                          # ★ PAGE LAYER — route-level components
│   ├── patient/
│   ├── doctor/
│   ├── receptionist/
│   ├── pharmacist/
│   ├── lab assistant/
│   ├── super admin/
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   └── LearnMore.tsx
│
├── App.tsx                         # Route definitions
└── main.tsx                        # Entry point + providers
```

---

## Data Flow

```
User Action (click / type)
        │
        ▼
  Page / Component          (renders UI, calls hook handlers)
        │
        ▼
  Custom Hook               (owns state, calls API, dispatches)
        │
        ├──► API Function   (axiosInstance call, typed response)
        │         │
        │         ▼
        │    Backend REST API
        │         │
        │         ▼
        │    Typed Response
        │
        ├──► Redux dispatch  (updates global state)
        │
        └──► navigate()     (redirects user)
```

---

## Layer-by-Layer Guide

---

### 1. API Layer (`src/api/`)

**Rule:** All `axios` calls live here. Components and hooks never import `axios` directly.

#### `axiosInstance.ts` — the single Axios instance

```typescript
// src/api/axiosInstance.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token to every request automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers['auth-token'] = token;
  return config;
});

// Handle 401 globally — auto logout
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { axiosInstance };
```

#### Domain API files — one per role

```typescript
// src/api/patient.api.ts
import { axiosInstance } from './axiosInstance';

export interface UpdateProfilePayload {
  fullName: string;
  phoneNo: string;
  address: string;
  emergencyNo: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
}

export const getPatientProfileApi = () =>
  axiosInstance.get<PatientProfileResponse>('/api/patient/profile-details');

export const updatePatientProfileApi = (payload: UpdateProfilePayload) =>
  axiosInstance.put<UpdateProfileResponse>('/api/patient/update-profile', payload);

export const changePatientPasswordApi = (payload: { currentPassword: string; newPassword: string }) =>
  axiosInstance.put('/api/patient/change-password', payload);
```

**Naming Rules:**
- File: `{domain}.api.ts`
- Function: `{verb}{Domain}{Action}Api` — e.g., `getPatientProfileApi`, `updateDoctorAppointmentApi`
- Always export typed request/response interfaces from the same file

---

### 2. Constants (`src/constants/`)

```typescript
// src/constants/apiRoutes.ts
import type { Role } from '../features/auth/auth.types';

// Maps each role to its login API base path
export const AUTH_BASE_ROUTES: Record<Role, string> = {
  patient:      '/api/patient/auth',
  doctor:       '/api/doctor/auth',
  receptionist: '/api/receptionist/auth',
  pharmacist:   '/api/pharmacist/auth',
  labAssistant: '/api/labAssistant/auth',
  superadmin:   '/api/superadmin/auth',
};

// Maps each role to its dashboard route
export const DASHBOARD_ROUTES: Record<Role, string> = {
  patient:      '/patient/dashboard',
  doctor:       '/doctor/dashboard',
  receptionist: '/receptionist/dashboard',
  pharmacist:   '/pharmacist/dashboard',
  labAssistant: '/lab-assistant/dashboard',
  superadmin:   '/superadmin/dashboard',
};
```

---

### 3. Feature Layer (`src/features/{feature}/`)

Each feature folder has exactly 4 files:

```
features/auth/
├── auth.types.ts    # TypeScript interfaces
├── auth.slice.ts    # Redux slice + selectors
├── auth.hooks.ts    # Custom hooks
└── index.ts         # Barrel export
```

#### `auth.types.ts` — interfaces only, no logic

```typescript
export type Role = 'patient' | 'doctor' | 'receptionist' | 'superadmin' | 'pharmacist' | 'labAssistant';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  token: string | null;
}
// ... role-specific interfaces
```

#### `auth.slice.ts` — slice + typed selectors

```typescript
// Selectors live with the slice (colocation)
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectRole = (state: RootState) => state.auth.role;
```

#### `auth.hooks.ts` — all logic for the feature

```typescript
// One hook per major user action
export const useLogin = (role: Role) => { ... };
export const useSignup = () => { ... };
export const useLogout = () => { ... };
```

#### `index.ts` — barrel export

```typescript
// Re-export everything so consumers import from one place
export * from './auth.types';
export * from './auth.slice';
export * from './auth.hooks';
```

---

### 4. Shared Hooks (`src/hooks/`)

Always use typed hooks — never raw `useDispatch` or `useSelector`.

```typescript
// src/hooks/useAppDispatch.ts
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../app/store';
export const useAppDispatch = () => useDispatch<AppDispatch>();

// src/hooks/useAppSelector.ts
import { useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState } from '../app/store';
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

**Usage in any hook or component:**
```typescript
// ✅ CORRECT
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
const dispatch = useAppDispatch();
const user = useAppSelector(selectCurrentUser);

// ❌ WRONG
import { useDispatch, useSelector } from 'react-redux';
const dispatch = useDispatch();              // not typed
const user = useSelector((s: any) => s.auth.user); // any = bad
```

---

### 5. Components (`src/components/`)

**Rules:**
- No API calls
- No `axios`
- No business logic
- Receives data via props, calls handler functions from props or hooks
- Has its own `index.ts` barrel

```typescript
// src/components/auth/LoginForm.tsx
interface LoginFormProps {
  role: Role;
}

export function LoginForm({ role }: LoginFormProps) {
  const { formData, handleChange, handleSubmit, isLoading } = useLogin(role);
  // render only
}
```

---

### 6. Pages (`src/pages/`)

Pages are **thin wrappers** — they compose components and hooks, handle layout.

```typescript
// src/pages/Login.tsx
export function Login() {
  const [role, setRole] = useState<Role>('patient');
  return (
    <div>
      <RoleSelector role={role} setRole={setRole} />
      <LoginForm role={role} />
    </div>
  );
}
```

---

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Files | kebab-case | `auth.hooks.ts`, `login-form.tsx` |
| Components | PascalCase | `LoginForm`, `RoleSelector` |
| Hooks | camelCase with `use` prefix | `useLogin`, `useAppDispatch` |
| API functions | camelCase with `Api` suffix | `loginApi`, `getPatientProfileApi` |
| Types/Interfaces | PascalCase | `User`, `LoginPayload`, `AuthState` |
| Redux actions | camelCase | `login`, `logout`, `updateUserProfile` |
| Redux selectors | camelCase with `select` prefix | `selectCurrentUser`, `selectRole` |
| Constants | SCREAMING_SNAKE_CASE | `AUTH_BASE_ROUTES`, `DASHBOARD_ROUTES` |
| Event handlers | camelCase with `handle` prefix | `handleSubmit`, `handleChange` |

---

## Error Handling Pattern

All API errors must be caught and typed — never use catch with `any`.

```typescript
import type { AxiosError } from 'axios';

try {
  const response = await someApi(payload);
  // handle success
} catch (error: unknown) {
  const axiosError = error as AxiosError<{ message: string }>;
  const message = axiosError.response?.data?.message ?? 'Something went wrong.';
  toast.error(message);
}
```

---

## How to Add a New Feature (Step-by-Step)

Example: adding **Doctor Profile** feature.

### Step 1 — API function (`src/api/doctor.api.ts`)
```typescript
export interface DoctorProfile { id: string; fullName: string; specialization: string; ... }
export interface UpdateDoctorProfilePayload { fullName: string; specialization: string; ... }

export const getDoctorProfileApi = () =>
  axiosInstance.get<{ success: boolean; doctor: DoctorProfile }>('/api/doctor/profile-details');

export const updateDoctorProfileApi = (payload: UpdateDoctorProfilePayload) =>
  axiosInstance.put('/api/doctor/update-profile', payload);
```

### Step 2 — Hook (`src/features/doctor/doctor.hooks.ts`)
```typescript
export const useDoctorProfile = () => {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getDoctorProfileApi();
        setProfile(response.data.doctor);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message: string }>;
        toast.error(axiosError.response?.data?.message ?? 'Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return { profile, isLoading };
};
```

### Step 3 — Page (`src/pages/doctor/DoctorProfile.tsx`)
```typescript
export function DoctorProfile() {
  const { profile, isLoading } = useDoctorProfile();

  if (isLoading) return <div>Loading...</div>;
  if (!profile) return <div>No profile found.</div>;

  return <div>{profile.fullName}</div>;
}
```

### Step 4 — Add route in `App.tsx`
```typescript
<Route path="profile" element={<DoctorProfile />} />
```

### Step 5 — Verify sidebar link exists in `SidebarConfig.tsx`
```typescript
{ title: 'Profile', path: '/doctor/profile', icon: <User /> }
```

---

## Import Order (enforced by ESLint)

```typescript
// 1. React
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// 3. Internal — api layer
import { getDoctorProfileApi } from '../../api/doctor.api';

// 4. Internal — features / hooks
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { selectCurrentUser } from '../../features/auth';

// 5. Internal — components
import { Modal } from '../Modal';

// 6. Types (always use `import type`)
import type { DoctorProfile } from '../../features/doctor/doctor.types';
```

---

## What NOT To Do

```typescript
// ❌ Axios in a component
const MyComponent = () => {
  const handleClick = () => axios.post('/api/something', data); // WRONG
};

// ❌ Untyped dispatch
const dispatch = useDispatch(); // WRONG — use useAppDispatch()

// ❌ any type
const error: any = ...; // WRONG

// ❌ console.log left in code
console.log('formdata:', formData); // WRONG — remove before commit

// ❌ Default export
export default MyComponent; // WRONG — use named export

// ❌ Hardcoded API URL in component
fetch('http://localhost:5000/api/patient/login', ...) // WRONG

// ❌ Business logic in component
const MyComponent = () => {
  const handleSubmit = async () => {
    const response = await axios.post(...); // WRONG — put this in a hook
    dispatch(login(response.data));          // WRONG — put this in a hook
    navigate('/dashboard');                  // WRONG — put this in a hook
  };
};
```

---

## Auth Module — Reference Implementation

The `auth` module is the canonical example of this architecture. When in doubt, look at:

| File | What it shows |
|------|---------------|
| [src/api/axiosInstance.ts](src/api/axiosInstance.ts) | How to set up Axios with interceptors |
| [src/api/auth.api.ts](src/api/auth.api.ts) | How to write typed API functions |
| [src/features/auth/auth.hooks.ts](src/features/auth/auth.hooks.ts) | How to write feature hooks (useLogin, useSignup) |
| [src/features/auth/auth.slice.ts](src/features/auth/auth.slice.ts) | How to write a Redux slice with selectors |
| [src/components/auth/LoginForm.tsx](src/components/auth/LoginForm.tsx) | How to write a form component using a hook |
| [src/hooks/useAppDispatch.ts](src/hooks/useAppDispatch.ts) | How to write typed shared hooks |
