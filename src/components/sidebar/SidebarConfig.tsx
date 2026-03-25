import {
  Calendar,
  File,
  User,
  CreditCard,
  Users,
  Pill,
  DollarSign,
  BarChart3,
  Settings,
  UserPlus,
  UserRoundPlus,
  CalendarSync,
  Bell,
  LayoutDashboard,
  FlaskRound,
} from "lucide-react";
import { type Role } from "../../features/auth/authTypes";

type SidebarIconType = React.ReactNode;

export const SidebarConfig: Record<
  Role,
  { title: string; path: string; icon: SidebarIconType }[]
> = {
  patient: [
    {
      title: "Dashboard",
      path: "/patient/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: "My Appointments",
      path: "/patient/my-appointments",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      title: "Medical Records",
      path: "/patient/records",
      icon: <File className="w-5 h-5" />,
    },
    {
      title: "Notifications",
      path: "/patient/notifications",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      title: "Prescriptions",
      path: "/patient/prescriptions",
      icon: <Pill className="w-5 h-5" />,
    },
    {
      title: "Lab Reports",
      path: "/patient/lab-reports",
      icon: <FlaskRound className="w-5 h-5" />,
    },
    {
      title: "Billing",
      path: "/patient/billing",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      title: "Profile",
      path: "/patient/profile",
      icon: <User className="w-5 h-5" />,
    },
  ],
  doctor: [
    {
      title: "Dashboard",
      path: "/doctor/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: "Patients",
      path: "/doctor/patients",
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: "Appointments",
      path: "/doctor/appointments",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      title: "Prescriptions",
      path: "/doctor/prescriptions",
      icon: <Pill className="w-5 h-5" />,
    },
    {
      title: "Profile",
      path: "/doctor/profile",
      icon: <User className="w-5 h-5" />,
    },
  ],
  receptionist: [
    {
      title: "Dashboard",
      path: "/receptionist/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: "Appointments",
      path: "/receptionist/appointments",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      title: "Reschedule Requests",
      path: "/receptionist/appointment-reschedule-request",
      icon: <CalendarSync className="w-5 h-5" />,
    },
    {
      title: "Patient Registration",
      path: "/receptionist/register",
      icon: <UserPlus className="w-5 h-5" />,
    },
    {
      title: "Billing",
      path: "/receptionist/billing",
      icon: <DollarSign className="w-5 h-5" />,
    },
  ],
  superadmin: [
    {
      title: "Dashboard",
      path: "/superadmin/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: "Staff Management",
      path: "/superadmin/staff-management",
      icon: <UserRoundPlus className="w-5 h-5" />,
    },
    {
      title: "Users",
      path: "/superadmin/all-patients",
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: "Reports",
      path: "/superadmin/reports",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      title: "Settings",
      path: "/superadmin/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ],
  pharmacist: [
    {
      title: "Dashboard",
      path: "/pharmacist/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: "Prescriptions",
      path: "/pharmacist/prescriptions",
      icon: <Pill className="w-5 h-5" />,
    },
    {
      title: "Inventory",
      path: "/pharmacist/inventory",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      title: "Dispensed History",
      path: "/pharmacist/dispensed-history",
      icon: <File className="w-5 h-5" />,
    },
    {
      title: "Profile",
      path: "/pharmacist/profile",
      icon: <User className="w-5 h-5" />,
    },
  ],
  labAssistant: [
    {
      title: "Dashboard",
      path: "/lab-assistant/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: "Lab Tests",
      path: "/lab-assistant/lab-tests",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      title: "Profile",
      path: "/lab-assistant/profile",
      icon: <User className="w-5 h-5" />,
    },
  ],
};
