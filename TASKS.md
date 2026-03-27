# Task List — Hospital Management System

> **Total:** 40 tasks &nbsp;|&nbsp; **Done:** 0 &nbsp;|&nbsp; **In Progress:** 0 &nbsp;|&nbsp; **Pending:** 40
>
> Legend: `[ ]` Pending &nbsp; `[~]` In Progress &nbsp; `[x]` Done

---

## 🏗️ A — Architecture Refactor
> Bring all existing files to the new architecture standard (API layer + hooks + typed dispatch)

- [ ] **A1** — Refactor `PatientProfile.tsx` — move axios to `patient.api.ts`, extract `usePatientProfile` hook
- [ ] **A2** — Refactor `DoctorDashboard.tsx` — move API call to `doctor.api.ts`, extract `useDoctorDashboard` hook
- [ ] **A3** — Refactor `DoctorAppointments.tsx` — move API calls to `doctor.api.ts`, extract `useDoctorAppointments` hook
- [ ] **A4** — Refactor `ReceptionistAppointments.tsx` — move API calls to `receptionist.api.ts`, extract hook
- [ ] **A5** — Refactor `AppointmentRescheduleRequests.tsx` — move API calls to `receptionist.api.ts`, extract hook
- [ ] **A6** — Refactor `PharmacistDashboard.tsx` — move API calls to `pharmacist.api.ts`, extract `usePharmacistDashboard` hook
- [ ] **A7** — Refactor `Prescriptions.tsx` (Pharmacist) — move API calls to `pharmacist.api.ts`, extract hook
- [ ] **A8** — Refactor `Inventory.tsx` — move API calls to `pharmacist.api.ts`, extract `useInventory` hook
- [ ] **A9** — Refactor `DispensedHistory.tsx` — move API calls to `pharmacist.api.ts`, extract hook
- [ ] **A10** — Refactor `LabTests.tsx` — move API calls to `labAssistant.api.ts`, extract `useLabTests` hook
- [ ] **A11** — Refactor `StaffManagement.tsx` — move API calls to `superadmin.api.ts`, extract `useStaffManagement` hook
- [ ] **A12** — Refactor `SuperAdminDashboard.tsx` — move API calls to `superadmin.api.ts`, extract hook
- [ ] **A13** — Refactor all Patient pages — `MyAppointments`, `MedicalRecords`, `Prescriptions`, `LabReports`, `Notifications`
- [ ] **A14** — Replace all raw `useDispatch` / `useSelector` with `useAppDispatch` / `useAppSelector` across all files
- [ ] **A15** — Delete 6 old dead form files — `PatientForm`, `DoctorForm`, `ReceptionistForm`, `PharmacistForm`, `LabAssistantForm`, `SuperAdminForm`
- [ ] **A16** — Create all `src/api/` domain files — `patient.api.ts`, `doctor.api.ts`, `receptionist.api.ts`, `pharmacist.api.ts`, `labAssistant.api.ts`, `superadmin.api.ts`

---

## 🚨 F1–F6 — Priority 1: Critical Missing Features
> Core hospital workflow is broken without these

- [ ] **F1** — **Patient — Book Appointment** — multi-step flow: specialization → doctor → date → time slot → confirm
  - New file: `src/pages/patient/BookAppointment.tsx`
  - API: `POST /api/patient/appointments/book`
  - Add route in `App.tsx` + "Book Appointment" button on dashboard

- [ ] **F2** — **Patient — Billing page** — view all bills (paid/unpaid), itemized detail modal
  - New file: `src/pages/patient/Billing.tsx`
  - API: `GET /api/patient/bills`, `GET /api/patient/bills/:id`
  - Add route in `App.tsx`

- [ ] **F3** — **Receptionist — Dashboard** — replace stub with real stats
  - Edit file: `src/pages/receptionist/ReceptionistDashboard.tsx`
  - Stats: today's appointments, walk-ins, pending reschedule requests, unpaid bills
  - API: `GET /api/receptionist/dashboard`

- [ ] **F4** — **Receptionist — Patient Registration** — register walk-in patients
  - New file: `src/pages/receptionist/PatientRegistration.tsx`
  - API: `POST /api/receptionist/register-patient`
  - Add route in `App.tsx`

- [ ] **F5** — **Receptionist — Billing** — create bills, line items, mark as paid
  - New file: `src/pages/receptionist/ReceptionistBilling.tsx`
  - API: `GET /api/receptionist/bills`, `POST /api/receptionist/bills/create`, `PUT /api/receptionist/bills/:id/mark-paid`
  - Add route in `App.tsx`

- [ ] **F6** — **Doctor — Patients List** — all patients assigned to this doctor, click to view history
  - New file: `src/pages/doctor/DoctorPatients.tsx`
  - API: `GET /api/doctor/patients`, `GET /api/doctor/patients/:id`
  - Add route in `App.tsx`

---

## ⚠️ F7–F12 — Priority 2: Important Missing Features
> Incomplete role experience

- [ ] **F7** — **Doctor — Prescriptions page** — list all prescriptions written, filter Active / Dispensed / All
  - New file: `src/pages/doctor/DoctorPrescriptions.tsx`
  - API: `GET /api/doctor/prescriptions`
  - Add route in `App.tsx`

