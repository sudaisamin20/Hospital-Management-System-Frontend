import { API_ENDPOINTS } from "../constants/apiRoutes";
import type { ICount } from "../context/NotificationContext";
import axiosInstance from "./axiosInstance";
import type { AppointmentData } from "./receptionist.api";

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  aptId: AppointmentData;
  isRead: boolean;
  labOrder: {
    labOrderId: string;
    testName: string;
    testId: string;
    status: string;
    results: [
      {
        name: string;
        value: number;
        range: string;
        unit: string;
        status: string;
      },
    ];
    remarks: string;
    resultPDF: string;
    completedAt: string;
  };
  prescription: {
    prescriptionId: string;
    status: string;
    medicines: [
      {
        medicineName: string;
        dosage: number;
        frequency: number;
        duration: number;
        unit: string;
        note: string;
      },
    ];
    totalAmount: number;
    resultPDF: string;
    dispensedAt: string;
  };
  notificationType: string;
  createdAt: string;
}

export const getAllNotificationsApi = () =>
  axiosInstance.get<{
    success: boolean;
    message: string;
    notifications: Notification[];
  }>(API_ENDPOINTS.NOTIFICATION.FETCH);

export const markAllasReadNotificationApi = () =>
  axiosInstance.put<{
    success: boolean;
    message: string;
    notifications: Notification[];
  }>(API_ENDPOINTS.NOTIFICATION.MARK_ALL_AS_READ);

export const markAsReadNotificationApi = (notificationId: string) =>
  axiosInstance.put<{
    success: boolean;
    message: string;
    notifications: Notification[];
  }>(
    API_ENDPOINTS.NOTIFICATION.MARK_AS_READ.replace(
      ":notificationId",
      notificationId,
    ),
  );

export const deleteNotificationApi = (notificationId: string) =>
  axiosInstance.delete<{
    success: boolean;
    message: string;
  }>(
    API_ENDPOINTS.NOTIFICATION.DELETE.replace(
      ":notificationId",
      notificationId,
    ),
  );

export const getUnReadCountsApi = () =>
  axiosInstance.get<{
    success: boolean;
    message: string;
    counts: ICount;
  }>(API_ENDPOINTS.APPOINTMENT.UNREAD);

export const markAsSeenAppointmentsApi = () =>
  axiosInstance.put<{ success: boolean; message: string }>(
    API_ENDPOINTS.APPOINTMENT.MARK_AS_SEEN,
  );

export const markAsSeenPrescriptionsApi = () =>
  axiosInstance.put<{ success: boolean; message: string }>(
    API_ENDPOINTS.PRESCRIPTION.MARK_AS_SEEN,
  );

export const markAsSeenLabOrdersApi = () =>
  axiosInstance.put<{ success: boolean; message: string }>(
    API_ENDPOINTS.LAB_TEST.MARK_AS_SEEN,
  );

export const markAsSeenNotificationsApi = () =>
  axiosInstance.put<{ success: boolean; message: string }>(
    API_ENDPOINTS.NOTIFICATION.MARK_AS_SEEN,
  );
