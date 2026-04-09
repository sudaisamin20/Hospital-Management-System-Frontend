import Sidebar from "./Sidebar";
import { useSelector } from "react-redux";
import { SidebarConfig } from "./SidebarConfig";
import { type Role } from "../../features/auth/authTypes";
import { Outlet } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { useSocket, useSocketEvent } from "../../hooks/index";
import { useNotification } from "../../hooks/useNotification";
import { getUnReadCountsApi } from "../../api/index";

const SidebarContentPage = () => {
  const user = useSelector((state: any) => state.auth.user);

  const role = (user?.role || "patient") as Role;
  const sidebarElements = SidebarConfig[role] || SidebarConfig.patient;

  const { unreadCount, setUnreadCount } = useNotification();

  useSocket(user);
  console.log(unreadCount);

  const fetchCounts = useCallback(async () => {
    if (!user?.id) return;

    try {
      const res = await getUnReadCountsApi();
      setUnreadCount(res.data.counts);
      console.log(res.data.counts);
    } catch (err) {
      console.log("Notification fetch error:", err);
    }
  }, [user?.id, setUnreadCount]);

  console.log(unreadCount);

  const handleNotification = useCallback(async () => {
    await fetchCounts();
  }, [fetchCounts]);

  useSocketEvent("notification", handleNotification);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return (
    <div className="flex min-h-screen">
      <Sidebar sidebarElements={sidebarElements} />
      <div className="flex-1 ml-0 lg:ml-60 transition-all duration-300">
        <Outlet />
      </div>
    </div>
  );
};

export default SidebarContentPage;
