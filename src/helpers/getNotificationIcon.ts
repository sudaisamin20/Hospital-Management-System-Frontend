import {
  Bell,
  Calendar,
  CalendarSync,
  CheckCircle,
  Clock,
  FileText,
  FlaskConical,
  XCircle,
} from "lucide-react";

export const getNotificationIcon = (type: string) => {
  switch (type) {
    case "lab_test":
      return FlaskConical;
    case "prescription":
      return FileText;
    case "reschedule_requested":
      return CalendarSync;
    case "reschedule_approved":
    case "reschedule_rejected":
      return Calendar;
    case "appointment_confirmed":
      return CheckCircle;
    case "appointment_completed":
      return CheckCircle;
    case "appointment_cancelled":
      return XCircle;
    case "appointment_reminder":
      return Clock;
    default:
      return Bell;
  }
};
