import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  Check,
  Eye,
  X,
  User,
  BadgeCheck,
  XCircle,
  ArrowLeft,
  MessageSquareText,
  Stethoscope,
} from "lucide-react";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import axios from "axios";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import type { TableColumn } from "../../components/table/DataTable";
import DataTable from "../../components/table/DataTable";
import TableFilters from "../../components/filter/TableFilters";
import { useSocket } from "../../hooks/useSocket";
import { useSocketEvent } from "../../hooks/useSocketEvent";
import StatsCard from "../../components/StatsCard";
import type { IStateData } from "../../features";
import type { AppointmentData } from "../../api";
import { getShiftColor, getStatusColor } from "../../helpers";

const DoctorAppointments = () => {
  const doctor = useSelector((state: IStateData) => state.auth.user);
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, openModal, closeModal } = useModal();

  const [modalType, setModalType] = useState("");
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [selectedApt, setSelectedApt] = useState<AppointmentData>();
  const [searchTerm, setSearchTerm] = useState(location.state?.aptId || "");
  const [statusFilter, setStatusFilter] = useState<string>(
    location.state?.status || "All",
  );
  const [dateFilter, setDateFilter] = useState(location.state?.date || "");
  const [loading, setLoading] = useState<boolean>(false);

  const baseurl = import.meta.env.VITE_BASE_URL;

  // ── Reschedule form state ─────────────────────────────────────────────────
  const [resFormData, setResFormData] = useState({
    rescheduleReason: "",
    addDetails: "",
    altDate1: "",
    altShift1: "",
    altTime1: "",
    altDate2: "",
    altShift2: "",
    altTime2: "",
    altDate3: "",
    altShift3: "",
    altTime3: "",
  });

  const handleResInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setResFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchDoctorAppointments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseurl}/api/appointment/fetch/doctor-appointments/${doctor.id}`,
      );
      if (response.data.success) {
        setAppointments(response.data.docApts);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching appointments:", error.message);
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useSocket(doctor);
  useSocketEvent("appointmentConfirmed", (data: any) => {
    setAppointments((prev) => {
      const updated = [data.appointment, ...prev];
      return updated.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    });
    toast.success("New appointment confirmed! See details.");
  });

  useEffect(() => {
    if (doctor?.id) {
      fetchDoctorAppointments();
    }
  }, [doctor?.id]);

  // ── Reschedule ────────────────────────────────────────────────────────────
  const handleDocAptRes = async (
    id: string | undefined,
    doctorId: string | undefined,
  ) => {
    try {
      const suggestedSlots = [
        {
          date: resFormData.altDate1,
          shift: resFormData.altShift1,
          time: resFormData.altTime1,
        },
        {
          date: resFormData.altDate2,
          shift: resFormData.altShift2,
          time: resFormData.altTime2,
        },
        {
          date: resFormData.altDate3,
          shift: resFormData.altShift3,
          time: resFormData.altTime3,
        },
      ].filter((slot) => slot.date && slot.shift && slot.time);

      const response = await axios.put(
        `${baseurl}/api/appointment/request-reschedule`,
        {
          id,
          newStatus: "Reschedule Requested",
          rescheduleRequestedBy: doctorId,
          rescheduleReason: resFormData.rescheduleReason,
          addDetails: resFormData.addDetails,
          suggestedSlots,
        },
      );
      if (response.data.success) {
        toast.success(response.data.message);
        closeModal();
        fetchDoctorAppointments();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error((error as any)?.response?.data?.message || error.message);
      }
    }
  };

  // ── Start consultation — set start time then navigate ────────────────────
  const handleStartConsultation = async (apt: AppointmentData) => {
    try {
      await axios.put(
        `${baseurl}/api/appointment/set-start-time`,
        { aptId: apt._id },
        {
          headers: {
            "auth-token": localStorage.getItem("authToken") || doctor?.token,
          },
        },
      );
    } catch (error) {
      // non-blocking — proceed even if start time call fails
      console.warn("Could not set start time:", error);
    }
    closeModal();
    navigate("/doctor/consultation", { state: { appointment: apt } });
  };

  // ── Filters ───────────────────────────────────────────────────────────────
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.id_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof apt.patientId !== "string" &&
        apt.patientId?.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (typeof apt.patientId !== "string" &&
        apt.patientId?.id_no?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "All" || apt.status === statusFilter;
    const matchesDate = !dateFilter || apt.aptDate === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = [
    {
      label: "Total",
      value: appointments.length,
      icon: Calendar,
      color: "blue",
    },
    {
      label: "Pending",
      value: appointments.filter((a) => a.status === "Pending").length,
      icon: Clock,
      color: "yellow",
    },
    {
      label: "Confirmed",
      value: appointments.filter((a) => a.status === "Confirmed").length,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "Completed",
      value: appointments.filter((a) => a.status === "Completed").length,
      icon: Check,
      color: "blue",
    },
    {
      label: "Cancelled",
      value: appointments.filter((a) => a.status === "Cancelled").length,
      icon: XCircle,
      color: "purple",
    },
  ];

  // ── Table columns ─────────────────────────────────────────────────────────
  const flattenedData = filteredAppointments.map((apt) => ({
    ...apt,
    parentTest: apt,
  }));

  const columns: TableColumn[] = [
    {
      key: "patientName",
      label: "Patient",
      render: (_, row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-purple-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {row.parentTest.patientId?.fullName}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "time&date",
      label: "Time & Date",
      render: (_, row) => (
        <div className="space-y-1">
          <span className="text-sm text-gray-900">
            {row.parentTest.appointmentTime}{" "}
            {new Date(row.parentTest.aptDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      ),
    },
    {
      key: "shift",
      label: "Shift",
      render: (_, row) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getShiftColor(row.parentTest.shift)}`}
        >
          {row.parentTest.shift}
        </span>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (_, row) => (
        <span className="text-sm text-gray-600 line-clamp-2">
          {row.parentTest.reasonForVisit.slice(0, 20) +
            (row.parentTest.reasonForVisit.length > 20 ? "..." : "")}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) => (
        <span
          className={`px-3 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(row.parentTest.status)}`}
        >
          {row.parentTest.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <button
          onClick={() => {
            openModal();
            setModalType("viewDetail");
            setSelectedApt(row.parentTest);
          }}
          className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium text-sm"
          title="View Details"
        >
          <Eye className="h-5 w-5" />
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 p-3">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                My Appointments
              </h1>

              <p className="text-gray-600 text-sm mt-1">
                Manage and track your patient appointments
              </p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Dr. {doctor?.fullName}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
          {stats.map((item, index) => (
            <StatsCard
              key={index}
              index={index}
              label={item.label}
              value={item.value}
              color={item.color}
              icon={item.icon}
            />
          ))}
        </div>

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
                { label: "Confirmed", value: "Confirmed" },
                { label: "Completed", value: "Completed" },
                { label: "Cancelled", value: "Cancelled" },
                {
                  label: "Reschedule Requested",
                  value: "Reschedule Requested",
                },
                { label: "Rescheduled", value: "Rescheduled" },
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

        <div className="mb-2">
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

        <DataTable
          columns={columns}
          data={flattenedData}
          loading={loading}
          emptyStateIcon={Calendar}
          emptyStateTitle="No appointment found"
          emptyStateDescription={
            searchTerm || statusFilter !== "All" || dateFilter
              ? "Try adjusting your filters"
              : "No appointment today"
          }
        />

        {/* ── Modal ── */}
        <Modal
          isOpen={isOpen}
          title={
            modalType === "viewDetail"
              ? "Appointment Details"
              : modalType === "reqRes"
                ? "Request Reschedule"
                : ""
          }
          onClose={closeModal}
          width="max-w-2/3"
          height="max-h-[450px]"
          cancelIcon={
            modalType === "viewDetail" ? (
              <MessageSquareText className="w-5 h-5 mr-2" />
            ) : (
              <ArrowLeft className="w-5 h-5 mr-2" />
            )
          }
          confirmIcon={
            modalType === "viewDetail" ? (
              <Stethoscope className="w-5 h-5 mr-2" />
            ) : (
              <MessageSquareText className="w-5 h-5 mr-2" />
            )
          }
          confirmText={
            modalType === "viewDetail"
              ? selectedApt?.status === "Completed"
                ? ""
                : "Start Consultation"
              : "Confirm Request"
          }
          cancelText={
            modalType === "viewDetail" ? "Request Reschedule" : "Back"
          }
          onConfirm={
            modalType === "viewDetail"
              ? () => selectedApt && handleStartConsultation(selectedApt)
              : modalType === "reqRes"
                ? () =>
                    handleDocAptRes(
                      selectedApt?._id,
                      typeof selectedApt?.doctorId !== "string"
                        ? selectedApt?.doctorId._id
                        : "",
                    )
                : () => ""
          }
          onCancel={
            selectedApt?.status === "Completed"
              ? () => ""
              : modalType === "viewDetail"
                ? () => setModalType("reqRes")
                : () => setModalType("viewDetail")
          }
        >
          {/* ── View Detail ── */}
          {modalType === "viewDetail" && selectedApt && (
            <div className="space-y-2">
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
                      {selectedApt.confirmedAt &&
                        new Date(selectedApt.confirmedAt).toLocaleString(
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

              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Appointment Schedule
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  {[
                    {
                      icon: <Calendar className="h-5 w-5 text-blue-600" />,
                      bg: "bg-blue-100",
                      label: "Date",
                      value: selectedApt.aptDate
                        ? new Date(selectedApt.aptDate).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short", day: "numeric" },
                          )
                        : "N/A",
                    },
                    {
                      icon: <Clock className="h-5 w-5 text-green-600" />,
                      bg: "bg-green-100",
                      label: "Time",
                      value: selectedApt.appointmentTime || "N/A",
                    },
                    {
                      icon: <Clock className="h-5 w-5 text-purple-600" />,
                      bg: "bg-purple-100",
                      label: "Shift",
                      value: selectedApt.shift || "N/A",
                      capitalize: true,
                    },
                    {
                      icon: <BadgeCheck className="h-5 w-5" />,
                      bg: getStatusColor(selectedApt.status),
                      label: "Status",
                      value: selectedApt.status || "N/A",
                      capitalize: true,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-white rounded-lg p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${item.bg} p-2 rounded-lg`}>
                          {item.icon}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600">
                            {item.label}
                          </label>
                          <p
                            className={`text-sm text-gray-900 font-medium ${item.capitalize ? "capitalize" : ""}`}
                          >
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Patient Information
                  </h4>
                  {[
                    {
                      label: "Patient Name",
                      value:
                        typeof selectedApt.patientId !== "string"
                          ? selectedApt.patientId?.fullName
                          : "N/A",
                    },
                    {
                      label: "Contact Number",
                      value:
                        typeof selectedApt.patientId !== "string"
                          ? selectedApt.patientId?.phoneNo
                          : "N/A",
                    },
                    {
                      label: "Patient ID",
                      value:
                        typeof selectedApt.patientId !== "string"
                          ? selectedApt.patientId?.id_no
                          : "N/A",
                      mono: true,
                    },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {f.label}
                      </label>
                      <p
                        className={`text-base text-gray-900 ${f.mono ? "font-mono" : "font-medium"}`}
                      >
                        {f.value || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Appointment Information
                  </h4>
                  {[
                    {
                      label: "Doctor Name",
                      value:
                        typeof selectedApt.doctorId !== "string"
                          ? selectedApt.doctorId?.fullName
                          : "N/A",
                    },
                    {
                      label: "Doctor ID",
                      value:
                        typeof selectedApt.doctorId !== "string"
                          ? selectedApt.doctorId?.id_no
                          : "N/A",
                    },
                    {
                      label: "Department",
                      value: selectedApt.departmentId?.name || "N/A",
                    },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {f.label}
                      </label>
                      <p className="text-base text-gray-900">{f.value}</p>
                    </div>
                  ))}
                  {selectedApt?.specialistId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Specialist
                      </label>
                      <p className="text-base text-gray-900">
                        {selectedApt.specialistId?.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Reason for Visit
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-900 leading-relaxed">
                    {selectedApt?.reasonForVisit || "No reason provided"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Request Reschedule ── */}
          {modalType === "reqRes" && selectedApt && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Current Appointment Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    {
                      label: "Patient:",
                      value:
                        typeof selectedApt.patientId !== "string"
                          ? selectedApt.patientId?.fullName
                          : "",
                    },
                    {
                      label: "Date:",
                      value: new Date(selectedApt.aptDate).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "short", day: "numeric" },
                      ),
                    },
                    {
                      label: "Shift:",
                      value: selectedApt.shift,
                      capitalize: true,
                    },
                    {
                      label: "Time:",
                      value: selectedApt.appointmentTime,
                    },
                  ].map((f) => (
                    <div key={f.label}>
                      <span className="text-xs text-blue-700 font-medium">
                        {f.label}
                      </span>
                      <p
                        className={`text-sm font-semibold text-blue-900 ${f.capitalize ? "capitalize" : ""}`}
                      >
                        {f.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <form className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for Reschedule Request{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="rescheduleReason"
                    onChange={handleResInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="Personal Emergency">
                      Personal Emergency
                    </option>
                    <option value="Medical Emergency">Medical Emergency</option>
                    <option value="Surgery Scheduled">Surgery Scheduled</option>
                    <option value="Conference/Seminar">
                      Conference/Seminar
                    </option>
                    <option value="Family Emergency">Family Emergency</option>
                    <option value="Illness">Illness</option>
                    <option value="Double Booking">Double Booking</option>
                    <option value="Travel">Travel</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="addDetails"
                    onChange={handleResInputChange}
                    rows={4}
                    placeholder="Please provide more details about why you need to reschedule..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-1">
                    Suggest Alternative Dates (Optional)
                  </h5>
                  <p className="text-xs text-gray-600 mb-3">
                    Provide up to 3 alternative dates that work for you
                  </p>
                  <div className="space-y-3">
                    {([1, 2, 3] as const).map((n) => (
                      <div
                        key={n}
                        className="grid grid-cols-1 md:grid-cols-3 gap-3"
                      >
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Date Option {n}
                          </label>
                          <input
                            type="date"
                            name={`altDate${n}`}
                            onChange={handleResInputChange}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Shift
                          </label>
                          <select
                            name={`altShift${n}`}
                            onChange={handleResInputChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500"
                          >
                            <option value="">Select</option>
                            <option value="morning">Morning</option>
                            <option value="evening">Evening</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Time
                          </label>
                          <select
                            name={`altTime${n}`}
                            onChange={handleResInputChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500"
                          >
                            <option value="">Select</option>
                            {resFormData[
                              `altShift${n}` as keyof typeof resFormData
                            ] === "morning"
                              ? [
                                  "09:00 AM",
                                  "09:30 AM",
                                  "10:00 AM",
                                  "10:30 AM",
                                  "11:00 AM",
                                  "11:30 AM",
                                  "12:00 PM",
                                ].map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))
                              : resFormData[
                                    `altShift${n}` as keyof typeof resFormData
                                  ] === "evening"
                                ? [
                                    "04:00 PM",
                                    "04:30 PM",
                                    "05:00 PM",
                                    "05:30 PM",
                                    "06:00 PM",
                                    "06:30 PM",
                                    "07:00 PM",
                                  ].map((t) => (
                                    <option key={t} value={t}>
                                      {t}
                                    </option>
                                  ))
                                : null}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-500 rounded-full p-1 mt-0.5">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-amber-900 mb-1">
                        Important Notice
                      </h4>
                      <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                        <li>
                          The receptionist will review your request and contact
                          the patient
                        </li>
                        <li>
                          Patient must approve the reschedule before it's
                          confirmed
                        </li>
                        <li>
                          You'll be notified once the request is processed
                        </li>
                        <li>
                          Try to provide multiple alternative dates for
                          flexibility
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default DoctorAppointments;
