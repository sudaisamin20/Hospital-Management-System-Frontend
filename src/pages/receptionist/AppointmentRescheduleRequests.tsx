import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Check,
  X,
  Ban,
} from "lucide-react";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import axios from "axios";
import { useSelector } from "react-redux";
import { useSocket, useSocketEvent } from "../../hooks";
import { rejectRescheduleRequestAptApi } from "../../api";
import { TableFilters } from "../../components/filter";
import { DataTable } from "../../components";
import type { TableColumn } from "../../components/table/DataTable";

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
  rescheduleRequestedAt: string;
  rescheduleStatus: string;
  suggestedSlots: [
    {
      date: string;
      shift: string;
      time: string;
    },
  ];
  createdAt: string;
  updatedAt: string;
}

interface ISlot {
  date: string;
  shift: string;
  time: string;
}

interface ISocketData {
  appointment: IAppointment;
}

export interface ISelectorUser {
  auth: {
    user: {
      id: string;
      id_no: string;
      fullName: string;
      email: string;
      role: string;
      token: string;
      departmentId?: string;
    };
  };
}

export interface IRoleUserData {
  id: string;
  id_no: string;
  fullName: string;
  email: string;
  role: string;
  token: string;
  departmentId?: string;
}

const AppointmentRescheduleRequests = () => {
  const { isOpen, openModal, closeModal } = useModal();
  const receptionist: IRoleUserData = useSelector(
    (state: ISelectorUser) => state.auth.user,
  );
  const [modalType, setModalType] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [selectedApt, setSelectedApt] = useState<IAppointment>();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedSlot, setSelectedSlot] = useState<ISlot>();
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [resInputData, setResInputData] = useState({
    altDate1: "",
    altTime1: "",
    altShift1: "",
  });
  //   const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const baseurl = import.meta.env.VITE_BASE_URL;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
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
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useSocket(receptionist);
  useSocketEvent("resReqApt", (data: ISocketData) => {
    if (data.appointment) {
      setAppointments((prev) => {
        const updated = [data.appointment, ...prev];
        return updated.sort(
          (a, b) =>
            new Date(b.rescheduleRequestedAt).getTime() -
            new Date(a.rescheduleRequestedAt).getTime(),
        );
      });
      toast.success(
        `New request for rescheduling appointment is arrived! Appointment ID is ${data.appointment.id_no}. See details for rescheduling.`,
        {
          duration: 4000,
        },
      );
    }
  });

  useEffect(() => {
    if (receptionist?.id) {
      const fetchResReqData = async () => {
        await fetchRescheduleRequests();
      };
      fetchResReqData();
    }
  }, [receptionist?.id]);

  const handleApproveRequest = async (
    aptId: string | undefined,
    date: string | undefined,
    shift: string | undefined,
    time: string | undefined,
  ) => {
    try {
      const response = await axios.put(
        `${baseurl}/api/appointment/approve-reschedule`,
        {
          aptId: aptId,
          date: date || resInputData.altDate1,
          shift: shift || resInputData.altShift1,
          time: time || resInputData.altTime1,
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
    aptId: string | undefined,
    status: string | undefined,
  ) => {
    try {
      const response = await rejectRescheduleRequestAptApi(aptId, status);
      if (response.data.success) {
        toast.success(response.data.message);
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

  const handleCloseModal = () => {
    setSelectedSlotIndex(null);
    closeModal();
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setResInputData((prev) => ({ ...prev, [name]: value }));
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

    const matchesStatus =
      statusFilter === "All" || apt.rescheduleStatus === statusFilter;
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
  console.log(appointments);
  const flattenedData = filteredAppointments.map((apt) => ({
    ...apt,
    parentTest: apt,
  }));

  const columns: TableColumn[] = [
    {
      key: "doctor",
      label: "Doctor",
      render: (_, row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center flex-shrink-0">
            {row?.parentTest?.doctorId?.photo ? (
              <img
                src={`${baseurl}/images/uploads/${row?.parentTest?.doctorId?.photo}`}
                alt={row?.parentTest?.doctorId?.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-blue-600 font-semibold text-sm">
                {row?.parentTest.doctorId?.fullName
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </span>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              Dr. {row?.parentTest?.doctorId?.fullName}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "requestedAt",
      label: "Requested At",
      render: (_, row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900">
              {new Date(
                row?.parentTest?.rescheduleRequestedAt,
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
              {new Date(
                row?.parentTest?.rescheduleRequestedAt,
              ).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "rescheduleReason",
      label: "Reschedule Reason",
      render: (_, row) => (
        <span className="text-sm text-gray-900 line-clamp-2">
          {row?.parentTest.rescheduleReason}
        </span>
      ),
    },
    {
      key: "rescheduleStatus",
      label: "Reschedule Status",
      render: (_, row) => (
        <span
          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(row?.parentTest?.rescheduleStatus)}`}
        >
          {row?.parentTest?.rescheduleStatus}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              openModal();
              setModalType("viewRequest");
              setSelectedApt(row?.parentTest);
            }}
            className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium text-sm"
            title="View Details"
          >
            <Eye className="h-5 w-5" />
          </button>
          {row?.parentTest.status === "Pending" && (
            <div>
              <button
                onClick={() => {
                  openModal();
                  setModalType("approveRequest");
                  setSelectedApt(row?.parentTest);
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
                  setSelectedApt(row?.parentTest?.appointment);
                }}
                className="text-red-600 cursor-pointer hover:text-red-800 font-medium text-sm"
                title="Reject"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 w-full p-3">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="p-3 mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Reschedule Requests
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              Manage appointment reschedule requests from doctors
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {item.label}
                  </p>
                  <p
                    className={`text-lg font-bold text-${item.color}-600 mt-1`}
                  >
                    {item.count}
                  </p>
                </div>
                <div className={`bg-${item.color}-100 p-2 rounded-full`}>
                  <Icon className={`h-5 w-5 text-${item.color}-600`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <TableFilters
          searchPlaceholder="Search by appointment ID or patient ID, name..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={[
            {
              id: "status",
              label: "Status",
              type: "select",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: "All", value: "All" },
                { label: "Pending", value: "Pending" },
                { label: "Approved", value: "Approved" },
                { label: "Rejected", value: "Rejected" },
              ],
            },
            {
              id: "date",
              label: "Date",
              type: "date",
              value: dateFilter,
              onChange: setDateFilter,
            },
          ]}
          onClearAll={() => {
            setSearchTerm("");
            setStatusFilter("All");
            setDateFilter("");
          }}
        />

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

        <DataTable
          columns={columns}
          data={flattenedData}
          loading={loading}
          emptyStateIcon={Calendar}
          emptyStateTitle="No request for rescheduling appointment founded!"
          emptyStateDescription={
            searchTerm || statusFilter !== "All" || dateFilter
              ? "Try adjusting your filters"
              : "No request today"
          }
        />

        {/* Modal */}
        <Modal
          isOpen={isOpen}
          title={
            modalType === "viewRequest" ? "Reschedule Request Details" : ""
          }
          onClose={handleCloseModal}
          width="max-w-2/3"
          height="max-h-[450px]"
          onConfirm={
            modalType === "viewRequest"
              ? () =>
                  handleApproveRequest(
                    selectedApt?._id,
                    selectedSlot?.date,
                    selectedSlot?.shift,
                    selectedSlot?.time,
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
              ? () => handleRejectRequest(selectedApt?._id, "Rejected")
              : () => ""
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
            <div className="space-y-3">
              {/* Request Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Current Appointment (To Be Rescheduled)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {selectedApt.rescheduleReason}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedApt.addDetails}
                  </p>
                </div>
              </div>

              {/* Alternative Dates */}
              {selectedApt.suggestedSlots.length > 0 ? (
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
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
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
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="altDate1"
                      onChange={handleInputChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Shift <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="altShift1"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="morning">Morning</option>
                      <option value="evening">Evening</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="altTime1"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      {resInputData.altShift1 &&
                      resInputData.altShift1 === "morning" ? (
                        <>
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="09:30 AM">09:30 AM</option>
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="10:30 AM">10:30 AM</option>
                          <option value="11:00 AM">11:00 AM</option>
                          <option value="11:30 AM">11:30 AM</option>
                          <option value="12:00 PM">12:00 PM</option>
                        </>
                      ) : resInputData.altShift1 &&
                        resInputData.altShift1 === "evening" ? (
                        <>
                          <option value="04:00 PM">04:00 PM</option>
                          <option value="04:30 PM">04:30 PM</option>
                          <option value="05:00 PM">05:00 PM</option>
                          <option value="05:30 PM">05:30 PM</option>
                          <option value="06:00 PM">06:00 PM</option>
                          <option value="06:30 PM">06:30 PM</option>
                          <option value="07:00 PM">07:00 PM</option>
                        </>
                      ) : (
                        ""
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
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
                  <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-500 has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
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
                  <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-500 has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
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
                  <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-500 has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
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
