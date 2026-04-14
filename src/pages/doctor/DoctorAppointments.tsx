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
  Plus,
  AlertCircle,
  Trash2,
  Save,
} from "lucide-react";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import axios from "axios";
import { useSelector } from "react-redux";
import AsyncSelect from "react-select/async";
import { useLocation } from "react-router-dom";
import type { TableColumn } from "../../components/table/DataTable";
import DataTable from "../../components/table/DataTable";
import TableFilters from "../../components/filter/TableFilters";
import { useSocket } from "../../hooks/useSocket";
import { useSocketEvent } from "../../hooks/useSocketEvent";
import StatsCard from "../../components/StatsCard";
import type { IStateData, User as IUser } from "../../features";
import type { AppointmentData } from "../../api";

const DoctorAppointments = () => {
  const doctor: IUser = useSelector((state: IStateData) => state.auth.user);
  const location = useLocation();
  const { isOpen, openModal, closeModal } = useModal();
  const [modalType, setModalType] = useState("");
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [selectedApt, setSelectedApt] = useState<AppointmentData>();
  const [searchTerm, setSearchTerm] = useState(location.state?.aptId || "");
  const [statusFilter, setStatusFilter] = useState<string>(
    location.state?.status || "All",
  );
  const [dateFilter, setDateFilter] = useState(location.state?.date || "");
  const baseurl = import.meta.env.VITE_BASE_URL;
  const [loading, setLoading] = useState<boolean>(false);
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
  const [consultationData, setConsultationData] = useState({
    vitals: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      weight: "",
      height: "",
    },
    symptoms: "",
    diagnosis: "",
    medicines: [
      {
        id: 1,
        medicineName: "",
        dosage: "",
        frequency: "",
        duration: "",
        timing: "",
        instructions: "",
      },
    ],
    labTests: [{ id: 1, testName: "" }],
    followUp: {
      duration: "",
      notes: "",
    },
    additionalNotes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setResFormData((prev) => ({ ...prev, [name]: value }));
    if (name.includes(".")) {
      const [parent, child] = name.split(".");

      setConsultationData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setConsultationData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
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
      case "Reshceduled":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift?.toLowerCase()) {
      case "morning":
        return "bg-orange-100 text-orange-800";
      case "evening":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
      const fetchData = async () => {
        await fetchDoctorAppointments();
      };
      fetchData();
    }
  }, [doctor?.id]);

  const loadMedicineOptions = async (inputValue: string) => {
    if (!inputValue) return [];
    const res = await axios.get(
      `${baseurl}/api/prescription/search?query=${inputValue}`,
    );
    return res.data.medicines.map((med: any) => ({
      value: med._id,
      label: med.name,
      tabletStrengthMg: med.tabletStrengthMg,
      price: med.price,
    }));
  };

  const loadLabTestOptions = async (inputValue: string) => {
    if (!inputValue) return [];
    const res = await axios.get(
      `${baseurl}/api/lab/search?query=${inputValue}`,
    );
    return res.data.labTests.map((test: any) => ({
      value: test._id,
      label: test.name,
      description: test?.description,
      departmentId: test?.departmentId,
      price: test.price,
    }));
  };

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
      ];
      const filteredSlots = suggestedSlots.filter(
        (slot) => slot.date && slot.shift && slot.time,
      );
      const response = await axios.put(
        `${baseurl}/api/appointment/request-reschedule`,
        {
          id,
          newStatus: "Reschedule Requested",
          rescheduleRequestedBy: doctorId,
          rescheduleReason: resFormData.rescheduleReason,
          addDetails: resFormData.addDetails,
          suggestedSlots: filteredSlots,
        },
      );
      if (response.data.success) {
        toast.success(response.data.message);
        closeModal();
        fetchDoctorAppointments();
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

  const handleCloseModal = () => {
    setConsultationData({
      vitals: {
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        weight: "",
        height: "",
      },
      symptoms: "",
      diagnosis: "",
      medicines: [
        {
          id: 1,
          medicineName: "",
          dosage: "",
          frequency: "",
          duration: "",
          timing: "",
          instructions: "",
        },
      ],
      labTests: [{ id: 1, testName: "" }],
      followUp: {
        duration: "",
        notes: "",
      },
      additionalNotes: "",
    });
    closeModal();
  };

  // Filter appointments
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

  const handlePrescriptionChange = (
    id: number,
    field: string,
    value: string,
  ) => {
    setConsultationData((prev) => ({
      ...prev,
      medicines: prev.medicines.map((med) =>
        med.id === id ? { ...med, [field]: value } : med,
      ),
    }));
  };

  const handleAddPrescription = () => {
    setConsultationData((prev) => {
      const newId = prev.medicines.length
        ? Math.max(...prev.medicines.map((m) => m.id)) + 1
        : 1;
      return {
        ...prev,
        medicines: [
          ...prev.medicines,
          {
            id: newId,
            medicineName: "",
            dosage: "",
            frequency: "",
            duration: "",
            timing: "",
            instructions: "",
          },
        ],
      };
    });
  };

  const handleRemovePrescription = (id: number) => {
    setConsultationData((prev) => {
      if (prev.medicines.length > 1) {
        return {
          ...prev,
          medicines: prev.medicines.filter((med) => med.id !== id),
        };
      } else {
        toast.error("At least one prescription is required");
        return prev;
      }
    });
  };

  const handleLabTestChange = (id: number, value: string) => {
    setConsultationData((prev) => ({
      ...prev,
      labTests: prev.labTests.map((test) =>
        test.id === id ? { ...test, testName: value } : test,
      ),
    }));
  };

  const handleAddLabTest = () => {
    setConsultationData((prev) => {
      const newId = prev.labTests.length
        ? Math.max(...prev.labTests.map((t) => t.id)) + 1
        : 1;
      return {
        ...prev,
        labTests: [...prev.labTests, { id: newId, testName: "" }],
      };
    });
  };

  const handleRemoveLabTest = (id: number) => {
    setConsultationData((prev) => {
      if (prev.labTests.length > 1) {
        return {
          ...prev,
          labTests: prev.labTests.filter((test) => test.id !== id),
        };
      } else {
        toast.error("At least one lab test is required");
        return prev;
      }
    });
  };
  const handleSaveConsultation = async (
    aptId: string | undefined,
    patientId: string | undefined,
    doctorId: string | undefined,
  ) => {
    try {
      const filteredLabTest = consultationData.labTests.filter((test) =>
        test.testName.trim(),
      );
      const dataToSend = {
        ...consultationData,
        labTests: filteredLabTest,
      };
      const response = await axios.post(
        `${baseurl}/api/consultation/create-consultation`,
        {
          aptId,
          patientId,
          doctorId,
          consultationData: dataToSend,
        },
      );
      if (response.data.success) {
        console.log(response.data.message);
        toast.success(response.data.message || "Appointment Completed");
        closeModal();
        handleCloseModal();
        fetchDoctorAppointments();
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

  const handleStartedAptTime = async (aptId: string | undefined) => {
    try {
      const response = await axios.put(
        `${baseurl}/api/appointment/set-start-time`,
        { aptId },
        {
          headers: {
            "auth-token": localStorage.getItem("authToken") || doctor?.token,
          },
        },
      );
      if (response.data?.success) {
        toast.success(response.data?.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          "Error during registration:",
          error.response.data.message,
        );
        toast.error(error?.response.data.message);
      } else {
        console.error("Unexpected error during registration:", error);
      }
    }
  };

  // Statistics
  const stats = [
    {
      label: "Total",
      value: appointments.length,
      icon: Calendar,
      color: "blue",
    },
    {
      label: "Pending",
      value: appointments.filter((apt) => apt.status === "Pending").length,
      icon: Clock,
      color: "yellow",
    },
    {
      label: "Confirmed",
      value: appointments.filter((apt) => apt.status === "Confirmed").length,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "Completed",
      value: appointments.filter((apt) => apt.status === "Completed").length,
      icon: Check,
      color: "blue",
    },
    {
      label: "Cancelled",
      value: appointments.filter((apt) => apt.status === "Cancelled").length,
      icon: XCircle,
      color: "purple",
    },
  ];

  const calcAge = (dob: string) => {
    const newDt = new Date();
    const dtoBt = new Date(dob);
    const age = Math.floor(
      (newDt.getTime() - dtoBt.getTime()) / (365 * 24 * 60 * 60 * 1000),
    );
    return age;
  };

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
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-900">
              {row.parentTest.appointmentTime}{" "}
              {new Date(row.parentTest.aptDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
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
          className={`px-3 py-1 text-xs leading-5 font-semibold rounded-full border-0 focus:ring-2 focus:outline-none focus:ring-blue-500 ${getStatusColor(row.parentTest.status)}`}
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
              <h1 className="text-2xl font-semibold text-gray-900">
                My Appointments
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage and track your patient appointments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Dr. {doctor?.fullName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
          {stats.map((item, index) => {
            return (
              <StatsCard
                key={index}
                index={index}
                label={item.label}
                value={item.value}
                color={item.color}
                icon={item.icon}
              />
            );
          })}
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

        {/* Results Count */}
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

        {/* Appointments Table */}
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

        {/* Modal */}
        <Modal
          isOpen={isOpen}
          title={
            modalType === "viewDetail"
              ? "Appointment Details"
              : modalType === "reqRes"
                ? "Request Reschedule"
                : modalType === "startCons"
                  ? "Start Consultation"
                  : ""
          }
          onClose={modalType === "startCons" ? handleCloseModal : closeModal}
          width="max-w-2/3"
          height="max-h-[450px]"
          cancelIcon={
            modalType === "viewDetail" ? (
              <Calendar className="w-5 h-5 mr-2" />
            ) : modalType === "reqRes" || modalType === "startCons" ? (
              <ArrowLeft className="w-5 h-5 mr-2" />
            ) : (
              <X className="w-5 h-5 mr-2" />
            )
          }
          onConfirm={
            modalType === "viewDetail"
              ? () => {
                  handleStartedAptTime(selectedApt?._id);
                  setModalType("startCons");
                }
              : modalType === "reqRes"
                ? () =>
                    handleDocAptRes(
                      selectedApt?._id,
                      typeof selectedApt?.doctorId !== "string"
                        ? selectedApt?.doctorId._id
                        : "",
                    )
                : modalType === "startCons"
                  ? () =>
                      handleSaveConsultation(
                        selectedApt?._id,
                        typeof selectedApt?.patientId !== "string"
                          ? selectedApt?.patientId?._id
                          : "",
                        typeof selectedApt?.doctorId !== "string"
                          ? selectedApt?.doctorId?._id
                          : "",
                      )
                  : () => ""
          }
          onCancel={
            selectedApt?.status === "Completed"
              ? () => ""
              : modalType === "viewDetail"
                ? () => setModalType("reqRes")
                : modalType === "reqRes"
                  ? () => setModalType("viewDetail")
                  : modalType === "startCons"
                    ? () => {
                        setModalType("viewDetail");
                      }
                    : closeModal
          }
          confirmText={
            modalType === "viewDetail"
              ? "Start Consultation"
              : modalType === "reqRes"
                ? "Confirm Request"
                : modalType === "startCons"
                  ? "Save Consultation"
                  : ""
          }
          cancelText={
            modalType === "viewDetail"
              ? "Request Reschedule"
              : modalType === "reqRes" || modalType === "startCons"
                ? "Back"
                : "Cancel"
          }
          confirmIcon={
            modalType === "viewDetail" || modalType === "reqRes" ? (
              <MessageSquareText className="w-5 h-5 mr-2" />
            ) : modalType === "startCons" ? (
              <Save className="w-5 h-5 mr-2" />
            ) : (
              ""
            )
          }
          onBtn1={() => ""}
          btn1Color=""
          btn1Icon=""
          btn1Text=""
        >
          {modalType === "viewDetail" && selectedApt && (
            <div className="space-y-2">
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
                      {selectedApt.confirmedAt &&
                        new Date(selectedApt?.confirmedAt).toLocaleString(
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

              {/* Appointment Schedule */}
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Appointment Schedule
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600">
                          Date
                        </label>
                        <p className="text-sm text-gray-900 font-medium">
                          {selectedApt.aptDate
                            ? new Date(selectedApt.aptDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : "N/A"}
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
                        <label className="block text-xs font-medium text-gray-600">
                          Time
                        </label>
                        <p className="text-sm text-gray-900 font-medium">
                          {selectedApt.appointmentTime || "N/A"}
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
                        <label className="block text-xs font-medium text-gray-600">
                          Shift
                        </label>
                        <p className="text-sm text-gray-900 font-medium capitalize">
                          {selectedApt.shift || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div
                        className={`${getStatusColor(selectedApt.status)} p-2 rounded-lg`}
                      >
                        <BadgeCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600">
                          Status
                        </label>
                        <p className="text-sm text-gray-900 font-medium capitalize">
                          {selectedApt.status || "N/A"}
                        </p>
                      </div>
                    </div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Patient Name
                    </label>
                    <p className="text-base text-gray-900 font-medium">
                      {(typeof selectedApt.patientId !== "string" &&
                        selectedApt.patientId?.fullName) ||
                        "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Contact Number
                    </label>
                    <p className="text-base text-gray-900">
                      {(typeof selectedApt.patientId !== "string" &&
                        selectedApt.patientId?.phoneNo) ||
                        "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Patient ID
                    </label>
                    <p className="text-base text-gray-900 font-mono">
                      {(typeof selectedApt.patientId !== "string" &&
                        selectedApt.patientId?.id_no) ||
                        "N/A"}
                    </p>
                  </div>

                  {typeof selectedApt.patientId !== "string" &&
                    selectedApt.patientId?.email && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Email
                        </label>
                        <p className="text-base text-gray-900">
                          {typeof selectedApt.patientId !== "string" &&
                            selectedApt.patientId.email}
                        </p>
                      </div>
                    )}
                </div>

                {/* Department Information */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Appointment Information
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Doctor Name
                    </label>
                    <p className="text-base font-medium text-gray-900">
                      {(typeof selectedApt.doctorId !== "string" &&
                        selectedApt.doctorId?.fullName) ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Doctor ID
                    </label>
                    <p className="text-base text-gray-900">
                      {(typeof selectedApt.doctorId !== "string" &&
                        selectedApt.doctorId?.id_no) ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Department
                    </label>
                    <p className="text-base text-gray-900">
                      {(typeof selectedApt.doctorId !== "string" &&
                        selectedApt.departmentId?.name) ||
                        "N/A"}
                    </p>
                  </div>

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

              {/* Reason for Visit */}
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
          {modalType === "reqRes" && selectedApt && (
            <div className="space-y-6">
              {/* Current Appointment Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Current Appointment Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <span className="text-xs text-blue-700 font-medium">
                      Patient:
                    </span>
                    <p className="text-sm font-semibold text-blue-900">
                      {typeof selectedApt.patientId !== "string" &&
                        selectedApt.patientId?.fullName}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-blue-700 font-medium">
                      Date:
                    </span>
                    <p className="text-sm font-semibold text-blue-900">
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
                  <div>
                    <span className="text-xs text-blue-700 font-medium">
                      Shift:
                    </span>
                    <p className="text-sm font-semibold text-blue-900 capitalize">
                      {selectedApt.shift}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-blue-700 font-medium">
                      Time:
                    </span>
                    <p className="text-sm font-semibold text-blue-900">
                      {selectedApt.appointmentTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Request Form */}
              <form className="space-y-5">
                {/* Reason for Reschedule Request */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for Reschedule Request{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="rescheduleReason"
                    onChange={handleInputChange}
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

                {/* Additional Details */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="addDetails"
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Please provide more details about why you need to reschedule this appointment..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                {/* Suggested Alternative Dates */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">
                    Suggest Alternative Dates (Optional)
                  </h5>
                  <p className="text-xs text-gray-600 mb-3">
                    Provide up to 3 alternative dates that work for you
                  </p>

                  <div className="space-y-3">
                    {/* Alternative Date 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Date Option 1
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
                          Shift
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
                          Time
                        </label>
                        <select
                          name="altTime1"
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select</option>
                          {resFormData.altShift1 &&
                          resFormData.altShift1 === "morning" ? (
                            <>
                              <option value="09:00 AM">09:00 AM</option>
                              <option value="09:30 AM">09:30 AM</option>
                              <option value="10:00 AM">10:00 AM</option>
                              <option value="10:30 AM">10:30 AM</option>
                              <option value="11:00 AM">11:00 AM</option>
                              <option value="11:30 AM">11:30 AM</option>
                              <option value="12:00 PM">12:00 PM</option>
                            </>
                          ) : resFormData.altShift1 &&
                            resFormData.altShift1 === "evening" ? (
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

                    {/* Alternative Date 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Date Option 2
                        </label>
                        <input
                          type="date"
                          name="altDate2"
                          onChange={handleInputChange}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Shift
                        </label>
                        <select
                          name="altShift2"
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
                          Time
                        </label>
                        <select
                          name="altTime2"
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select</option>
                          {resFormData.altShift2 &&
                          resFormData.altShift2 === "morning" ? (
                            <>
                              <option value="09:00 AM">09:00 AM</option>
                              <option value="09:30 AM">09:30 AM</option>
                              <option value="10:00 AM">10:00 AM</option>
                              <option value="10:30 AM">10:30 AM</option>
                              <option value="11:00 AM">11:00 AM</option>
                              <option value="11:30 AM">11:30 AM</option>
                              <option value="12:00 PM">12:00 PM</option>
                            </>
                          ) : resFormData.altShift2 &&
                            resFormData.altShift2 === "evening" ? (
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

                    {/* Alternative Date 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Date Option 3
                        </label>
                        <input
                          type="date"
                          name="altDate3"
                          onChange={handleInputChange}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Shift
                        </label>
                        <select
                          name="altShift3"
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
                          Time
                        </label>
                        <select
                          name="altTime3"
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select</option>
                          {resFormData.altShift3 &&
                          resFormData.altShift3 === "morning" ? (
                            <>
                              <option value="09:00 AM">09:00 AM</option>
                              <option value="09:30 AM">09:30 AM</option>
                              <option value="10:00 AM">10:00 AM</option>
                              <option value="10:30 AM">10:30 AM</option>
                              <option value="11:00 AM">11:00 AM</option>
                              <option value="11:30 AM">11:30 AM</option>
                              <option value="12:00 PM">12:00 PM</option>
                            </>
                          ) : resFormData.altShift3 &&
                            resFormData.altShift3 === "evening" ? (
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
                  </div>
                </div>

                {/* Urgency Level */}
                {/* <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Urgency Level <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                      <input
                        type="radio"
                        name="urgency"
                        value="low"
                        className="mr-2"
                        required
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          Low
                        </span>
                        <p className="text-xs text-gray-500">Not urgent</p>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-yellow-500 has-[:checked]:border-yellow-500 has-[:checked]:bg-yellow-50">
                      <input
                        type="radio"
                        name="urgency"
                        value="medium"
                        className="mr-2"
                        required
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          Medium
                        </span>
                        <p className="text-xs text-gray-500">Moderate</p>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-red-500 has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
                      <input
                        type="radio"
                        name="urgency"
                        value="high"
                        className="mr-2"
                        required
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          High
                        </span>
                        <p className="text-xs text-gray-500">Urgent</p>
                      </div>
                    </label>
                  </div>
                </div> */}

                {/* Important Notice */}
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
                    <div className="flex-1">
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
          {modalType === "startCons" && selectedApt && (
            <div className="space-y-2">
              {/* Patient Info Header */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">
                      Patient ID:{" "}
                    </span>
                    <span className="text-blue-900 font-semibold">
                      {typeof selectedApt.patientId !== "string" &&
                        selectedApt.patientId?.id_no}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">
                      Patient Name:{" "}
                    </span>
                    <span className="text-blue-900 font-semibold">
                      {typeof selectedApt.patientId !== "string" &&
                        selectedApt.patientId?.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">
                      Age/Gender:{" "}
                    </span>
                    <span className="text-blue-900 capitalize">
                      {calcAge(
                        typeof selectedApt?.patientId !== "string"
                          ? selectedApt.patientId?.dob
                          : "",
                      )}{" "}
                      y/o •{" "}
                      {typeof selectedApt.patientId !== "string" &&
                        selectedApt.patientId?.gender}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Contact: </span>
                    <span className="text-blue-900">
                      {typeof selectedApt.patientId !== "string" &&
                        selectedApt.patientId?.phoneNo}
                    </span>
                  </div>
                </div>
              </div>

              <form className="space-y-2">
                {/* Reason For Visit */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Reason For Visit <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-900 leading-relaxed">
                      {selectedApt.reasonForVisit || "No reason provided"}
                    </p>
                  </div>
                </div>

                {/* Vital Signs */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Vital Signs
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Blood Pressure (mmHg)
                      </label>
                      <input
                        type="text"
                        name="vitals.bloodPressure"
                        onChange={handleInputChange}
                        placeholder="120/80"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Heart Rate (bpm)
                      </label>
                      <input
                        type="number"
                        name="vitals.heartRate"
                        onChange={handleInputChange}
                        placeholder="72"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Temperature (°F)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="vitals.temperature"
                        onChange={handleInputChange}
                        placeholder="98.6"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="vitals.weight"
                        onChange={handleInputChange}
                        placeholder="70"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        name="vitals.height"
                        onChange={handleInputChange}
                        placeholder="170"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Diagnosis */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Diagnosis <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="diagnosis"
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter diagnosis details..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                {/* Symptoms */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Symptoms Observed
                  </label>
                  <textarea
                    name="symptoms"
                    rows={2}
                    onChange={handleInputChange}
                    placeholder="List observed symptoms..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Prescription */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Prescription <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {consultationData.medicines.map((med, index) => (
                      <div
                        key={med.id}
                        className="bg-gray-50 border border-gray-300 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-700">
                            Medicine {index + 1}
                          </h4>
                          {consultationData.medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                handleRemovePrescription(med.id);
                                toast.success(
                                  `${med.medicineName} and details remove!`,
                                );
                              }}
                              className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Medicine Name{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <AsyncSelect
                              cacheOptions
                              loadOptions={loadMedicineOptions}
                              defaultOptions
                              placeholder="Search Medicine e.g: Panadol"
                              onChange={(selected: any) => {
                                handlePrescriptionChange(
                                  med.id,
                                  "medicineId",
                                  selected.value,
                                );
                                handlePrescriptionChange(
                                  med.id,
                                  "medicineName",
                                  selected.label,
                                );
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Dosage <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={med.dosage}
                              onChange={(e) =>
                                handlePrescriptionChange(
                                  med.id,
                                  "dosage",
                                  e.target.value,
                                )
                              }
                              placeholder="e.g., 500mg"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Frequency <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={med.frequency}
                              onChange={(e) =>
                                handlePrescriptionChange(
                                  med.id,
                                  "frequency",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                              required
                            >
                              <option value="">Select</option>
                              <option value="1">Once daily</option>
                              <option value="2">Twice daily</option>
                              <option value="3">Three times daily</option>
                              <option value="4">Four times daily</option>
                              <option value="6">Every 4 hours</option>
                              <option value="4">Every 6 hours</option>
                              <option value="3">Every 8 hours</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Duration <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={med.duration}
                              onChange={(e) =>
                                handlePrescriptionChange(
                                  med.id,
                                  "duration",
                                  e.target.value,
                                )
                              }
                              placeholder="write number of days e.g., 7, 8 etc"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              When to take{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={med.timing}
                              onChange={(e) =>
                                handlePrescriptionChange(
                                  med.id,
                                  "timing",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                              required
                            >
                              <option value="">Select</option>
                              <option value="Before food">Before food</option>
                              <option value="After food">After food</option>
                              <option value="With food">With food</option>
                              <option value="Empty stomach">
                                Empty stomach
                              </option>
                              <option value="Bedtime">Bedtime</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Special Instructions
                            </label>
                            <input
                              type="text"
                              value={med.instructions}
                              onChange={(e) =>
                                handlePrescriptionChange(
                                  med.id,
                                  "instructions",
                                  e.target.value,
                                )
                              }
                              placeholder="Any special notes"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Medicine Button */}
                    <button
                      type="button"
                      onClick={handleAddPrescription}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                      Add Another Medicine
                    </button>
                  </div>
                </div>

                {/* Lab Tests */}
                <div>
                  {/* <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Lab Tests Recommended
                  </label> */}
                  <div className="space-y-2">
                    {/* Common Tests - Quick Select */}
                    {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4"> */}
                    {/* <h4 className="text-xs font-semibold text-blue-900 mb-3 uppercase">
                        Quick Select Common Tests
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {testsArray.map((e) => (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => {
                              const alreadyAdded =
                                consultationData.labTests.find(
                                  (test) => test.testName === e.testName,
                                );

                              if (alreadyAdded) {
                                toast.error(`${e.testName} test already added`);
                                return;
                              }

                              setConsultationData((prev) => ({
                                ...prev,
                                labTests: [
                                  ...prev.labTests,
                                  {
                                    id: prev.labTests.length + 1,
                                    testName: e.testName,
                                  },
                                ],
                              }));
                              toast.success(`${e.testName} added to lab tests`);
                            }}
                            className="px-3 py-2 bg-white border border-blue-300 cursor-pointer rounded-lg text-sm text-blue-700 hover:bg-blue-100 font-medium transition-colors text-left"
                          >
                            + {e.testName}
                          </button>
                        ))}
                      </div>
                    </div> */}

                    {/* Selected/Custom Tests */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-700 uppercase">
                        Selected Lab Tests
                      </h4>
                      {consultationData.labTests.map((test, index) => (
                        <div
                          key={test.id}
                          className="bg-white border border-gray-300 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Test {index + 1}{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <AsyncSelect
                                cacheOptions
                                loadOptions={loadLabTestOptions}
                                defaultOptions
                                placeholder="Search Lab Test e.g: Blood Sugar"
                                className="cursor-pointer"
                                value={
                                  test.testName
                                    ? {
                                        label: test?.testName,
                                        value: test?.testId,
                                      }
                                    : null
                                }
                                onChange={(selected: any) => {
                                  setConsultationData((prev) => ({
                                    ...prev,
                                    labTests: prev.labTests.map((t) =>
                                      t.id === test.id
                                        ? {
                                            ...t,
                                            testId: selected.value,
                                            testName: selected.label,
                                          }
                                        : t,
                                    ),
                                  }));
                                  toast.success(
                                    `${selected.label} added to lab tests`,
                                  );
                                }}
                              />
                            </div>
                            {consultationData.labTests.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleRemoveLabTest(test.id);
                                  toast.success(`${test.testName} removed!`);
                                }}
                                className="mt-6 text-red-600 hover:text-red-800 p-2 cursor-pointer"
                                title="Remove test"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Add Test Button */}
                      <button
                        type="button"
                        onClick={handleAddLabTest}
                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Plus className="h-5 w-5" />
                        Add Custom Test
                      </button>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-800">
                        <strong>Tip:</strong> Use quick select buttons to add
                        common tests quickly, or use "Add Custom Test" to enter
                        specific test names.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Follow-up */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Follow-up Required
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Follow-up After
                      </label>
                      <select
                        name="followUp.duration"
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select</option>
                        <option value="3 days">3 days</option>
                        <option value="1 week">1 week</option>
                        <option value="2 weeks">2 weeks</option>
                        <option value="1 month">1 month</option>
                        <option value="3 months">3 months</option>
                        <option value="6 months">6 months</option>
                        <option value="No follow-up needed">
                          No follow-up needed
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Follow-up Notes
                      </label>
                      <input
                        type="text"
                        onChange={handleInputChange}
                        name="followUp.notes"
                        placeholder="Any specific instructions for follow-up"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Additional Notes / Advice
                  </label>
                  <textarea
                    name="additionalNotes"
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any additional instructions, lifestyle changes, dietary recommendations, precautions, etc."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Important Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-amber-900 mb-1">
                        Important
                      </h4>
                      <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                        <li>
                          Please review all information carefully before saving
                        </li>
                        <li>
                          Prescription will be sent to patient via SMS and email
                        </li>
                        <li>
                          Lab test orders will be forwarded to the lab
                          department
                        </li>
                        <li>
                          Patient can download prescription from their portal
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
