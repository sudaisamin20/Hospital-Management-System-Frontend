import { createContext } from "react";

export interface ICount {
  appointments: number;
  labOrders: number;
  prescriptions: number;
  notifications: number;
}

type NotificationContextType = {
  unreadCount: ICount;
  setUnreadCount: (count: ICount) => void;
};

export const NotificationContext =
  createContext<NotificationContextType | null>(null);
