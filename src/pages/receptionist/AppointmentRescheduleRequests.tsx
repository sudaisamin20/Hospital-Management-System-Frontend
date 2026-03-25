import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Check,
  X,
  Filter,
  Search,
  Ban,
} from "lucide-react";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import axios from "axios";
import { useSelector } from "react-redux";

interface IAppointment {
  _id: string;
  id_no: string;
  aptDate: string;
  appointmentTime: string;
  shift: string;
  reasonForVisit: string;
  patientId: {
    _id: string;
    id_no: string;
    fullName: string;
    phoneNo: string;
    email: string;
  };
  doctorId: {
    _id: string;
    id_no: string;
    fullName: string;
    photo: string;
  };
  departmentId: {
    _id: string;
    name: string;
  };
  rescheduleReason: string;
  addDetails: string;
  //   urgency: string;
  altDate1: string;
  altShift1: string;
  altTime1: string;
  altDate2: string;
  altShift2: string;
  altTime2: string;
  altDate3: string;
  altShift3: string;
  altTime3: string;
  status: string;
  rescheduleRequestedAt: Date;
  suggestedSlots: [
    {
      date: Date;
      shift: string;
      time: string;
    },
  ];
  createdAt: string;
  updatedAt: string;
}

interface ISlot {
  date: Date;
  shift: string;
  time: string;
}

