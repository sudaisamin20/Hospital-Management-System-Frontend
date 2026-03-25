import Sidebar from "./Sidebar";
import { useSelector } from "react-redux";
import { type RootState } from "../../app/store";
import { SidebarConfig } from "./SidebarConfig";
import { type Role } from "../../features/auth/authTypes";
import { Outlet } from "react-router-dom";

const SidebarContentPage = () => {
  const data = useSelector((state: RootState) => state.auth);
  const role = (data?.user?.role || "patient") as Role;
  const sidebarElements = SidebarConfig[role] || SidebarConfig.patient;

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