- [ ] **F8** — **Doctor — Profile** — view/edit profile, change photo, change password
  - New file: `src/pages/doctor/DoctorProfile.tsx`
  - API: `GET /api/doctor/profile-details`, `PUT /api/doctor/update-profile`, `PUT /api/doctor/change-password`, `PUT /api/doctor/change-photo`
  - Add route in `App.tsx`

- [ ] **F9** — **Pharmacist — Profile** — replace stub with full profile (same pattern as PatientProfile)
  - Edit file: `src/pages/pharmacist/PharmacistProfile.tsx`
  - API: `GET /api/pharmacist/profile-details`, `PUT /api/pharmacist/update-profile`, `PUT /api/pharmacist/change-password`

- [ ] **F10** — **Lab Assistant — Dashboard** — replace stub with real stats
  - Edit file: `src/pages/lab assistant/LabAssistantDashboard.tsx`
  - Stats: pending tests, completed today, total this month
  - API: `GET /api/labAssistant/dashboard`

- [ ] **F11** — **Lab Assistant — Profile** — replace stub with full profile
  - Edit file: `src/pages/lab assistant/LabAssistantProfile.tsx`
  - API: `GET /api/labAssistant/profile-details`, `PUT /api/labAssistant/update-profile`, `PUT /api/labAssistant/change-password`

- [ ] **F12** — **Super Admin — All Patients** — replace stub with searchable table of all registered patients
  - Edit file: `src/pages/super admin/Patients.tsx`
  - API: `GET /api/superadmin/patients`
  - Features: search by name/email, view patient profile in modal, deactivate account

---

## 📊 F13–F14 — Priority 3: Reporting & Configuration

- [ ] **F13** — **Super Admin — Reports** — revenue, appointments, staff activity reports with date range filter
  - New file: `src/pages/super admin/Reports.tsx`
  - API: `GET /api/superadmin/reports/revenue`, `GET /api/superadmin/reports/appointments`, `GET /api/superadmin/reports/staff-activity`
  - Add route in `App.tsx`

- [ ] **F14** — **Super Admin — Settings** — hospital name, working hours, appointment slot duration, departments
  - New file: `src/pages/super admin/Settings.tsx`
  - API: `GET /api/superadmin/settings`, `PUT /api/superadmin/settings`
  - Add route in `App.tsx`

---

## ✨ E — Enhancements & Polish

- [ ] **E1** — **Global error handling** — add toast for 500 / network errors in `axiosInstance.ts` response interceptor
  - Edit file: `src/api/axiosInstance.ts`

- [ ] **E2** — **Replace all mock dashboard data** — connect Patient dashboard, Doctor dashboard, Super Admin dashboard to real APIs
  - Edit files: `PatientDashboard.tsx`, `DoctorDashboard.tsx`, `SuperAdminDashboard.tsx`

- [ ] **E3** — **Loading skeleton UI** — replace plain spinners with skeleton placeholder cards on all data-fetching pages
  - New shared component: `src/components/Skeleton.tsx`

- [ ] **E4** — **Empty state component** — "No records found" / "No appointments yet" UI for all list pages
  - New shared component: `src/components/EmptyState.tsx`

- [ ] **E5** — **Notification polling** — auto-fetch notifications every 60 seconds, show unread count badge on sidebar link
  - New shared hook: `src/hooks/useNotificationPoll.ts`
  - Edit: `src/components/sidebar/Sidebar.tsx`

- [ ] **E6** — **Protected routes** — redirect unauthenticated users to `/login`, redirect wrong-role users to their own dashboard
  - New component: `src/components/ProtectedRoute.tsx`
  - Edit: `src/App.tsx`

- [ ] **E7** — **First-login password change** — force staff (created by admin) to change password on first login
  - New page: `src/pages/ChangePassword.tsx`
  - API: `PUT /api/{role}/auth/change-password`

- [ ] **E8** — **Client-side form validation** — required fields, email format, password strength on all forms
  - Edit: `LoginForm.tsx`, `Signup.tsx`, all booking and registration forms

- [ ] **E9** — **Mobile responsive sidebar** — fix overlay behavior and close-on-tap-outside on mobile
  - Edit: `src/components/sidebar/Sidebar.tsx`

- [ ] **E10** — **Page document titles** — set `document.title` per page for browser tab clarity
  - Edit: all page components

---

## 📋 Progress Tracker

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| A — Architecture Refactor | 16 | 0 | 16 |
| F1–F6 — Critical Features | 6 | 0 | 6 |
| F7–F12 — Important Features | 6 | 0 | 6 |
| F13–F14 — Reporting | 2 | 0 | 2 |
| E — Enhancements | 10 | 0 | 10 |
| **Total** | **40** | **0** | **40** |

---

## ✅ Completed

> Tasks will be moved here as they are finished.

- [x] **AUTH** — Refactor auth module to new architecture (axiosInstance, auth.api.ts, auth.hooks.ts, LoginForm, typed hooks)
- [x] **AUTH** — Create `ARCHITECTURE.md` — code architecture reference guide
- [x] **AUTH** — Create `PROJECT.md` — full feature breakdown and MVP plan
- [x] **AUTH** — Add Redux selectors (`selectCurrentUser`, `selectIsAuthenticated`, `selectRole`) to `authSlice.ts`
- [x] **AUTH** — Create `useAppDispatch` and `useAppSelector` typed hooks
- [x] **AUTH** — Create `constants/apiRoutes.ts` — centralized route constants
