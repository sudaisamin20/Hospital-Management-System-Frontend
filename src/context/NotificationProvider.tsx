import { useState } from "react";
import { NotificationContext, type ICount } from "./NotificationContext";

export const NotificationProvider = ({ children }: any) => {
  const [unreadCount, setUnreadCount] = useState<ICount>({
    appointments: 0,
    labOrders: 0,
    prescriptions: 0,
    notifications: 0,
  });

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
