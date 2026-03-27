# Hospital Management System — Project Documentation

> **Target:** Single small hospital MVP
> **Stack:** React 19, TypeScript, Vite, Redux Toolkit, Axios, Tailwind CSS, DaisyUI, React Router v7
> **Backend:** REST API at `http://localhost:5000` (via `VITE_BASE_URL`)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Roles & Access Control](#2-roles--access-control)
3. [Architecture](#3-architecture)
4. [Authentication Flow](#4-authentication-flow)
5. [Patient Module](#5-patient-module)
6. [Doctor Module](#6-doctor-module)
7. [Receptionist Module](#7-receptionist-module)
8. [Pharmacist Module](#8-pharmacist-module)
9. [Lab Assistant Module](#9-lab-assistant-module)
10. [Super Admin Module](#10-super-admin-module)
11. [Core Hospital Workflows](#11-core-hospital-workflows)
12. [Implementation Status](#12-implementation-status)
13. [Missing Features — MVP Backlog](#13-missing-features--mvp-backlog)
14. [Implementation Roadmap](#14-implementation-roadmap)

---

## 1. Project Overview

A web-based Hospital Management System (HMS) for a **single hospital** with role-based dashboards for every staff member and patient. The system manages the full lifecycle of a patient visit:

```
Patient registers → Books appointment → Receptionist confirms →
Doctor consults → Writes prescription → Pharmacist dispenses →
Lab Assistant runs tests → Patient views results/bills
```

---

## 2. Roles & Access Control

| Role | Login URL | Dashboard | Description |
|------|-----------|-----------|-------------|
| `patient` | `/login` → Patient tab | `/patient/dashboard` | Self-register, book appointments, view records |
| `doctor` | `/login` → Doctor tab | `/doctor/dashboard` | Manage appointments, write prescriptions |
| `receptionist` | `/login` → Receptionist tab | `/receptionist/dashboard` | Manage appointments, register walk-ins, billing |
| `pharmacist` | `/login` → Pharmacist tab | `/pharmacist/dashboard` | Dispense medicines, manage inventory |
| `labAssistant` | `/login` → Lab Assistant tab | `/lab-assistant/dashboard` | Manage lab tests, enter results |
| `superadmin` | `/login` → Super Admin tab | `/superadmin/dashboard` | Manage staff, view system-wide stats |

**Route Protection:** Role is read from Redux store (`state.auth.role`). Each `/role/*` route group renders the correct sidebar via `SidebarConfig`.

**Auth Token:** Stored as `authToken` in `localStorage`. Sent as `auth-token` header in every Axios request.

---

## 3. Architecture

```
src/
├── app/
│   └── store.ts                    # Redux store (auth reducer only)
├── assets/                         # Background images
├── components/
│   ├── auth/                       # Role-specific login forms
│   ├── dropdown/                   # Reusable dropdown component
│   ├── sidebar/
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── SidebarConfig.tsx       # Nav links per role
│   │   └── SidebarContentPage.tsx  # Layout: Sidebar + <Outlet />
│   ├── Footer.tsx
│   ├── Modal.tsx                   # Reusable confirmation/form modal
│   └── Navbar.tsx
├── features/
│   └── auth/
│       ├── authSlice.ts            # Redux slice: login, logout, loadUser, updateUserProfile
│       └── authTypes.ts            # TypeScript interfaces for all user types
├── hooks/
│   ├── FetchDataFromLS.tsx         # useLoadUser() — rehydrates Redux from localStorage
│   └── useModal.tsx                # Modal open/close state helper
├── pages/
│   ├── patient/                    # Patient pages
│   ├── doctor/                     # Doctor pages
│   ├── receptionist/               # Receptionist pages
│   ├── pharmacist/                 # Pharmacist pages
│   ├── lab assistant/              # Lab Assistant pages
│   ├── super admin/                # Super Admin pages
│   ├── Home.tsx                    # Landing page
│   ├── Login.tsx                   # Multi-role login
│   ├── Signup.tsx                  # Patient self-registration
│   └── LearnMore.tsx
├── App.tsx                         # All route definitions
└── main.tsx                        # Entry point
```

### State Management
```
Redux Store
└── auth
    ├── user: User | null
    ├── isAuthenticated: boolean
    └── role: Role | null
```

No RTK Query is used — all API calls use plain Axios with `async/await`.

---

## 4. Authentication Flow

### 4.1 Patient Self-Registration
```
/signup
  └── POST /api/patient/auth/register
        body: { fullName, email, password, dob, gender, phoneNo, address, emergencyNo }
        success → redirect to /login
```

### 4.2 Login (All Roles)
```
/login
  ├── RoleSelector dropdown (patient | doctor | receptionist | pharmacist | labAssistant | superadmin)
  └── Role-specific form shown based on selection
        ↓
      POST /api/{role}/auth/login
        body: { email, password } (or id_no + password for staff)
        response: { user object + token }
        ↓
      dispatch(login(user))   → Redux state updated
      localStorage["user"]   → serialized user object
      localStorage["authToken"] → JWT token
        ↓
      Navigate to /{role}/dashboard
```

### 4.3 Auto-Login (App Startup)
```
App.tsx mounts
  → useLoadUser() hook runs
  → reads localStorage["user"]
  → dispatch(loadUser(user))   → restores Redux auth state
  → user stays logged in across page refreshes
```

### 4.4 Logout
```
Sidebar logout button
  → Modal confirmation appears
  → confirm: dispatch(logout())
      → clears Redux state
      → clears localStorage
      → Navigate to /login
```

### 4.5 Auth Types (TypeScript)
All user objects share a `User` base:
```typescript
interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  token: string | null;
}
```
Extended by role-specific interfaces: `PatientUser`, `DoctorUser`, `ReceptionistUser`, `PharmacistUser`, `LabAssistantUser`, `AdminUser`.

---

## 5. Patient Module

**Base route:** `/patient/*`
**Sidebar config:** Dashboard, My Appointments, Medical Records, Notifications, Prescriptions, Lab Reports, Billing, Profile

### 5.1 Dashboard (`/patient/dashboard`) ✅ IMPLEMENTED
Displays:
- **Stats cards:** Upcoming Appointments, Medical Records, Active Prescriptions, Outstanding Bills
- **Health Metrics:** Blood Pressure, Heart Rate, Temperature, Weight
- **Upcoming Appointments:** Next scheduled visits with doctor name and time
- **Recent Activity Feed:** Lab results, prescriptions, appointment confirmations

API: Reads from Redux `state.auth.user` for patient name.
> Currently uses hardcoded mock data — needs real API integration.

### 5.2 My Appointments (`/patient/my-appointments`) ✅ IMPLEMENTED
Displays patient's appointment list.
- Filter tabs: Upcoming / Completed / Cancelled
- Each card shows: doctor name, date, time, status badge
- Actions: Cancel appointment, Request Reschedule

API calls expected:
```
GET  /api/patient/appointments          → list all appointments
PUT  /api/patient/appointments/:id/cancel
POST /api/patient/appointments/:id/reschedule-request
```

### 5.3 Book Appointment (`/patient/book-appointment`) ❌ NOT IMPLEMENTED
**Flow:**
```
Patient clicks "Book Appointment"
  → Step 1: Select Specialization / Department
  → Step 2: Select Doctor (filtered by specialization)
  → Step 3: Select Date (calendar picker, shows available slots)
  → Step 4: Select Time Slot
  → Step 5: Confirm booking details
  → POST /api/patient/appointments/book
        body: { doctorId, date, timeSlot, reason }
  → success: toast notification, redirect to /patient/my-appointments
```

### 5.4 Medical Records (`/patient/records`) ✅ IMPLEMENTED
Displays complete medical history.
- List of records with date, doctor, diagnosis, notes
- View full record details in modal

API calls expected:
```
GET /api/patient/medical-records
GET /api/patient/medical-records/:id
```

### 5.5 Prescriptions (`/patient/prescriptions`) ✅ IMPLEMENTED
Displays all prescriptions written by doctors.
- Each prescription: doctor name, date, list of medicines, dosage instructions
- Status: Active / Completed / Dispensed

API calls expected:
```
GET /api/patient/prescriptions
GET /api/patient/prescriptions/:id
```

### 5.6 Lab Reports (`/patient/lab-reports`) ✅ IMPLEMENTED
Displays lab test results ordered by doctor.
- Each report: test name, ordered date, result date, values, normal range, status (Normal / Abnormal)

API calls expected:
```
GET /api/patient/lab-reports
GET /api/patient/lab-reports/:id
```

### 5.7 Notifications (`/patient/notifications`) ✅ IMPLEMENTED
Displays system notifications:
- Appointment confirmed/cancelled
- Lab results ready
- Prescription dispensed
- Bill generated

API calls expected:
```
GET /api/patient/notifications
PUT /api/patient/notifications/:id/read
```

### 5.8 Billing (`/patient/billing`) ❌ NOT IMPLEMENTED
**Flow:**
```
Patient views all their bills
  → Each bill: date, services, amount, status (Paid / Unpaid)
  → View bill details (itemized breakdown)
  → Download as PDF (optional for MVP)

GET /api/patient/bills
GET /api/patient/bills/:id
```

### 5.9 Profile (`/patient/profile`) ✅ IMPLEMENTED
- View and edit personal information (name, email, phone, address, DOB, gender)
- Change profile photo (PUT `/api/patient/change-photo`)
- Change password (PUT `/api/patient/change-password`)
- Update profile (PUT `/api/patient/update-profile`)

---

## 6. Doctor Module

**Base route:** `/doctor/*`
**Sidebar config:** Dashboard, Patients, Appointments, Prescriptions, Profile

### 6.1 Dashboard (`/doctor/dashboard`) ✅ IMPLEMENTED
Displays:
- **Stats:** Today's Appointments, Pending Consultations, Completed Today, Total Patients
- **Patient Queue:** Next patients in line with name, time, reason
- **Today's Appointment Table:** Full list for the day
- **Activity Feed:** Recent consultations, prescriptions, lab orders
- **Notifications:** New lab results, dispensed medicines, new bookings
- **Performance Metrics:** Patients handled this week, avg consultation time

API:
```
GET /api/doctor/dashboard/:doctorId
```
> Partially connected to backend. Some data is still mocked.

### 6.2 Appointments (`/doctor/appointments`) ✅ IMPLEMENTED
Full appointment management for the doctor:
- List all appointments (with status filters: Pending, Confirmed, Completed, Cancelled)
- View patient details per appointment
- Mark appointment as In Progress / Completed
- Add consultation notes
- Write prescription inline (medicines, dosage, duration)
- Order lab tests

API calls expected:
```
GET  /api/doctor/appointments
PUT  /api/doctor/appointments/:id/status
POST /api/doctor/appointments/:id/notes
POST /api/doctor/prescriptions          → create prescription linked to appointment
POST /api/doctor/lab-orders             → order lab test for patient
```

### 6.3 Patients List (`/doctor/patients`) ❌ NOT IMPLEMENTED
All patients who have consulted this doctor:
```
GET /api/doctor/patients
  → Table: name, DOB, last visit date, diagnosis, actions
  → Click → view full patient history (appointments, prescriptions, lab reports)
```

### 6.4 Prescriptions (`/doctor/prescriptions`) ❌ NOT IMPLEMENTED
All prescriptions the doctor has written:
```
GET /api/doctor/prescriptions
  → Filter by: Active / Dispensed / All
  → View details: patient name, medicines, date
  → Re-issue prescription option
```

### 6.5 Profile (`/doctor/profile`) ❌ NOT IMPLEMENTED
View and edit doctor's own profile:
```
GET /api/doctor/profile-details
PUT /api/doctor/update-profile
PUT /api/doctor/change-password
PUT /api/doctor/change-photo
```
Fields: name, email, specialization, qualification, license no, years of experience, department, DOB, address, emergency contact.

---

## 7. Receptionist Module

**Base route:** `/receptionist/*`
**Sidebar config:** Dashboard, Appointments, Reschedule Requests, Patient Registration, Billing

### 7.1 Dashboard (`/receptionist/dashboard`) ❌ STUB ONLY
Should show:
- **Stats:** Today's Appointments, Walk-in Patients, Pending Reschedule Requests, Pending Bills
- **Today's Appointment Schedule:** Time-ordered list
- **Recent Activity:** New registrations, appointment changes

API:
```
GET /api/receptionist/dashboard
```

### 7.2 Appointments (`/receptionist/appointments`) ✅ IMPLEMENTED
Full appointment management:
- View all appointments (all doctors, all patients)
- Create new appointment (select patient, doctor, date, time)
- Reschedule an appointment
- Cancel an appointment
- Filter by date, doctor, status

API calls expected:
```
GET    /api/receptionist/appointments
POST   /api/receptionist/appointments/create
PUT    /api/receptionist/appointments/:id/reschedule
PUT    /api/receptionist/appointments/:id/cancel
```

### 7.3 Reschedule Requests (`/receptionist/appointment-reschedule-request`) ✅ IMPLEMENTED
Handles reschedule requests submitted by patients:
- List all pending requests
- Approve: assign new date/time
- Reject: notify patient with reason

API calls expected:
```
GET  /api/receptionist/reschedule-requests
PUT  /api/receptionist/reschedule-requests/:id/approve   body: { newDate, newTime }
PUT  /api/receptionist/reschedule-requests/:id/reject    body: { reason }
```

### 7.4 Patient Registration (`/receptionist/register`) ❌ NOT IMPLEMENTED
Register walk-in patients who don't have an account:
```
Form fields: fullName, email, password, DOB, gender, phone, address, emergency contact
POST /api/receptionist/register-patient
  → creates patient account
  → optionally book first appointment immediately
```

### 7.5 Billing (`/receptionist/billing`) ❌ NOT IMPLEMENTED
Create and manage bills for patients:
```
GET  /api/receptionist/bills           → list all bills
POST /api/receptionist/bills/create    → generate new bill
  body: {
    patientId,
    items: [
      { description: "Consultation", amount: 500 },
      { description: "Lab Test - CBC", amount: 200 },
      { description: "Medicines", amount: 350 }
    ]
  }
PUT  /api/receptionist/bills/:id/mark-paid
```

**Bill Generation Flow:**
```
Receptionist selects patient
  → System pulls: appointment fee + lab test fees + pharmacy charges
  → Receptionist reviews and adjusts line items
  → Generates bill → Patient sees it in /patient/billing
  → Marks as paid after cash/card payment received
```

---

## 8. Pharmacist Module

**Base route:** `/pharmacist/*`
**Sidebar config:** Dashboard, Prescriptions, Inventory, Dispensed History, Profile

### 8.1 Dashboard (`/pharmacist/dashboard`) ✅ IMPLEMENTED
Displays:
- **Stats:** Pending Prescriptions, Low Stock Items, Dispensed Today, Total Medicines in Stock
- Quick-access links to pending prescriptions
- Low stock alerts

API:
```
GET /api/pharmacist/dashboard
```

### 8.2 Prescriptions (`/pharmacist/prescriptions`) ✅ IMPLEMENTED
View prescriptions waiting to be dispensed:
- Filter: Pending / Dispensed / All
- View prescription details: patient name, doctor, medicines, dosage
- Mark medicines as dispensed (one by one or all at once)
- Add notes (e.g., medicine substitution)

API calls expected:
```
GET  /api/pharmacist/prescriptions
PUT  /api/pharmacist/prescriptions/:id/dispense
      body: { medicines: [{ medicineId, quantity }], notes }
```

### 8.3 Inventory (`/pharmacist/inventory`) ✅ IMPLEMENTED
Manage medicine stock:
- List all medicines with current stock level
- Add new medicine to inventory
- Update stock quantity (restock)
- Set low-stock alert threshold
- Filter by category, expiry date, stock level

API calls expected:
```
GET    /api/pharmacist/inventory
POST   /api/pharmacist/inventory/add          body: { name, category, quantity, unit, expiryDate, threshold }
PUT    /api/pharmacist/inventory/:id/restock  body: { quantity }
DELETE /api/pharmacist/inventory/:id
```

### 8.4 Dispensed History (`/pharmacist/dispensed-history`) ✅ IMPLEMENTED
Track of all dispensed medicines:
- Date, patient name, prescription ID, medicines dispensed, pharmacist name
- Filter by date range

API:
```
GET /api/pharmacist/dispensed-history?from=&to=
```

### 8.5 Profile (`/pharmacist/profile`) ❌ STUB ONLY
View and edit pharmacist profile:
```
GET /api/pharmacist/profile-details
PUT /api/pharmacist/update-profile
PUT /api/pharmacist/change-password
PUT /api/pharmacist/change-photo
```

---

## 9. Lab Assistant Module

**Base route:** `/lab-assistant/*`
**Sidebar config:** Dashboard, Lab Tests, Profile

### 9.1 Dashboard (`/lab-assistant/dashboard`) ❌ STUB ONLY
Should show:
- **Stats:** Pending Tests, Completed Today, Total Tests This Month
- List of pending lab test orders
- Recent results entered

API:
```
GET /api/labAssistant/dashboard
```

### 9.2 Lab Tests (`/lab-assistant/lab-tests`) ✅ IMPLEMENTED
Manage lab test orders:
- List all test orders (Pending / In Progress / Completed)
- View test details: patient name, test type, ordered by doctor, ordered date
- Enter test results (numeric values, reference ranges, notes)
- Mark test as completed → triggers notification to patient and doctor

API calls expected:
```
GET  /api/labAssistant/lab-tests
PUT  /api/labAssistant/lab-tests/:id/results
      body: { results: [{ parameter, value, unit, referenceRange }], notes }
PUT  /api/labAssistant/lab-tests/:id/complete
```

### 9.3 Profile (`/lab-assistant/profile`) ❌ STUB ONLY
```
GET /api/labAssistant/profile-details
PUT /api/labAssistant/update-profile
PUT /api/labAssistant/change-password
```

---

## 10. Super Admin Module

**Base route:** `/superadmin/*`
**Sidebar config:** Dashboard, Staff Management, Users, Reports, Settings

### 10.1 Dashboard (`/superadmin/dashboard`) ✅ IMPLEMENTED
System-wide statistics:
- **Stats:** Total Users, Active Doctors, Total Revenue, Appointments Today
- Recent user registrations table
- Activity analytics chart (placeholder)
- System health metrics

> Most data is currently mocked. Needs full API integration.

### 10.2 Staff Management (`/superadmin/staff-management`) ✅ IMPLEMENTED
Add, view, edit and delete hospital staff:
- Tabs: Doctors, Receptionists, Pharmacists, Lab Assistants
- Add staff form with all required fields (name, email, role-specific fields, salary, DOJ)
- Edit existing staff details
- Deactivate / delete staff accounts
- Generated login credentials sent to staff email (backend responsibility)

API calls expected:
```
GET    /api/superadmin/staff?role=doctor|receptionist|pharmacist|labAssistant
POST   /api/superadmin/staff/create     body: { role, fullName, email, ...roleSpecificFields }
PUT    /api/superadmin/staff/:id        body: { ...updatedFields }
DELETE /api/superadmin/staff/:id
```

### 10.3 All Patients (`/superadmin/all-patients`) ❌ STUB ONLY
View all registered patients:
```
GET /api/superadmin/patients
  → Table: name, email, DOB, phone, registration date, total appointments
  → Search by name/email
  → View patient profile in modal
  → Deactivate patient account if needed
```

### 10.4 Reports (`/superadmin/reports`) ❌ NOT IMPLEMENTED
System-wide reports for hospital management:
```
Revenue Report:
  GET /api/superadmin/reports/revenue?from=&to=
  → Total bills, paid bills, unpaid bills, revenue by service type

Appointments Report:
  GET /api/superadmin/reports/appointments?from=&to=
  → Total appointments, by doctor, by status, cancellation rate

Staff Activity Report:
  GET /api/superadmin/reports/staff-activity
  → Consultations per doctor, tests per lab assistant, prescriptions dispensed
```

### 10.5 Settings (`/superadmin/settings`) ❌ NOT IMPLEMENTED
Hospital configuration:
```
GET /api/superadmin/settings
PUT /api/superadmin/settings
  Fields:
    - Hospital name, address, phone, email
    - Working hours (Mon-Sun, open/close times)
    - Appointment slot duration (e.g., 30 min)
    - Departments list
    - Specializations list
    - Holiday/closure dates
```

---

## 11. Core Hospital Workflows

### Workflow A: Patient Books an Appointment
```
1. Patient logs in → /patient/my-appointments
2. Clicks "Book Appointment"
3. Selects: Specialization → Doctor → Date → Time Slot
4. Fills in: Reason for visit
5. Confirms booking
   POST /api/patient/appointments/book
6. Appointment status = "Pending"
7. Receptionist sees it in /receptionist/appointments
8. Receptionist confirms → status = "Confirmed"
9. Patient gets notification: "Appointment confirmed"
```

### Workflow B: Doctor Consultation
```
1. Doctor logs in → /doctor/appointments
2. Sees patient queue for today
3. Clicks "Start Consultation" → status = "In Progress"
4. Views patient history, previous prescriptions, lab results
5. Adds consultation notes
6. Writes prescription: medicines + dosage + duration
   POST /api/doctor/prescriptions
7. (Optional) Orders lab tests
   POST /api/doctor/lab-orders
8. Marks appointment as "Completed"
9. Prescription appears in /pharmacist/prescriptions
10. Lab order appears in /lab-assistant/lab-tests
```

### Workflow C: Pharmacist Dispenses Medicine
```
1. Pharmacist logs in → /pharmacist/prescriptions
2. Sees pending prescriptions list
3. Opens prescription: patient name, medicines, dosage
4. Checks inventory availability
5. Clicks "Dispense"
   PUT /api/pharmacist/prescriptions/:id/dispense
6. Inventory automatically deducted
7. Dispensed history updated
8. Patient notification: "Prescription dispensed — collect from pharmacy"
```

### Workflow D: Lab Test Cycle
```
1. Doctor orders lab test during consultation
2. Lab Assistant logs in → /lab-assistant/lab-tests
3. Sees new test order: patient name, test type, doctor
4. Collects sample, marks "In Progress"
5. Enters results: values, reference ranges
6. Marks test as "Completed"
7. Doctor gets notification: "Lab results ready for Patient X"
8. Patient gets notification: "Your lab results are ready"
9. Results visible at /patient/lab-reports
```

### Workflow E: Billing
```
1. After consultation is complete:
   - Appointment fee set by system
   - Lab test fees added automatically when tests are ordered
   - Pharmacy charges added when prescription dispensed
2. Receptionist goes to /receptionist/billing
3. Searches for patient
4. Reviews auto-generated bill items, adjusts if needed
5. Generates final bill
   POST /api/receptionist/bills/create
6. Patient sees bill at /patient/billing
7. Patient pays at counter → Receptionist marks bill as "Paid"
   PUT /api/receptionist/bills/:id/mark-paid
```

### Workflow F: Super Admin Adds Staff
```
1. Super Admin logs in → /superadmin/staff-management
2. Clicks "Add Staff"
3. Selects role: Doctor / Receptionist / Pharmacist / Lab Assistant
4. Fills in all required fields
   POST /api/superadmin/staff/create
5. System creates account with temporary password
6. Staff member receives email with login credentials
7. Staff logs in → prompted to change password on first login
```

---

## 12. Implementation Status

| Module | Feature | Status |
|--------|---------|--------|
| **Auth** | Multi-role login | ✅ Done |
| **Auth** | Patient self-registration | ✅ Done |
| **Auth** | Auto-login from localStorage | ✅ Done |
| **Auth** | Logout with confirmation | ✅ Done |
| **Patient** | Dashboard (mock data) | ✅ Done |
| **Patient** | My Appointments (view) | ✅ Done |
| **Patient** | Book Appointment | ❌ Missing |
| **Patient** | Medical Records | ✅ Done |
| **Patient** | Prescriptions | ✅ Done |
| **Patient** | Lab Reports | ✅ Done |
| **Patient** | Notifications | ✅ Done |
| **Patient** | Billing | ❌ Missing |
| **Patient** | Profile (edit + photo) | ✅ Done |
| **Doctor** | Dashboard | ✅ Done (partial mock) |
| **Doctor** | Appointments | ✅ Done |
| **Doctor** | Patients List | ❌ Missing |
| **Doctor** | Prescriptions page | ❌ Missing |
| **Doctor** | Profile | ❌ Missing |
| **Receptionist** | Dashboard | ❌ Stub only |
| **Receptionist** | Appointments | ✅ Done |
| **Receptionist** | Reschedule Requests | ✅ Done |
| **Receptionist** | Patient Registration | ❌ Missing |
| **Receptionist** | Billing | ❌ Missing |
| **Pharmacist** | Dashboard | ✅ Done |
| **Pharmacist** | Prescriptions (dispense) | ✅ Done |
| **Pharmacist** | Inventory | ✅ Done |
| **Pharmacist** | Dispensed History | ✅ Done |
| **Pharmacist** | Profile | ❌ Stub only |
| **Lab Assistant** | Dashboard | ❌ Stub only |
| **Lab Assistant** | Lab Tests | ✅ Done |
| **Lab Assistant** | Profile | ❌ Stub only |
| **Super Admin** | Dashboard | ✅ Done (partial mock) |
| **Super Admin** | Staff Management | ✅ Done |
| **Super Admin** | All Patients | ❌ Stub only |
| **Super Admin** | Reports | ❌ Missing |
| **Super Admin** | Settings | ❌ Missing |

**Done: 22 / Total: 35**

---

## 13. Missing Features — MVP Backlog

### Priority 1 — Critical (Workflow Broken Without These)

#### P1-01: Patient — Book Appointment
- New page: `/patient/book-appointment`
- Multi-step form: specialization → doctor → date → time → confirm
- Add "Book Appointment" button to dashboard and my-appointments page
- Add route in `App.tsx`
- Add sidebar entry or floating button

#### P1-02: Receptionist — Dashboard (Real Data)
- Replace stub with real stats from `GET /api/receptionist/dashboard`
- Stats: today's appointments, walk-ins, pending reschedules, unpaid bills

#### P1-03: Receptionist — Patient Registration
- New page: `/receptionist/register`
- Form same as patient signup but submitted by receptionist
- Add route in `App.tsx`

#### P1-04: Receptionist — Billing
- New page: `/receptionist/billing`
- List all bills with search/filter
- Create bill modal with line items
- Mark bill as paid

#### P1-05: Patient — Billing Page
- New page: `/patient/billing`
- View all bills (paid/unpaid)
- Bill detail modal with itemized breakdown
- Add route in `App.tsx`

#### P1-06: Doctor — Patients List
- New page: `/doctor/patients`
- Table of all patients assigned to this doctor
- Click → view patient history sidebar/modal
- Add route in `App.tsx`

### Priority 2 — Important (Incomplete Role Experience)

#### P2-01: Doctor — Prescriptions Page
- New page: `/doctor/prescriptions`
- List all prescriptions written by this doctor
- Filter: Active / Dispensed / All
- Add route in `App.tsx`

#### P2-02: Doctor — Profile
- New page: `/doctor/profile`
- Same pattern as `PatientProfile.tsx`
- Edit info, change photo, change password

#### P2-03: Pharmacist — Profile
- Replace stub in `/pharmacist/profile`
- Same pattern as `PatientProfile.tsx`

#### P2-04: Lab Assistant — Dashboard
- Replace stub with real stats from `GET /api/labAssistant/dashboard`
- Pending tests list, completed today count

#### P2-05: Lab Assistant — Profile
- Replace stub in `/lab-assistant/profile`
- Same pattern as `PatientProfile.tsx`

#### P2-06: Super Admin — All Patients
- Replace stub in `/superadmin/all-patients`
- Table: name, email, DOB, phone, total appointments
- Search by name/email

### Priority 3 — Reporting & Configuration

#### P3-01: Super Admin — Reports
- New page: `/superadmin/reports`
- Revenue report, appointments report, staff activity report
- Date range filter
- Add route in `App.tsx`

#### P3-02: Super Admin — Settings
- New page: `/superadmin/settings`
- Hospital info, working hours, appointment slot duration, departments
- Add route in `App.tsx`

### Priority 4 — Polish & Reliability

#### P4-01: Replace All Mock Data with Real API Calls
- Patient Dashboard stats
- Doctor Dashboard stats
- Super Admin Dashboard stats

#### P4-02: Global Error Handling
- Axios interceptor for 401 (auto-logout) and 500 errors
- Empty state components for lists
- Proper loading spinners on all async operations

#### P4-03: Notification Polling
- Poll `GET /api/{role}/notifications` every 30–60 seconds
- Show unread count badge on notifications sidebar link

---

## 14. Implementation Roadmap

### Phase 1 — Fix Stubs & Add Missing Profile Pages
**Goal:** No page shows a placeholder. Every route renders real content.

| Task | File to Create/Edit |
|------|---------------------|
| Receptionist Dashboard (real data) | `src/pages/receptionist/ReceptionistDashboard.tsx` |
| Lab Assistant Dashboard (real data) | `src/pages/lab assistant/LabAssistantDashboard.tsx` |
| Lab Assistant Profile | `src/pages/lab assistant/LabAssistantProfile.tsx` |
| Doctor Profile | `src/pages/doctor/DoctorProfile.tsx` + route in `App.tsx` |
| Pharmacist Profile | `src/pages/pharmacist/PharmacistProfile.tsx` |
| Super Admin — All Patients | `src/pages/super admin/Patients.tsx` |

### Phase 2 — Core Patient & Doctor Workflows
**Goal:** A patient can book an appointment, a doctor can complete a consultation end-to-end.

| Task | File to Create/Edit |
|------|---------------------|
| Patient — Book Appointment | `src/pages/patient/BookAppointment.tsx` + route in `App.tsx` |
| Doctor — Patients List | `src/pages/doctor/DoctorPatients.tsx` + route in `App.tsx` |
| Doctor — Prescriptions page | `src/pages/doctor/DoctorPrescriptions.tsx` + route in `App.tsx` |

### Phase 3 — Billing & Financial
**Goal:** Bills are generated and patients can view them.

| Task | File to Create/Edit |
|------|---------------------|
| Receptionist — Patient Registration | `src/pages/receptionist/PatientRegistration.tsx` + route in `App.tsx` |
| Receptionist — Billing | `src/pages/receptionist/ReceptionistBilling.tsx` + route in `App.tsx` |
| Patient — Billing page | `src/pages/patient/Billing.tsx` + route in `App.tsx` |

### Phase 4 — Admin Reporting & Settings
**Goal:** Super Admin can see reports and configure hospital settings.

| Task | File to Create/Edit |
|------|---------------------|
| Super Admin — Reports | `src/pages/super admin/Reports.tsx` + route in `App.tsx` |
| Super Admin — Settings | `src/pages/super admin/Settings.tsx` + route in `App.tsx` |

### Phase 5 — Polish
**Goal:** Production-ready quality.

| Task | Description |
|------|-------------|
| Replace mock data | Connect all dashboards to real API endpoints |
| Axios error interceptor | Auto-logout on 401, global error toasts on 500 |
| Empty states | "No data yet" components for all lists |
| Notification polling | Auto-refresh notifications every 60 seconds |
| Loading skeletons | Replace spinner with skeleton UI on data fetch |

---

## Notes for Developers

1. **Axios base URL** is in `.env` as `VITE_BASE_URL`. All API files should use:
   ```ts
   const BASE_URL = import.meta.env.VITE_BASE_URL;
   ```

2. **Auth header** must be sent with every authenticated request:
   ```ts
   headers: { "auth-token": localStorage.getItem("authToken") }
   ```

3. **Every new page** needs a route in `src/App.tsx` under the correct role group.

4. **Every new sidebar link** needs an entry in `src/components/sidebar/SidebarConfig.tsx`.

5. **Toast notifications** use `react-hot-toast`:
   ```ts
   import toast from "react-hot-toast";
   toast.success("Appointment booked!");
   toast.error("Something went wrong.");
   ```

6. **Modal** reuse the existing `src/components/Modal.tsx` for all confirmations and forms.

7. **Styling** use Tailwind CSS + DaisyUI classes only. No inline styles, no CSS modules.
