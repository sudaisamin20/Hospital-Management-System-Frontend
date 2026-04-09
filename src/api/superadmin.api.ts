import axiosInstance from "./axiosInstance";

// Types
export interface SuperAdminProfile {
  id: string;
  id_no: string;
  fullName: string;
  email: string;
  phoneNo: string;
  photo?: string;
}

export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  totalPharmaists: number;
  totalLabAssistants: number;
  totalReceptionists: number;
  todayAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
}

export interface UserManagement {
  id: string;
  id_no: string;
  fullName: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

// API Functions
export const getSuperAdminProfileApi = () =>
  axiosInstance.get<{ success: boolean; superadmin: SuperAdminProfile }>(
    "/api/superadmin/profile-details",
  );

export const getDashboardStatsApi = () =>
  axiosInstance.get<{ success: boolean; stats: DashboardStats }>(
    "/api/superadmin/dashboard-stats",
  );

export const getAllUsersApi = (role?: string) =>
  axiosInstance.get<{ success: boolean; users: UserManagement[] }>(
    `/api/superadmin/users${role ? `?role=${role}` : ""}`,
  );

export const deactivateUserApi = (userId: string) =>
  axiosInstance.put<{ success: boolean; message: string }>(
    `/api/superadmin/deactivate-user/${userId}`,
    {},
  );

export const activateUserApi = (userId: string) =>
  axiosInstance.put<{ success: boolean; message: string }>(
    `/api/superadmin/activate-user/${userId}`,
    {},
  );

export const deleteUserApi = (userId: string) =>
  axiosInstance.delete<{ success: boolean; message: string }>(
    `/api/superadmin/delete-user/${userId}`,
  );

export const getSystemLogsApi = () =>
  axiosInstance.get<{ success: boolean; logs: any[] }>(
    "/api/superadmin/system-logs",
  );
