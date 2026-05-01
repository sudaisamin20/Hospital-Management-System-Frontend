import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../constants/apiRoutes";
import type { Notification } from "./notification.api";

// Types
export interface ReceptionistProfile {
  id: string;
  id_no: string;
  fullName: string;
  email: string;
  phoneNo: string;
  photo?: string;
}

export interface DepartmentId {
  _id: string;
  name: string;
}

export interface SpecialistId {
  _id: string;
  name: string;
}

export interface DoctorId extends Omit<AppointmentData, "doctorId"> {
  _id: string;
  fullName: string;
  role: string;
  photo: string;
  departmentId: DepartmentId;
  specialistId: SpecialistId;
}

export interface PatientId extends Omit<AppointmentData, "patientId"> {
  _id: string;
  fullName: string;
  id_no: string;
  email: string;
  phoneNo: string;
  role: string;
  photo: string;
  dob: string;
  address: string;
  gender: string;
}

export interface AppointmentData {
  _id: string;
  id_no: string;
  patientId: PatientId | string;
  doctorId: DoctorId | string;
  aptDate: string;
  appointmentTime: string;
  shift: string;
  departmentId?: DepartmentId;
  specialistId?: SpecialistId;
  status:
    | "Pending"
    | "Confirmed"
    | "Completed"
    | "Cancelled"
    | "Reschedule Requested"
    | "Rescheduled";
  reasonForVisit: string;
  handleBy?: string;
  confirmedAt?: string | undefined;
  startedAt: string;
  completedAt?: string | undefined;
  cancelledAt?: string | undefined;
  createdAt: string;
  updatedAt: string;
  hiddenFor?: [
    {
      role: string;
      userId: string;
      hiddenAt: string;
    },
  ];
  addDetails?: string;
  rescheduleReason?: string;
  rescheduleStatus?: string;
  oldShiftApt?: string;
  oldAptTime?: string;
  oldAptDate?: string;
  suggestedSlots?: [
    {
      date: string;
      shift: string;
      time: string;
    },
  ];
  rescheduleRequestedBy?: string | ReceptionistProfile;
  rescheduleRequestedAt?: string;
  rescheduledBy?: string;
  rescheduledAt?: string;
}

export interface DashboardStats {
  totalAppointmentsToday: number;
  patientsCheckedIn: number;
  patientsWaiting: number;
  appointmentsCancelled: number;
  newRegistrationsToday: number;
  avgWaitTime: string;
}

export interface WaitingPatient {
  _id: string;
  id_no: string;
  patientName: string;
  patientId: string;
  checkInTime: string;
  appointmentTime: string;
  doctorName: string;
  status: "Waiting" | "With Doctor" | "Called";
  waitMinutes: number;
}

export interface TodayAppointment {
  _id: string;
  id_no: string;
  patientName: string;
  doctorName: string;
  appointmentTime: string;
  reason: string;
  status: "Scheduled" | "Checked In" | "Completed" | "Cancelled" | "No Show";
  shift: string;
}

export interface RecRecentActivity {
  _id: string;
  type: "check_in" | "registration" | "cancellation" | "reschedule" | "call";
  patientName: string;
  action: string;
  timestamp: string;
}

// API Functions
export const getReceptionistProfileApi = () =>
  axiosInstance.get<{ success: boolean; receptionist: ReceptionistProfile }>(
    API_ENDPOINTS.DOCTOR.PROFILE,
  );

export const getAllAppointmentsApi = (receptionistId: string) =>
  axiosInstance.get<{ success: boolean; appointments: AppointmentData[] }>(
    API_ENDPOINTS.APPOINTMENT.LIST.replace(":recId", receptionistId),
  );

export const rescheduleAppointmentApi = (payload: {
  appointmentId: string;
  newDate: string;
  newTime: string;
}) =>
  axiosInstance.put<{ success: boolean; message: string }>(
    "/appointment/reschedule-appointment",
    payload,
  );

export const confirmAppointmentStatusApi = (appointmentId: string) =>
  axiosInstance.put<{ success: boolean; message: string }>(
    API_ENDPOINTS.APPOINTMENT.UPDATE_STATUS,
    { appointmentId },
  );

export const completeAppointmentApi = (appointmentId: string) =>
  axiosInstance.put<{ success: boolean; message: string }>(
    "/appointment/complete-apt-status",
    { appointmentId },
  );

export const rejectRescheduleRequestAptApi = (
  appointmentId: string | undefined,
  status: string | undefined,
) =>
  axiosInstance.put<{ success: boolean; message: string }>(
    API_ENDPOINTS.APPOINTMENT.REJECT_RESCHEDULE_REQUEST,
    { appointmentId, status },
  );

export const getReceptionistDashboardDataApi = () =>
  axiosInstance.get<{
    success: boolean;
    message: string;
    stats: DashboardStats;
    waitingPatients: WaitingPatient[];
    todayAppointments: TodayAppointment[];
    recentActivity: RecRecentActivity[];
    notifications: Notification[];
  }>(API_ENDPOINTS.RECEPTIONIST.DASHBOARD_DATA);
