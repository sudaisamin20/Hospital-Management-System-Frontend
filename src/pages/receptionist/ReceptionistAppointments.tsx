import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  Check,
  Eye,
  X,
  Search,
  RefreshCw,
  User,
  Phone,
  BadgeCheck,
  Trash,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";
import { useSelector } from "react-redux";
import { useSocket } from "../../hooks/useSocket";
import { useSocketEvent } from "../../hooks/useSocketEvent";
import type { IStateData, User as IUser } from "../../features";

interface Appointment {
  _id: string;
  id_no: string;
  patientId: {
    fullName: string;
    id_no: string;
    _id: string;
    phoneNo: string;
  };
  doctorId: {
    fullName: string;
    id_no: string;
    _id: string;
    photo: string;
  };
  departmentId: {
    name: string;
  };
  specialistId: {
    name: string;
  };
  aptDate: string;
  appointmentTime: string;
  shift: string;
  status: string;
  reasonForVisit: string;
  createdAt: string;
  confirmedAt: string;
  completedAt: string;
}

const ReceptionistAppointments = () => {
  const { isOpen, openModal, closeModal } = useModal();
  const receptionist: IUser = useSelector(
    (state: IStateData) => state.auth.user,
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [modalType, setModalType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedApt, setSelectedApt] = useState<Appointment | null>();
  const baseurl = import.meta.env.VITE_BASE_URL;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Reschedule Requested":
        return "bg-amber-100 text-amber-800";
      case "Rescheduled":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift.toLowerCase()) {
      case "morning":
        return "bg-orange-100 text-orange-800";
      case "afternoon":
        return "bg-purple-100 text-purple-800";
      case "evening":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // const handleStatusChange = (id: string, newStatus: Appointment["status"]) => {
  //   setAppointments(
  //     appointments.map((apt) =>
  //       apt._id === id
  //         ? { ...apt, status: newStatus, updatedAt: new Date().toISOString() }
  //         : apt,
  //     ),
  //   );
  // };

  const fetchAllAppointments = async () => {
    try {
      const response = await axios.get(
        `${baseurl}/api/appointment/fetch/all-appointments/${receptionist?.id}`,
      );
      if (response.data.success) {
        setAppointments(response.data.allPenApts);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during registration:", error.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Unexpected error during registration:", error);
      }
    }
  };

  useEffect(() => {
    if (receptionist?.id) {
      const fetchAllAptsData = async () => {
        await fetchAllAppointments();
      };

      fetchAllAptsData();
    }
  }, [receptionist?.id]);

  useSocket(receptionist);
  useSocketEvent("newAppointment", (data: any) => {
    setAppointments((prev) => {
      const exists = prev.find((a) => a._id === data.appointment._id);
      if (exists) return prev;

      const updated = [data.appointment, ...prev];
      return updated.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    });
    toast.success("New appointment added! See details for confirmation.");
  });

  const handleConfirmApt = async (id: string | undefined) => {
    try {
      const response = await axios.put(
        `${baseurl}/api/appointment/confirm-apt-status`,
        { id, status: "Confirmed", handleBy: receptionist.id },
      );
      console.log(response);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchAllAppointments();
        closeModal();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during registration:", error?.response?.data);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Unexpected error during registration:", error);
      }
    }
  };
  const handleMarkAsCom = async (id: string) => {
    try {
      const response = await axios.put(
        `${baseurl}/api/appointment/complete-apt-status`,
        { id, status: "Completed" },
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchAllAppointments();
        closeModal();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during registration:", error.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Unexpected error during registration:", error);
      }
    }
  };
  const handleRefresh = () => {
    fetchAllAppointments();
  };

  const handleDeleteApt = async (id: string | undefined) => {
    try {
      const response = await axios.put(
        `${baseurl}/api/appointment/delete-apt`,
        { id, role: receptionist?.role, userId: receptionist?.id },
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchAllAppointments();
        closeModal();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during registration:", error.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(
          "Unexpected error during registration:",
          error?.response?.data.message,
        );
      }
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientId?.fullName
        ?.toLowerCase()
        ?.includes(searchTerm?.toLowerCase()) ||
      apt.doctorId?.fullName
        ?.toLowerCase()
        ?.includes(searchTerm?.toLowerCase()) ||
      apt.patientId?._id?.toLowerCase()?.includes(searchTerm?.toLowerCase());

    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    const matchesDate = !dateFilter || apt.aptDate === dateFilter;
    const matchesDepartment =
      departmentFilter === "all" || apt.departmentId.name === departmentFilter;

    return matchesSearch && matchesStatus && matchesDate && matchesDepartment;
  });

  // Get unique departments
  const departments = Array.from(
    new Set(appointments.map((apt) => apt.departmentId.name)),
  );

  // Statistics
  const stats = {
    total: appointments.length,
    pending: appointments.filter((apt) => apt.status === "Pending").length,
    confirmed: appointments.filter((apt) => apt.status === "Confirmed").length,
    completed: appointments.filter((apt) => apt.status === "Completed").length,
    cancelled: appointments.filter((apt) => apt.status === "Cancelled").length,
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-3">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="p-3 mb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                All Appointments
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage and monitor all patient appointments
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-lg font-bold text-yellow-600 mt-1">
                  {stats.pending}
                </p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-full">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Confirmed</p>
                <p className="text-lg font-bold text-green-600 mt-1">
                  {stats.confirmed}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-lg font-bold text-blue-600 mt-1">
                  {stats.completed}
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <Check className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Cancelled</p>
                <p className="text-lg font-bold text-red-600 mt-1">
                  {stats.cancelled}
                </p>
              </div>
              <div className="bg-red-100 p-2 rounded-full">
                <X className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient, doctor, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
            />

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departments?.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm ||
            statusFilter !== "all" ||
            dateFilter ||
            departmentFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setDateFilter("");
                setDepartmentFilter("all");
              }}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredAppointments.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {appointments.length}
            </span>{" "}
            appointments
          </p>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 shadow-2xl">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Time & Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Shift
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Calendar className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">
                          No appointments found
                        </p>
                        <p className="text-gray-400 mt-1">
                          Try adjusting your filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr
                      key={appointment._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Patient */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {appointment.patientId.fullName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center">
                            {appointment.doctorId.photo ? (
                              <img
                                src={`${baseurl}/images/uploads/${appointment.doctorId.photo}`}
                                alt={appointment.doctorId.photo}
                                className="rounded-full h-10 w-10 object-center object-cover"
                              />
                            ) : (
                              <span className="text-blue-600 font-semibold text-sm">
                                {appointment.doctorId.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {appointment.doctorId.fullName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {appointment.departmentId.name}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900">
                              {appointment.appointmentTime}{" "}
                              {new Date(appointment.aptDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Shift */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getShiftColor(appointment.shift)}`}
                        >
                          {appointment.shift}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div
                          // value={appointment.status}
                          // onChange={(e) =>
                          //   handleStatusChange(
                          //     appointment._id,
                          //     e.target.value as Appointment["status"],
                          //   )
                          // }
                          className={`px-3 py-1 text-center text-xs leading-5 font-semibold rounded-full border-0 focus:ring-2 focus:outline-none focus:ring-blue-500 ${getStatusColor(appointment.status)}`}
                        >
                          <span>{appointment.status}</span>
                          {/* <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Reschedule Requested">
                            Reschedule Requested
                          </option> */}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div
                          className={`${appointment.status === "Completed" ? "flex gap-2 items-center" : ""}`}
                        >
                          <button
                            onClick={() => {
                              openModal();
                              setModalType("viewDetail");
                              setSelectedApt(appointment);
                            }}
                            className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium text-sm"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {appointment.status === "Completed" && (
                            <button
                              onClick={() => {
                                openModal();
                                setModalType("deleteApt");
                                setSelectedApt(appointment);
                              }}
                              className="text-red-500 cursor-pointer hover:text-red-800 font-medium text-sm"
                              title="View Details"
                            >
                              <Trash className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          title={
            modalType === "viewDetail"
              ? `${selectedApt?.patientId?.fullName}'s Appointment Details`
              : modalType === "deleteApt"
                ? "Delete Appointment"
                : ""
          }
          onConfirm={
            selectedApt?.status !== "Pending"
              ? ""
              : modalType === "viewDetail"
                ? () => handleConfirmApt(selectedApt?._id)
                : modalType === "deleteApt"
                  ? () => handleDeleteApt(selectedApt?._id)
                  : undefined
          }
          onCancel={selectedApt?.status !== "Pending" ? undefined : closeModal}
          confirmText={
            modalType === "viewDetail"
              ? "Confirm Appointment"
              : modalType === "deleteApt"
                ? "Delete Appointment"
                : ""
          }
          cancelText={"Close"}
          confirmIcon={
            modalType === "viewDetail" ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : modalType === "deleteApt" ? (
              <Trash className="h-5 w-5 mr-2" />
            ) : (
              ""
            )
          }
          cancelIcon={<X className="w-5 h-5 mr-2" />}
          width="max-w-2/3"
          height="max-h-[450px]"
          confirmColor={
            modalType === "deleteApt"
              ? "bg-red-700 hover:bg-red-400 text-white border-0"
              : "bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          }
        >
          {modalType === "viewDetail" && selectedApt && (
            <div className="space-y-4">
              {/* Appointment ID and Created Date */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">
                      Appointment ID:{" "}
                    </span>
                    <span className="text-gray-900 font-semibold font-mono">
                      {selectedApt.id_no}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">
                      Confirmed At:{" "}
                    </span>
                    <span className="text-gray-900">
                      {new Date(selectedApt.confirmedAt).toLocaleString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient and Doctor Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Patient Information */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Patient Information
                  </h4>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Full Name
                      </label>
                      <p className="text-base text-gray-900 font-medium">
                        {selectedApt.patientId.fullName}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Patient ID
                      </label>
                      <p className="text-base text-gray-900 font-mono">
                        {selectedApt.patientId.id_no}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Contact Number
                      </label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-base text-gray-900">
                          {selectedApt.patientId.phoneNo}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Doctor Information */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Doctor Information
                  </h4>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Doctor Name
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          {selectedApt.doctorId.photo ? (
                            <img
                              src={`${baseurl}/images/uploads/${selectedApt.doctorId.photo}`}
                              alt={selectedApt.doctorId.photo}
                              className="h-12 w-12 rounded-full"
                            />
                          ) : (
                            <span className="text-blue-600 font-semibold text-base">
                              {selectedApt.doctorId.fullName
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "?"}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-base text-gray-900 font-medium">
                            {selectedApt.doctorId.fullName}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {selectedApt.doctorId.id_no}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Department
                      </label>
                      <p className="text-base text-gray-900">
                        {selectedApt.departmentId.name}
                      </p>
                    </div>

                    {selectedApt.specialistId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Specialist
                        </label>
                        <p className="text-base text-gray-900">
                          {selectedApt.specialistId.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Appointment Schedule */}
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Appointment Schedule
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Date
                        </label>
                        <p className="text-sm text-gray-900 font-semibold">
                          {new Date(selectedApt.aptDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Time
                        </label>
                        <p className="text-sm text-gray-900 font-semibold">
                          {selectedApt.appointmentTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Clock className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Shift
                        </label>
                        <p className="text-sm text-gray-900 font-semibold capitalize">
                          {selectedApt.shift}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div
                        className={`${getStatusColor(selectedApt.status)} bg-purple-100 p-2 rounded-lg`}
                      >
                        <BadgeCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Status
                        </label>
                        <p className="text-sm text-gray-900 font-semibold capitalize">
                          {selectedApt.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason for Visit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Reason for Visit
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-900 leading-relaxed">
                    {selectedApt.reasonForVisit || "No reason provided"}
                  </p>
                </div>
              </div>
            </div>
          )}
          {modalType === "deleteApt" && (
            <div>
              <h1 className="">
                Are you sure you want to cancel appointment with{" "}
                <span className="font-bold">
                  {selectedApt?.doctorId?.fullName}
                </span>
                ?
              </h1>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ReceptionistAppointments;
