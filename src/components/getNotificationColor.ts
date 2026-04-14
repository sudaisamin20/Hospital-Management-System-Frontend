export const getNotificationColor = (type: string) => {
  switch (type) {
    case "lab_test":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "prescription":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "appointment_completed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "reschedule_approved":
    case "appointment_confirmed":
      return "bg-green-100 text-green-800 border-green-200";
    case "reschedule_rejected":
    case "appointment_cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "reschedule_requested":
    case "appointment_reminder":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
};
