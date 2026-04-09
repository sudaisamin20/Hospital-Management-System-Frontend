import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../constants/apiRoutes";

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

export interface DoctorId {
  _id: string;
  fullName: string;
  role: string;
  photo: string;
  departmentId: DepartmentId;
  specialistId: SpecialistId;
}

export interface PatientId {
  _id: string;
  fullName: string;
  role: string;
}

export interface AppointmentData {
  id: string;
  id_no: string;
  patientId: PatientId | string;
  doctorId: DoctorId | string;
  aptDate: string;
  appointmentTime: string;
  shift: string;
  departmentId?: DepartmentId;
  specialistId?: SpecialistId;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  reasonForVisit: string;
  handleBy?: string;
  confirmedAt?: string;
  startedAt: string;
  completedAt?: string;
  cancelledAt?: string;
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
    "/api/appointment/reschedule-appointment",
    payload,
  );

export const confirmAppointmentStatusApi = (appointmentId: string) =>
  axiosInstance.put<{ success: boolean; message: string }>(
    API_ENDPOINTS.APPOINTMENT.UPDATE_STATUS,
    { appointmentId },
  );

export const completeAppointmentApi = (appointmentId: string) =>
  axiosInstance.put<{ success: boolean; message: string }>(
    "/api/appointment/complete-apt-status",
    { appointmentId },
  );