const AppointmentRescheduleRequests = () => {
  const { isOpen, openModal, closeModal } = useModal();
  const receptionist = useSelector((state: any) => state.auth.user);
  const [modalType, setModalType] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [selectedApt, setSelectedApt] = useState<IAppointment>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSlot, setSelectedSlot] = useState<ISlot>({});
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(
    null,
  );
  //   const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  //   const getUrgencyColor = (urgency: string) => {
  //     switch (urgency?.toLowerCase()) {
  //       case "high":
  //         return "bg-red-100 text-red-800";
  //       case "medium":
  //         return "bg-yellow-100 text-yellow-800";
  //       case "low":
  //         return "bg-blue-100 text-blue-800";
  //       default:
  //         return "bg-gray-100 text-gray-800";
  //     }
  //   };

  const fetchRescheduleRequests = async () => {
    try {
      const response = await axios.get(
        `${baseurl}/api/appointment/fetch/reschedule-requests`,
      );
      if (response.data.success) {
        setAppointments(response.data.resReqApts);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching requests:", error.message);
      }
    }
  };

  useEffect(() => {
    if (receptionist?.id) {
      const fetchResReqData = async () => {
        await fetchRescheduleRequests();
      };
      fetchResReqData();
    }
  }, [receptionist?.id]);

  const handleApproveRequest = async (
    aptId: string,
    date: string,
    shift: string,
    time: string,
  ) => {
    try {
      const response = await axios.put(
        `${baseurl}/api/appointment/approve-reschedule`,
        {
          aptId,
          date,
          shift,
          time,
          rescheduleStatus: "Approved",
          status: "Rescheduled",
          recId: receptionist?.id,
        },
      );
      if (response.data.success) {
        fetchRescheduleRequests();
        toast.success(response.data.message);
        closeModal();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error approving request:", error.message);
        toast.error(error.message);
      }
    }
  };

  const handleRejectRequest = async (
    requestId: string,
    rejectionReason: string,
  ) => {
    try {
      const response = await axios.put(
        `${baseurl}/api/appointment/reject-reschedule`,
        { requestId, rejectionReason },
      );
      if (response.data.success) {
        toast.success("Reschedule request rejected!");
        closeModal();
        fetchRescheduleRequests();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error rejecting request:", error.message);
        toast.error(error.message);
      }
    }
  };

  // Filter requests
  const filteredAppointments = appointments?.filter((apt) => {
    const matchesSearch =
      apt?.patientId?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      apt?.doctorId?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      apt?.id_no?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    const matchesDate = !dateFilter || apt.aptDate === dateFilter;
    // const matchesUrgency =
    //   urgencyFilter === "all" || req.urgency === urgencyFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });
  console.log(appointments);
  // Statistics
  const stats = [
    {
      label: "Total",
      count: appointments?.length,
      icon: Calendar,
      color: "blue",
    },
    {
      label: "Pending",
      count: appointments?.filter((apt) => apt.status === "Pending")?.length,
      icon: AlertCircle,
      color: "yellow",
    },
    {
      label: "Confirmed",
      count: appointments?.filter((apt) => apt.status === "Confirmed")?.length,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "Completed",
      count: appointments?.filter((apt) => apt.status === "Completed")?.length,
      icon: Check,
      color: "blue",
    },
    {
      label: "Cancelled",
      count: appointments?.filter((apt) => apt.status === "Cancelled")?.length,
      icon: XCircle,
      color: "red",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Reschedule Requests
            </h1>
            <p className="text-gray-600 mt-2">
              Manage appointment reschedule requests from doctors
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between"
              >
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {item.label}
                  </p>
                  <p
                    className={`text-2xl font-bold text-${item.color}-600 mt-1`}
                  >
                    {item.count}
                  </p>
                </div>
                <div className={`bg-${item.color}-100 p-3 rounded-full`}>
                  <Icon className={`h-6 w-6 text-${item.color}-600`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient, doctor, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Urgency Filter */}
            {/* <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Urgency</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select> */}
          </div>

          {/* Clear Filters */}
          {(searchTerm || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                // setUrgencyFilter("all");
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
              {filteredAppointments?.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {appointments?.length}
            </span>{" "}
            requests
          </p>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 shadow-2xl">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Request ID
                  </th> */}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Current Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Reason
                  </th>
                  {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Urgency
                  </th> */}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppointments?.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Calendar className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">
                          No reschedule requests found
                        </p>
                        <p className="text-gray-400 mt-1">
                          {searchTerm || statusFilter !== "all"
                            ? "Try adjusting your filters"
                            : "There are no reschedule requests at the moment"}
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
                      {/* Request ID */}
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900">
                          {request?.id_no}
                        </span>
                      </td> */}

                      {/* Doctor */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {appointment?.doctorId?.photo ? (
                              <img
                                src={`${baseurl}/images/uploads/${appointment.doctorId.photo}`}
                                alt={appointment.doctorId.fullName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-blue-600 font-semibold text-sm">
                                {appointment.doctorId?.fullName
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              Dr. {appointment.doctorId?.fullName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {appointment?.patientId?.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {appointment?.patientId?.phoneNo}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Current Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {new Date(
                                appointment?.aptDate,
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {appointment?.appointmentTime}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 line-clamp-2">
                          {appointment.reasonForVisit}
                        </span>
                      </td>

                      {/* Urgency */}
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getUrgencyColor(appointment.urgency)}`}
                        >
                          {appointment.urgency}
                        </span>
                      </td> */}

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(appointment.status)}`}
                        >
                          {appointment.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              openModal();
                              setModalType("viewRequest");
                              setSelectedApt(appointment);
                            }}
                            className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium text-sm"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {appointment.status === "Pending" && (
                            <>
                              <button
                                onClick={() => {
                                  openModal();
                                  setModalType("approveRequest");
                                  setSelectedApt(appointment);
                                }}
                                className="text-green-600 cursor-pointer hover:text-green-800 font-medium text-sm"
                                title="Approve"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => {
                                  openModal();
                                  setModalType("rejectRequest");
                                  setSelectedApt(appointment);
                                }}
                                className="text-red-600 cursor-pointer hover:text-red-800 font-medium text-sm"
                                title="Reject"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </>
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

        {/* Modal */}
        <Modal
          isOpen={isOpen}
          title={
            modalType === "viewRequest" ? "Reschedule Request Details" : ""
          }
          onClose={closeModal}
          width="w-2/3"
          height={modalType === "viewRequest" ? "h-96" : "h-40"}
          onConfirm={
            modalType === "viewRequest"
              ? () =>
                  handleApproveRequest(
                    selectedApt?._id,
                    selectedSlot.date,
                    selectedSlot.shift,
                    selectedSlot.time,
                  )
              : undefined
          }
          confirmText={
            modalType === "viewRequest" ? "Approve & Reschedule" : ""
          }
          confirmIcon={
            modalType === "viewRequest" ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : modalType === "rejectRequest" ? (
              <XCircle className="w-5 h-5 mr-2" />
            ) : (
              ""
            )
          }
          confirmColor={
            modalType === "rejectRequest"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          }
          onCancel={modalType === "viewRequest" ? closeModal : closeModal}
          cancelText={
            modalType === "viewRequest" ? "Cancel Appointment" : "Cancel"
          }
          cancelIcon={<X className="w-5 h-5 mr-2" />}
          onBtn1={
            modalType === "viewRequest"
              ? () => handleRejectRequest(selectedApt?._id, "")
              : undefined
          }
          btn1Icon={
            modalType === "viewRequest" ? <Ban className="w-5 h-5 mr-2" /> : ""
          }
          btn1Text={modalType === "viewRequest" ? "Reject Request" : ""}
          btn1Color={
            modalType === "viewRequest"
              ? "bg-red-700 hover:bg-red-400 text-white border-0"
              : ""
          }
        >
          {modalType === "viewRequest" && selectedApt && (
            <div className="space-y-6">
              {/* Request Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">
                      Appointment ID:{" "}
                    </span>
                    <span className="text-gray-900 font-semibold font-mono">
                      {selectedApt?.id_no}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Created: </span>
                    <span className="text-gray-900">
                      {new Date(selectedApt.createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">
                      Submit At:{" "}
                    </span>
                    <span className="text-gray-900">
                      {new Date(
                        selectedApt.rescheduleRequestedAt,
                      ).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {/* <div>
                    <span className="text-gray-600 font-medium">Urgency: </span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getUrgencyColor(selectedApt.urgency)}`}
                    >
                      {selectedApt.urgency}
                    </span>
                  </div> */}
                </div>
              </div>

              {/* Current Appointment Details */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Current Appointment (To Be Rescheduled)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-red-700 mb-1">
                      Patient
                    </label>
                    <p className="text-sm text-red-900 font-medium">
                      {selectedApt?.patientId?.fullName}
                    </p>
                    <p className="text-xs text-red-700">
                      {selectedApt?.patientId?.phoneNo}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-red-700 mb-1">
                      Doctor
                    </label>
                    <p className="text-sm text-red-900 font-medium">
                      {selectedApt?.doctorId?.fullName}
                    </p>
                    <p className="text-xs text-red-700">
                      {selectedApt?.departmentId?.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-red-700 mb-1">
                      Date & Time
                    </label>
                    <p className="text-sm text-red-900 font-medium">
                      {new Date(selectedApt?.aptDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}{" "}
                      at {selectedApt?.appointmentTime}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-red-700 mb-1">
                      Shift
                    </label>
                    <p className="text-sm text-red-900 font-medium capitalize">
                      {selectedApt?.shift}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason for Reschedule */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Reschedule
                </label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {selectedApt.reason}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedApt.addDetails}
                  </p>
                </div>
              </div>

              {/* Alternative Dates */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Suggested Alternative Dates{" "}
                  <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Select one of the suggested dates to reschedule the
                  appointment provided by the doctor
                </p>
                <div className="space-y-3">
                  {selectedApt.suggestedSlots?.map((slot, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedSlotIndex === index
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:border-green-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="selectedSlot"
                        value={index}
                        checked={selectedSlotIndex === index}
                        className="mr-4 h-5 w-5 text-green-600 focus:ring-green-500 cursor-pointer"
                        onChange={() => {
                          setSelectedSlotIndex(index);
                          setSelectedSlot(slot);
                        }}
                        required
                      />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 font-medium mb-1">
                          Option {index + 1}
                        </p>
                        <p className="text-sm text-gray-900 font-semibold">
                          {new Date(slot.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}{" "}
                          at {slot.time}
                        </p>
                        <p className="text-xs text-gray-600 capitalize mt-1">
                          {slot.shift} shift
                        </p>
                      </div>
                      <CheckCircle
                        className={`h-5 w-5 text-green-600 transition-opacity ${
                          selectedSlotIndex === index
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">
                  Patient Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-900">
                      {selectedApt?.patientId?.phoneNo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-900">
                      {selectedApt?.patientId?.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {modalType === "approveRequest" && selectedApt && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Select the new appointment date and time from the options
                provided by the doctor:
              </p>

              <div className="space-y-3">
                {selectedApt.altDate1 && (
                  <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-500 has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
                    <input
                      type="radio"
                      name="selectedDate"
                      value="1"
                      className="mr-3"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(selectedApt.altDate1).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}{" "}
                        at {selectedApt.altTime1}
                      </p>
                      <p className="text-xs text-gray-600 capitalize">
                        {selectedApt.altShift1} shift
                      </p>
                    </div>
                  </label>
                )}
                {selectedApt.altDate2 && (
                  <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-500 has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
                    <input
                      type="radio"
                      name="selectedDate"
                      value="2"
                      className="mr-3"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(selectedApt.altDate2).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}{" "}
                        at {selectedApt.altTime2}
                      </p>
                      <p className="text-xs text-gray-600 capitalize">
                        {selectedApt.altShift2} shift
                      </p>
                    </div>
                  </label>
                )}
                {selectedApt.altDate3 && (
                  <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-500 has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
                    <input
                      type="radio"
                      name="selectedDate"
                      value="3"
                      className="mr-3"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(selectedApt.altDate3).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}{" "}
                        at {selectedApt.altTime3}
                      </p>
                      <p className="text-xs text-gray-600 capitalize">
                        {selectedApt.altShift3} shift
                      </p>
                    </div>
                  </label>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> After approval, please contact the
                  patient at <strong>{selectedApt?.patientId?.phoneNo}</strong>{" "}
                  to confirm the new appointment time.
                </p>
              </div>
            </div>
          )}

          {modalType === "rejectRequest" && selectedApt && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to reject this reschedule request from{" "}
                <strong>{selectedApt.doctorId?.fullName}</strong>?
              </p>
              <textarea
                placeholder="Reason for rejection (optional)"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AppointmentRescheduleRequests;
