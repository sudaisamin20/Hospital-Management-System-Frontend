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
  CalendarPlus,
} from "lucide-react";
import { type Role } from "../../features/auth/authTypes";

type SidebarIconType = React.ReactNode;

export const SidebarConfig: Record<
  Role,
  { title: string; path: string; icon: SidebarIconType; newAdded: boolean }[]
> = {
  patient: [
    {
      title: "Dashboard",
      path: "/patient/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      newAdded: false,
    },
    {
      title: "Book Appointment",
      path: "/patient/book-appointment",
      icon: <CalendarPlus className="w-5 h-5" />,
      newAdded: false,
    },
    {
      title: "My Appointments",
      path: "/patient/my-appointments",
      icon: <Calendar className="w-5 h-5" />,
      newAdded: true,
    },
    {
      title: "Medical Records",
      path: "/patient/records",
      icon: <File className="w-5 h-5" />,
      newAdded: false,
    },
    {
      title: "Notifications",
      path: "/patient/notifications",
      icon: <Bell className="w-5 h-5" />,
      newAdded: true,
    },
    {
      title: "Prescriptions",
      path: "/patient/prescriptions",
      icon: <Pill className="w-5 h-5" />,
      newAdded: true,
    },
    {
      title: "Lab Reports",
      path: "/patient/lab-reports",
      icon: <FlaskRound className="w-5 h-5" />,
      newAdded: true,
    },
    {
      title: "Billing",
      path: "/patient/billing",
      icon: <CreditCard className="w-5 h-5" />,
      newAdded: false,
    },
    {
      title: "Profile",
      path: "/patient/profile",
      icon: <User className="w-5 h-5" />,
      newAdded: false,
    },
  ],
  doctor: [
    {
      title: "Dashboard",
      path: "/doctor/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      newAdded: false,
    },
    {
      title: "Patients",
      path: "/doctor/patients",
      icon: <Users className="w-5 h-5" />,
      newAdded: false,
    },
    {
      title: "Appointments",
      path: "/doctor/appointments",
      icon: <Calendar className="w-5 h-5" />,
      newAdded: true,
    },
    {
      title: "Notifications",
      path: "/doctor/notifications",
      icon: <Bell className="w-5 h-5" />,
      newAdded: true,
    },
    {
      title: "Prescriptions",
      path: "/doctor/prescriptions",
      icon: <Pill className="w-5 h-5" />,
      newAdded: false,
    },
    {
      title: "Lab Test Reports",
      path: "/doctor/lab-test-reports",
      icon: <FlaskRound className="w-5 h-5" />,
      newAdded: false,
    },
    {
      title: "Profile",
      path: "/doctor/profile",
      icon: <User className="w-5 h-5" />,
      newAdded: false,
    },
  ],
  receptionist: [
    {
      title: "Dashboard",
      path: "/receptionist/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      newAdded: false,
    },
    {
      title: "Appointments",
      path: "/receptionist/appointments",
      icon: <Calendar className="w-5 h-5" />,
      newAdded: true,
    },
    {
      title: "Requests",
      path: "/receptionist/appointment-reschedule-request",
      icon: <CalendarSync className="w-5 h-5" />,
      newAdded: true,
    },
    {
      title: "Notifications",
      path: "/receptionist/notifications",
      icon: <Bell className="w-5 h-5" />,
      newAdded: true,
    },
    {
      title: "Patient Registration",
      path: "/receptionist/register",
      icon: <UserPlus className="w-5 h-5" />,
      newAdded: true,
    },
    {
      title: "Billing",
      path: "/receptionist/billing",
      icon: <DollarSign className="w-5 h-5" />,
      newAdded: false,
    },
    {
      title: "Profile",
      path: "/receptionist/profile",
      icon: <User className="w-5 h-5" />,
      newAdded: false,
    },
  ],
  superadmin: [
    {
      title: "Dashboard",
      path: "/superadmin/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      newAdded: false,
    },
    {
      title: "Staff Management",
      path: "/superadmin/staff-management",
      icon: <UserRoundPlus className="w-5 h-5" />,
      newAdded: false,
    },
    {
      title: "Users",
      path: "/superadmin/all-patients",
      icon: <Users className="w-5 h-5" />,
      newAdded: false,
    },
    {
      title: "Reports",
      path: "/superadmin/reports",
      icon: <BarChart3 className="w-5 h-5" />,
      newAdded: false,
    },
    {
      title: "Settings",
      path: "/superadmin/settings",
      icon: <Settings className="w-5 h-5" />,
      newAdded: false,
    },
  ],
  pharmacist: [
    {
      title: "Dashboard",
      path: "/pharmacist/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      newAdded: false,
    },
    {
      title: "Prescriptions",
      path: "/pharmacist/prescriptions",
      icon: <Pill className="w-5 h-5" />,
      newAdded: true,
    },
    {
      title: "Inventory",
      path: "/pharmacist/inventory",
      icon: <BarChart3 className="w-5 h-5" />,
      newAdded: false,
    },
    {
      title: "Dispensed History",
      path: "/pharmacist/dispensed-history",
      icon: <File className="w-5 h-5" />,
      newAdded: false,
    },
    {
      title: "Notifications",
      path: "/pharmacist/notifications",
      icon: <Bell className="w-5 h-5" />,
      newAdded: true,
    },
    {
      title: "Profile",
      path: "/pharmacist/profile",
      icon: <User className="w-5 h-5" />,
      newAdded: false,
    },
  ],
  labAssistant: [
    {
      title: "Dashboard",
      path: "/lab-assistant/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      newAdded: false,
    },
    {
      title: "Lab Orders",
      path: "/lab-assistant/lab-tests",
      icon: <BarChart3 className="w-5 h-5" />,
      newAdded: true,
    },
    {
      title: "Notifications",
      path: "/lab-assistant/notifications",
      icon: <Bell className="w-5 h-5" />,
      newAdded: true,
    },
    {
      title: "Profile",
      path: "/lab-assistant/profile",
      icon: <User className="w-5 h-5" />,
      newAdded: false,
    },
  ],
};
