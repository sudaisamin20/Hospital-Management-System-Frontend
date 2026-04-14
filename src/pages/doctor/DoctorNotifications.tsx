import { useState, useEffect } from "react";
import {
  Bell,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Eye,
  MailOpen,
  X,
  FlaskConical,
  FileText,
  Download,
  CalendarSync,
} from "lucide-react";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import {
  getAllNotificationsApi,
  deleteNotificationApi,
  markAllasReadNotificationApi,
  markAsReadNotificationApi,
  type Notification,
} from "../../api";
import { useAppSelector, useSocket, useSocketEvent } from "../../hooks";
import { getNotificationColor, getNotificationIcon } from "../../components";

const DoctorNotifications = () => {
  const doctor = useAppSelector((state: any) => state?.auth?.user);
  const { isOpen, openModal, closeModal } = useModal();
  const [modalType, setModalType] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRead, setFilterRead] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const baseurl = import.meta.env.VITE_BASE_URL;

  // const getNotificationColor = (type: string) => {
  //   switch (type) {
  //     case "lab_test":
  //       return "bg-purple-100 text-purple-800 border-purple-200";
  //     case "prescription_dispensed":
  //       return "bg-orange-100 text-orange-800 border-orange-200";
  //     case "appointment_confirmed":
  //       return "bg-blue-100 text-blue-800 border-blue-200";
  //     case "reschedule_approved":
  //     case "appointment_completed":
  //       return "bg-green-100 text-green-800 border-green-200";
  //     case "reschedule_rejected":
  //     case "appointment_cancelled":
  //       return "bg-red-100 text-red-800 border-red-200";
  //     case "reschedule_request":
  //     case "appointment_reminder":
  //       return "bg-yellow-100 text-yellow-800 border-yellow-200";
  //     default:
  //       return "bg-blue-100 text-blue-800 border-blue-200";
  //   }
  // };

  const fetchNotifications = async () => {
    try {
      const response = await getAllNotificationsApi();
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error: any) {
      console.error("Error fetching notifications:", error.message);
      toast.error(
        error?.response?.data?.message || "Failed to fetch notifications",
      );
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await markAsReadNotificationApi(notificationId);
      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif,
          ),
        );
        toast.success(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.error("Error marking as read:", error.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await markAllasReadNotificationApi();
      if (response.data.success) {
        fetchNotifications();
        toast.success(response.data.message);
      }
    } catch (error: any) {
      console.error("Error marking all as read:", error.message);
      toast.error(error?.response.data.message);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await deleteNotificationApi(notificationId);
      if (response.data.success) {
        fetchNotifications();
        toast.success(response.data.message);
        closeModal();
      }
    } catch (error: any) {
      console.error(
        "Error deleting notification:",
        error.response.data.message,
      );
      toast.error(error?.response.data.message);
    }
  };

  useSocket(doctor);
  useSocketEvent("newNotification", (data: any) => {
    if (data.docNot) {
      setNotifications((prev) => {
        const updated = [data.docNot, ...prev];
        return updated.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      });
      toast.success("New notification received!");
    }
  });

  useEffect(() => {
    if (doctor?.id) {
      const fetchData = async () => {
        await fetchNotifications();
      };
      fetchData();
    }
  }, [doctor?.id]);

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    const type = notif.notificationType;
    const matchesType = filterType === "all" || type === filterType;
    const matchesRead =
      filterRead === "all" ||
      (filterRead === "unread" && !notif.isRead) ||
      (filterRead === "read" && notif.isRead);
    const matchesDate = dateFilter === "" || notif.aptId.aptDate === dateFilter;
    return matchesType && matchesRead && matchesDate;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen w-full bg-gray-50 p-3">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Notifications
                  <span></span>
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  {unreadCount > 0 ? (
                    <span>
                      You have{" "}
                      <span className="font-semibold text-blue-600">
                        {unreadCount}
                      </span>{" "}
                      unread notification{unreadCount > 1 ? "s" : ""}
                    </span>
                  ) : (
                    "All caught up!"
                  )}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 cursor-pointer duration-300 transition-colors bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                <MailOpen className="h-4 w-4" />
                Mark All as Read
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm p-2 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
            >
              <option value="all">All Types</option>
              <option value="reschedule_request">Reschedule Requests</option>
              <option value="reschedule_approved">Reschedule Approved</option>
              <option value="reschedule_rejected">Reschedule Rejected</option>
              <option value="appointment_confirmed">
                Appointment Confirmed
              </option>
              <option value="appointment_cancelled">
                Appointment Cancelled
              </option>
              <option value="appointment_reminder">
                Appointment Reminders
              </option>
            </select>

            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
              className="text-sm p-2 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-sm p-2 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
            />
          </div>

          {(filterType !== "all" ||
            filterRead !== "all" ||
            dateFilter !== "") && (
            <button
              onClick={() => {
                setFilterType("all");
                setFilterRead("all");
                setDateFilter("");
              }}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                No notifications found
              </p>
              <p className="text-gray-400 mt-1">
                {filterType !== "all" || filterRead !== "all"
                  ? "Try adjusting your filters"
                  : "You're all caught up!"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const type = notification.notificationType;
              const Icon = getNotificationIcon(type);
              const apt = notification.aptId;

              return (
                <div
                  key={notification._id}
                  className={`bg-white rounded-lg shadow-sm border-l-4 overflow-hidden transition-all hover:shadow-md ${
                    !notification.isRead
                      ? "border-l-blue-500"
                      : "border-l-gray-300"
                  }`}
                >
                  <div className="p-3">
                    <div className="flex items-start gap-2">
                      {/* Icon */}
                      <div
                        className={`p-2 rounded-lg border ${getNotificationColor(type)}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                New
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(notification.createdAt).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>

                        <p className="text-gray-700 text-sm mb-1">
                          {notification.message}
                        </p>

                        {/* Appointment Details */}
                        {apt && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600 font-medium">
                                  Appointment ID:{" "}
                                </span>
                                <span className="text-gray-900 font-mono">
                                  {apt.id_no}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">
                                  Patient:{" "}
                                </span>
                                <span className="text-gray-900">
                                  {apt.patientId?.fullName}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">
                                  Date & Time:{" "}
                                </span>
                                <span className="text-gray-900">
                                  {new Date(apt.aptDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )}{" "}
                                  at {apt.appointmentTime}
                                </span>
                              </div>
                              {apt.status && (
                                <div>
                                  <span className="text-gray-600 font-medium">
                                    Status:{" "}
                                  </span>
                                  <span
                                    className={`font-semibold ${
                                      apt.status === "Confirmed"
                                        ? "text-green-600"
                                        : apt.status === "Cancelled"
                                          ? "text-red-600"
                                          : apt.status === "Completed"
                                            ? "text-green-600"
                                            : apt.status === "Rescheduled"
                                              ? "text-blue-600"
                                              : "text-gray-900"
                                    }`}
                                  >
                                    {apt.status}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Dispensed Prescriptions */}
                        {notification.notificationType === "prescription" && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600 font-medium">
                                  Prescription ID:{" "}
                                </span>
                                <span className="text-gray-900 font-mono">
                                  {notification.prescription?.prescriptionId}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">
                                  Dispensed At:{" "}
                                </span>
                                <span className="text-gray-900">
                                  {notification.prescription?.dispensedAt
                                    ? `${new Date(
                                        notification.prescription?.dispensedAt,
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}, ${new Date(
                                        notification.prescription?.dispensedAt,
                                      ).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}`
                                    : "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">
                                  Status:{" "}
                                </span>
                                <span className="font-semibold text-green-600">
                                  {notification.prescription?.status}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">
                                  Total Amount:{" "}
                                </span>
                                <span className="text-gray-900">
                                  {notification.prescription?.totalAmount}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Lab Order */}
                        {notification.notificationType === "lab" && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600 font-medium">
                                  Lab Report ID:{" "}
                                </span>
                                <span className="text-gray-900 font-mono">
                                  {notification.labOrder?.testId}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">
                                  Test Name:{" "}
                                </span>
                                <span className="text-gray-900 font-mono">
                                  {notification.labOrder?.testName}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">
                                  Status:{" "}
                                </span>
                                <span className="font-semibold text-green-600">
                                  {notification.labOrder?.status}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">
                                  Completed At:{" "}
                                </span>
                                <span className="text-gray-900">
                                  {notification.labOrder?.completedAt
                                    ? `${new Date(
                                        notification.labOrder.completedAt,
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}, ${new Date(
                                        notification.labOrder.completedAt,
                                      ).toLocaleTimeString("en-US", {
                                        minute: "2-digit",
                                        hour: "2-digit",
                                      })}`
                                    : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Reschedule Details */}
                        {apt?.oldAptDate && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                            <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                              Reschedule Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="text-gray-700">
                                  <span className="font-medium">Original:</span>{" "}
                                  {new Date(apt.oldAptDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )}{" "}
                                  at {apt.oldAptTime}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-gray-700">
                                  <span className="font-medium">New:</span>{" "}
                                  {new Date(apt.aptDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )}{" "}
                                  at {apt.appointmentTime}
                                </span>
                              </div>
                              {apt.rescheduleReason && (
                                <div className="flex items-start gap-2 mt-2">
                                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                  <span className="text-gray-700">
                                    <span className="font-medium">Reason:</span>{" "}
                                    {apt.rescheduleReason}
                                  </span>
                                </div>
                              )}
                              {apt.rescheduleStatus && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-gray-600 font-medium text-xs">
                                    Reschedule Status:
                                  </span>
                                  <span
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                      apt.rescheduleStatus === "Approved"
                                        ? "bg-green-100 text-green-800"
                                        : apt.rescheduleStatus === "Rejected"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {apt.rescheduleStatus}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="text-sm cursor-pointer text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors ease-in-out duration-300"
                            >
                              <MailOpen className="h-4 w-4" />
                              Mark as Read
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedNotification(notification);
                              setModalType("viewDetails");
                              openModal();
                              if (!notification.isRead) {
                                markAsRead(notification._id);
                              }
                            }}
                            className="text-sm cursor-pointer text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1 transition-colors ease-in-out duration-300"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                          <button
                            onClick={() => {
                              openModal();
                              setModalType("dltNot");
                              setSelectedNotification(notification);
                            }}
                            className="text-sm cursor-pointer text-red-600 hover:text-red-800 font-medium flex items-center gap-1 ml-auto transition-colors ease-in-out duration-300"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal */}
        <Modal
          isOpen={isOpen}
          title={
            modalType === "dltNot"
              ? "Delete Notification"
              : "Notification Details"
          }
          onClose={closeModal}
          width="max-w-2/3"
          height="max-h-[450px]"
          cancelIcon={<X className="w-5 h-5 mr-2" />}
          onConfirm={
            modalType === "dltNot"
              ? () => deleteNotification(selectedNotification?._id)
              : undefined
          }
          confirmIcon={
            modalType === "dltNot" ? <Trash2 className="w-5 h-5 mr-2" /> : ""
          }
          confirmText="Delete"
          confirmColor="bg-red-500 hover:bg-red-700 text-white"
          onCancel={modalType === "dltNot" ? closeModal : ""}
        >
          {modalType === "viewDetails" &&
            selectedNotification &&
            (() => {
              const type = selectedNotification.notificationType;
              const Icon = getNotificationIcon(type);
              const apt = selectedNotification.aptId;

              return (
                <div className="space-y-2">
                  {/* Title and Type */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg border ${getNotificationColor(type)}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {selectedNotification.title}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {new Date(
                          selectedNotification.createdAt,
                        ).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Message
                    </label>
                    <p className="text-gray-700 bg-gray-50 rounded-lg p-3">
                      {selectedNotification.message}
                    </p>
                  </div>

                  {/* Lab Test Details */}
                  {selectedNotification.notificationType.includes("lab") && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Lab Test Results
                      </label>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-purple-700 font-medium">
                              Test Name:
                            </span>
                            <p className="text-purple-900">
                              {selectedNotification.labOrder?.testName}
                            </p>
                          </div>
                          <div>
                            <span className="text-purple-700 font-medium">
                              Test ID:
                            </span>
                            <p className="text-purple-900 font-mono">
                              {selectedNotification.labOrder?.testId}
                            </p>
                          </div>
                          <div>
                            <span className="text-purple-700 font-medium">
                              Status:
                            </span>
                            <span className="text-sm font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
                              {selectedNotification.labOrder?.status}
                            </span>
                          </div>
                          {selectedNotification.labOrder?.completedAt && (
                            <div>
                              <span className="text-purple-700 font-medium">
                                Completed At:
                              </span>
                              <p className="text-purple-900 text-xs">
                                {new Date(
                                  selectedNotification.labOrder?.completedAt,
                                ).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Test Results */}
                        {selectedNotification.labOrder?.results &&
                          Array.isArray(
                            selectedNotification.labOrder?.results,
                          ) &&
                          selectedNotification.labOrder?.results.length > 0 && (
                            <div className="mt-3 bg-white rounded overflow-hidden">
                              <p className="text-xs font-semibold text-purple-700 mb-2 px-2 pt-2">
                                Test Results:
                              </p>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="bg-purple-100 border-b border-purple-300">
                                      <th className="px-2 py-1.5 text-left font-semibold text-purple-900">
                                        Parameter
                                      </th>
                                      <th className="px-2 py-1.5 text-left font-semibold text-purple-900">
                                        Result
                                      </th>
                                      <th className="px-2 py-1.5 text-left font-semibold text-purple-900">
                                        Unit
                                      </th>
                                      <th className="px-2 py-1.5 text-left font-semibold text-purple-900">
                                        Reference Range
                                      </th>
                                      <th className="px-2 py-1.5 text-left font-semibold text-purple-900">
                                        Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {selectedNotification.labOrder?.results.map(
                                      (result: any, idx: number) => {
                                        const statusColor =
                                          result.status === "Normal"
                                            ? "bg-green-100 text-green-800"
                                            : result.status === "High"
                                              ? "bg-red-100 text-red-800"
                                              : result.status === "Low"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-orange-100 text-orange-800";
                                        return (
                                          <tr
                                            key={idx}
                                            className={`border-b border-purple-100 ${
                                              idx % 2 === 0
                                                ? "bg-purple-50"
                                                : "bg-white"
                                            } hover:bg-purple-100 transition-colors`}
                                          >
                                            <td className="px-2 py-1.5 font-medium text-purple-900">
                                              {result.name ||
                                                result.parameter ||
                                                "Parameter"}
                                            </td>
                                            <td className="px-2 py-1.5 font-semibold text-purple-800">
                                              {result.value || result.result}
                                            </td>
                                            <td className="px-2 py-1.5 text-purple-700">
                                              {result.unit || "N/A"}
                                            </td>
                                            <td className="px-2 py-1.5 text-purple-700">
                                              {result.range ||
                                                result.referenceRange ||
                                                "N/A"}
                                            </td>
                                            <td className="px-2 py-1.5">
                                              <span
                                                className={`px-2 py-0.5 rounded font-semibold text-xs ${
                                                  statusColor || ""
                                                }`}
                                              >
                                                {result.status || "Unknown"}
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      },
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                        {selectedNotification.labOrder?.remarks && (
                          <div className="mt-2 bg-white rounded p-2">
                            <p className="text-xs font-semibold text-purple-700 mb-1">
                              Remarks:
                            </p>
                            <p className="text-xs text-purple-900">
                              {selectedNotification.labOrder?.remarks}
                            </p>
                          </div>
                        )}

                        {selectedNotification.labOrder?.resultPDF && (
                          <div className="mt-2 flex gap-2">
                            <a
                              href={`${baseurl}/images/pdfs/${selectedNotification.labOrder?.resultPDF}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-800 bg-purple-100 px-3 py-2 rounded transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              View PDF
                            </a>
                            <a
                              href={`${baseurl}/images/pdfs/${selectedNotification.labOrder?.resultPDF}`}
                              download
                              className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-800 bg-purple-100 px-3 py-2 rounded transition-colors"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Prescription Details */}
                  {selectedNotification.notificationType.includes(
                    "prescription",
                  ) && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Prescription Details
                      </label>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-orange-700 font-medium">
                              Prescription ID:
                            </span>
                            <p className="text-sm font-semibold text-orange-900">
                              {
                                selectedNotification.prescription
                                  ?.prescriptionId
                              }
                            </p>
                          </div>
                          <div>
                            <span className="text-orange-700 font-medium">
                              Status:
                            </span>
                            <p className="text-sm font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800 w-fit">
                              {selectedNotification.prescription?.status}
                            </p>
                          </div>
                          <div>
                            <span className="text-orange-700 font-medium">
                              Total Amount:
                            </span>
                            <p className="text-orange-900 font-semibold">
                              Rs.{" "}
                              {selectedNotification.prescription?.totalAmount?.toFixed(
                                2,
                              )}
                            </p>
                          </div>
                          {selectedNotification.prescription?.dispensedAt && (
                            <div>
                              <span className="text-orange-700 font-medium">
                                Dispensed At:
                              </span>
                              <p className="text-orange-900 text-xs">
                                {new Date(
                                  selectedNotification.prescription
                                    ?.dispensedAt,
                                ).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Medicines */}
                        {selectedNotification.prescription?.medicines &&
                          Array.isArray(
                            selectedNotification.prescription?.medicines,
                          ) && (
                            <div className="mt-3 bg-white rounded overflow-hidden">
                              <p className="text-xs font-semibold text-orange-700 mb-2 px-2 pt-2">
                                Medicines:
                              </p>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="bg-orange-100 border-b border-orange-300">
                                      <th className="px-2 py-1.5 text-left font-semibold text-orange-900">
                                        Medicine Name
                                      </th>
                                      <th className="px-2 py-1.5 text-left font-semibold text-orange-900">
                                        Dosage
                                      </th>
                                      <th className="px-2 py-1.5 text-left font-semibold text-orange-900">
                                        Frequency
                                      </th>
                                      <th className="px-2 py-1.5 text-left font-semibold text-orange-900">
                                        Duration
                                      </th>
                                      <th className="px-2 py-1.5 text-left font-semibold text-orange-900">
                                        Quantity
                                      </th>
                                      <th className="px-2 py-1.5 text-left font-semibold text-orange-900">
                                        Instructions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {selectedNotification.prescription.medicines.map(
                                      (medicine: any, idx: number) => (
                                        <tr
                                          key={idx}
                                          className={`border-b border-orange-100 ${
                                            idx % 2 === 0
                                              ? "bg-orange-50"
                                              : "bg-white"
                                          } hover:bg-orange-100 transition-colors`}
                                        >
                                          <td className="px-2 py-1.5 font-medium text-orange-900">
                                            {medicine.medicineName}
                                          </td>
                                          <td className="px-2 py-1.5 text-orange-800">
                                            {medicine.dosage}mg
                                          </td>
                                          <td className="px-2 py-1.5 text-orange-800">
                                            {medicine.frequency}x/day
                                          </td>
                                          <td className="px-2 py-1.5 text-orange-800">
                                            {medicine.duration} days
                                          </td>
                                          <td className="px-2 py-1.5 text-orange-800 font-semibold">
                                            {medicine.frequency *
                                              medicine.duration}{" "}
                                            tablets
                                          </td>
                                          <td className="px-2 py-1.5 italic text-orange-700">
                                            {medicine.note || "N/A"}
                                          </td>
                                        </tr>
                                      ),
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        {selectedNotification.prescription?.resultPDF && (
                          <div className="mt-3 flex gap-2">
                            <a
                              href={`${baseurl}/images/pdfs/${selectedNotification.prescription?.resultPDF}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm font-medium text-white hover:bg-orange-500 duration-300 ease-in-out bg-orange-300 px-3 py-2 rounded transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              View PDF
                            </a>
                            <a
                              href={`${baseurl}/images/pdfs/${selectedNotification.prescription?.resultPDF}`}
                              download
                              target="_blank"
                              className="flex items-center gap-2 text-sm font-medium text-white hover:bg-orange-500 duration-300 ease-in-out bg-orange-300 px-3 py-2 rounded transition-colors"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Appointment Details */}
                  {apt && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Appointment Details
                      </label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-blue-700 font-medium">
                              Appointment ID:
                            </span>
                            <p className="text-blue-900 font-mono">
                              {apt.id_no}
                            </p>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">
                              Patient ID:
                            </span>
                            <p className="text-blue-900">
                              {apt.patientId?.id_no}
                            </p>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">
                              Patient:
                            </span>
                            <p className="text-blue-900">
                              {apt.patientId?.fullName}
                            </p>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">
                              Patient Contact:
                            </span>
                            <p className="text-blue-900 capitalize">
                              {apt.patientId.phoneNo}
                            </p>
                            <p className="text-blue-900">
                              {apt.patientId.email}
                            </p>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">
                              Time:
                            </span>
                            <p className="text-blue-900">
                              {apt.appointmentTime}
                            </p>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">
                              Date:
                            </span>
                            <p className="text-blue-900">
                              {new Date(apt.aptDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">
                              Shift:
                            </span>
                            <p className="text-blue-900 capitalize">
                              {apt.shift}
                            </p>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">
                              Status:
                            </span>
                            <p
                              className={`font-semibold ${
                                apt.status === "Confirmed"
                                  ? "text-green-700"
                                  : apt.status === "Cancelled"
                                    ? "text-red-700"
                                    : apt.status === "Completed"
                                      ? "text-green-700"
                                      : apt.status === "Rescheduled"
                                        ? "text-blue-700"
                                        : "text-blue-900"
                              }`}
                            >
                              {apt.status}
                            </p>
                          </div>
                          {apt.reasonForVisit && (
                            <div className="col-span-2">
                              <span className="text-blue-700 font-medium">
                                Reason for Visit:
                              </span>
                              <p className="text-blue-900">
                                {apt.reasonForVisit}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reschedule Details */}
                  {apt?.oldAptDate && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Reschedule Information
                      </label>
                      <div className="space-y-3">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-start gap-1 mb-1">
                            <XCircle className="h-5 w-5 text-red-600 mt-0.75" />
                            <div>
                              <span className="text-sm font-semibold text-red-900">
                                Original Appointment
                              </span>
                              <p className="text-sm text-red-800">
                                {new Date(apt.oldAptDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}{" "}
                                at {apt.oldAptTime}{" "}
                                {apt.oldShiftApt && (
                                  <span className="capitalize">
                                    ({apt.oldShiftApt} shift)
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-start gap-1 mb-1">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.75" />
                            <div>
                              <span className="text-sm font-semibold text-green-900">
                                New Appointment
                              </span>
                              <p className="text-sm text-green-800">
                                {new Date(apt.aptDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}{" "}
                                at {apt.appointmentTime}{" "}
                                <span className="capitalize">
                                  ({apt.shift} shift)
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {apt.rescheduleReason && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-start gap-1">
                              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.75" />
                              <div>
                                <span className="text-sm font-semibold text-yellow-900">
                                  Reason:
                                </span>
                                <p className="text-sm text-yellow-800 mt-1">
                                  {apt.rescheduleReason}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {apt.rescheduleStatus && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 font-medium">
                              Reschedule Status:
                            </span>
                            <span
                              className={`text-sm font-semibold px-3 py-1 rounded-full ${
                                apt.rescheduleStatus === "Approved"
                                  ? "bg-green-100 text-green-800"
                                  : apt.rescheduleStatus === "Rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {apt.rescheduleStatus}
                            </span>
                          </div>
                        )}

                        {apt.rescheduledAt && (
                          <p className="text-xs text-gray-500">
                            Rescheduled on:{" "}
                            {new Date(apt.rescheduledAt).toLocaleString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          {modalType === "dltNot" && selectedNotification && (
            <div className="pb-4">
              <h1>Are you sure? You want to delete this notification.</h1>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default DoctorNotifications;
