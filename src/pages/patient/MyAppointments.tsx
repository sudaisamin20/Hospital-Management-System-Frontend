import { useEffect, useState } from "react";
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  Check,
  Eye,
  X,
  BadgeCheck,
  Trash,
  XCircle,
  Save,
  ArrowLeft,
  Mail,
  CalendarSync,
  CalendarPlus,
} from "lucide-react";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import axios from "axios";
import { useSelector } from "react-redux";
import { useSocket, useSocketEvent } from "../../hooks";

interface Appointment {
  _id: string;
  doctorId: string;
  departmentId: string;
  specialistId: string;
  shift: string;
  aptDate: string;
  appointmentTime: string;
  status: string;
  reasonForVisit: string;
  patientId: string;
}

const MyAppointments = () => {
  const patient = useSelector((state: any) => state.auth.user);
  const { isOpen, openModal, closeModal } = useModal();
  const [modalType, setModalType] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [departments, setDepartments] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [dept, setDept] = useState("");
  const [aptFormData, setAptFormData] = useState({
    aptDate: "",
    departmentId: "",
    specialistId: "",
    doctorId: "",
    shift: "",
    appointmentTime: "",
    reasonForVisit: "",
    patientId: "",
  });
  const [relatedDoctors, setRelatedDoctors] = useState([]);
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
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "department") {
      setAptFormData({
        ...aptFormData,
        departmentId: value,
        specialistId: "",
        doctorId: "",
      });
      return;
    }
    if (name === "specialist") {
      setAptFormData({
        ...aptFormData,
        specialistId: value,
        doctorId: "",
      });
      return;
    }
    if (modalType === "resAptDt") {
      setAptFormData({
        ...aptFormData,
        aptDate: selectedApt.aptDate || aptFormData.aptDate,
        shift: selectedApt.shift || aptFormData.shift,
        appointmentTime:
          selectedApt.appointmentTime || aptFormData.appointmentTime,
      });
    }
    setAptFormData({
      ...aptFormData,
      [name]: value,
    });
  };
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        `${baseurl}/api/superadmin/fetch/departments`,
      );
      if (response.data.success) {
        setDepartments(response.data.departments);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during registration:", error.message);
        toast.error(error.message);
      } else {
        console.error("Unexpected error during registration:", error);
      }
    }
  };

  const fetchSpecialists = async (departmentId: string) => {
    try {
      const response = await axios.get(
        `${baseurl}/api/superadmin/fetch/specialists/${departmentId}`,
      );
      if (response.data.success) {
        setSpecialists(response.data.specialists);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during registration:", error.message);
        toast.error(error.message);
      } else {
        console.error("Unexpected error during registration:", error);
      }
    }
  };

  const handleAddAppointment = async () => {
    try {
      const finalData = {
        ...aptFormData,
        patientId: patient.id,
      };
      const response = await axios.post(
        `${baseurl}/api/appointment/add-appointment`,
        finalData,
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchPatientAllApts();
        closeModal();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during registration:", error.message);
        toast.error(error.message);
      } else {
        console.error("Unexpected error during registration:", error);
      }
    }
  };

  const fetchRelatedDoctors = async (spec: string) => {
    try {
      const response = await axios.get(
        `${baseurl}/api/patient/fetch/related-doctors/${dept}/${spec}`,
      );
      if (response.data.success) {
        setRelatedDoctors(response.data.doctors);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during registration:", error.message);
        toast.error(error.message);
      } else {
        console.error("Unexpected error during registration:", error);
      }
    }
  };

  const fetchPatientAllApts = async () => {
    try {
      const response = await axios.get(
        `${baseurl}/api/appointment/fetch/patient-all-appointments/${patient.id}`,
      );
      if (response.data.success) {
        setAppointments(response.data.patientApts);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during registration:", error.message);
        toast.error(error.message);
      } else {
        console.error("Unexpected error during registration:", error);
      }
    }
  };

  useSocket(patient);
  useSocketEvent("appointmentConfirmed", (data: any) => {
    setAppointments((prev) => {
      const updated = [data.appointment, ...prev];
      return updated.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    });
    toast.success(
      `Your appointment with ${data.appointment.doctorId.fullName} confirmed on your date ${data.appointment.aptDate} at ${data.appointment.appointmentTime}!.`,
    );
  });

  useEffect(() => {
    if (patient?.id) {
      const fetchPatientAllAptsData = async () => {
        await fetchPatientAllApts();
      };

      fetchPatientAllAptsData();
    }
  }, [patient?.id]);

  useEffect(() => {
    const fetchDepartmentsData = async () => {
      await fetchDepartments();
    };

    fetchDepartmentsData();
  }, []);

  const handleCancelAppointment = async (id: string) => {
    try {
      const response = await axios.put(
        `${baseurl}/api/appointment/cancel-appointment`,
        { id, status: "Cancelled" },
      );
      if (response.data.success) {
        toast.success(response.data.message);
        closeModal();
        fetchPatientAllApts();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during registration:", error.message);
        toast.error(error.message);
      } else {
        console.error("Unexpected error during registration:", error);
      }
    }
  };
  const handleRescheduleApt = async (id: string) => {
    try {
      const response = await axios.put(
        `${baseurl}/api/appointment/reschedule-appointment`,
        {
          id,
          aptDate: aptFormData.aptDate,
          shift: aptFormData.shift,
          appointmentTime: aptFormData.appointmentTime,
        },
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchPatientAllApts();
        closeModal();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during registration:", error.message);
        toast.error(error.message);
      } else {
        console.error("Unexpected error during registration:", error);
      }
    }
  };

  const handleDeleteApt = async (id: string) => {
    try {
      const response = await axios.put(
        `${baseurl}/api/appointment/delete-apt`,
        { id, role: patient?.role, userId: patient?.id },
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchPatientAllApts();
        closeModal();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during registration:", error.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(
          "Unexpected error during registration:",
          error?.response?.data,
        );
      }
    }
  };

  const stats = [
    {
      label: "Total",
      count: appointments.length,
      icon: Calendar,
      color: "blue",
    },
    {
      label: "Pending",
      count: appointments.filter((apt) => apt.status === "Pending").length,
      icon: Clock,
      color: "yellow",
    },
    {
      label: "Confirmed",
      count: appointments.filter((apt) => apt.status === "Confirmed").length,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "Completed",
      count: appointments.filter((apt) => apt.status === "Completed").length,
      icon: Check,
      color: "blue",
    },
    {
      label: "Cancelled",
      count: appointments.filter((apt) => apt.status === "Cancelled").length,
      icon: XCircle,
      color: "red",
    },
    {
      label: "Rescheduled",
      count: appointments.filter((apt) => apt.status === "Rescheduled").length,
      icon: CalendarSync,
      color: "purple",
    },
    {
      label: "Reschedule Requests",
      count: appointments.filter((apt) => apt.status === "Reschedule Requests")
        .length,
      icon: CalendarPlus,
      color: "amber",
    },
  ];

  return (
    <div className="min-h-screen w-full p-3">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="bg-white mb-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Appointments
              </h1>
              <p className="text-gray-600 text-sm mt-2">
                Manage and track your medical appointments
              </p>
            </div>
            <button
              onClick={() => {
                openModal();
                setModalType("addApt");
              }}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              Add Appointment
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 lg:grid-cols-6 gap-3 mb-3">
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

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 shadow-2xl overflow-x-auto">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Reason
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
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Calendar className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">
                          No appointments found
                        </p>
                        <p className="text-gray-400 mt-1">
                          Book your first appointment to get started
                        </p>
                        <button
                          onClick={handleAddAppointment}
                          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          Add Appointment
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  appointments.map((appointment) => (
                    <tr
                      key={appointment._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <img
                              src={`${baseurl}/images/uploads/${appointment.doctorId.photo}`}
                              alt={appointment.doctorId.photo}
                              className="rounded-full h-10 w-10 object-center object-cover"
                            />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {appointment.doctorId.fullName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {appointment.departmentId.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-900">
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
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {appointment.appointmentTime}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {`${appointment.reasonForVisit.slice(0, 20)}${appointment.reasonForVisit.length > 20 ? "..." : ""}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}
                        >
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm cursor-pointer"
                            title="View Details"
                            onClick={() => {
                              openModal();
                              setModalType("viewDetail");
                              setSelectedApt(appointment);
                            }}
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {(appointment.status === "Pending" ||
                            appointment.status === "Confirmed") && (
                            <button
                              onClick={() => {
                                openModal();
                                setModalType("cancelApt");
                                setSelectedApt(appointment);
                              }}
                              className="text-red-600 hover:text-red-800 font-medium text-sm cursor-pointer"
                              title="Cancel Appointment"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                          {appointment.status === "Completed" && (
                            <button
                              onClick={() => {
                                openModal();
                                setModalType("deleteApt");
                                setSelectedApt(appointment);
                              }}
                              className="text-red-600 hover:text-red-800 font-medium text-sm cursor-pointer"
                              title="Cancel Appointment"
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
          title={
            modalType === "addApt"
              ? "Add Appointment"
              : modalType === "viewDetail"
                ? "Appointment Detail"
                : modalType === "cancelApt"
                  ? "Cancel Appointment"
                  : modalType === "resAptDt"
                    ? "Reschedule Appointment"
                    : modalType === "deleteApt"
                      ? "Delete Appointment"
                      : ""
          }
          onClose={closeModal}
          width="max-w-2/3"
          height="max-h-[450px]"
          onConfirm={
            modalType === "addApt"
              ? handleAddAppointment
              : (modalType === "cancelApt" || modalType === "viewDetail") &&
                  selectedApt.status === "Completed"
                ? () =>
                    toast.error(
                      "You can not cancel an already completed appointment.",
                    )
                : (modalType === "cancelApt" || modalType === "viewDetail") &&
                    selectedApt.status !== "Completed"
                  ? () => handleCancelAppointment(selectedApt._id)
                  : modalType === "resAptDt"
                    ? () => handleRescheduleApt(selectedApt._id)
                    : modalType === "deleteApt"
                      ? () => handleDeleteApt(selectedApt._id)
                      : undefined
          }
          confirmText={
            modalType === "addApt"
              ? "Add Appointment"
              : modalType === "cancelApt"
                ? "Cancel Appointment"
                : modalType === "viewDetail"
                  ? "Cancel Appointment"
                  : modalType === "resAptDt"
                    ? "Confirm"
                    : modalType === "deleteApt"
                      ? "Delete"
                      : ""
          }
          confirmIcon={
            modalType === "addApt" ? (
              <Plus className="w-5 h-5 mr-2" />
            ) : modalType === "cancelApt" || modalType === "viewDetail" ? (
              <X className="w-5 h-5 mr-2" />
            ) : modalType === "resAptDt" ? (
              <Save className="w-5 h-5 mr-2" />
            ) : modalType === "deleteApt" ? (
              <Trash className="h-5 w-5 mr-2" />
            ) : (
              ""
            )
          }
          confirmColor={
            modalType === "cancelApt" ||
            modalType === "viewDetail" ||
            modalType === "deleteApt"
              ? "bg-red-700 hover:bg-red-400 text-white border-0"
              : "bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          }
          onCancel={
            modalType === "viewDetail" && selectedApt.status === "Completed"
              ? () =>
                  toast.error(
                    "You can not reschedule a completed appointment. This appointment is already completed.",
                  )
              : modalType === "viewDetail" && selectedApt.status !== "Completed"
                ? () => setModalType("resAptDt")
                : modalType === "resAptDt"
                  ? () => setModalType("viewDetail")
                  : closeModal
          }
          cancelText={
            modalType === "viewDetail"
              ? "Reschedule"
              : modalType === "resAptDt"
                ? "Back"
                : "Cancel"
          }
          cancelIcon={
            modalType === "viewDetail" ? (
              <Calendar className="w-5 h-5 mr-2" />
            ) : modalType === "resAptDt" ? (
              <ArrowLeft className="w-5 h-5 mr-2" />
            ) : (
              <X className="w-5 h-5 mr-2" />
            )
          }
        >
          {modalType === "addApt" && (
            <div className="space-y-3">
              <form className="space-y-2">
                {/* Patient Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Appointment Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="aptDate"
                      min={new Date().toISOString().split("T")[0]}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="department"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => {
                        handleInputChange(e);
                        fetchSpecialists(e.target.value);
                        setDept(e.target.value);
                      }}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Specialist <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="specialist"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => {
                        handleInputChange(e);
                        fetchRelatedDoctors(e.target.value);
                      }}
                      required
                    >
                      <option value="">Select Specialist</option>
                      {specialists.map((spec) => (
                        <option key={spec._id} value={spec._id}>
                          {spec.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Doctor <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="doctorId"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      required
                      onChange={handleInputChange}
                    >
                      <option value="">Select Doctor</option>
                      {relatedDoctors.map((doc) => (
                        <option key={doc._id} value={doc._id}>
                          {doc.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Shift <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="shift"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      onChange={handleInputChange}
                    >
                      <option value="">Select Option</option>
                      <option value="morning">Morning</option>
                      <option value="evening">Evening</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Appointment Time <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="appointmentTime"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Time</option>
                      {aptFormData.shift && aptFormData.shift === "morning" ? (
                        <>
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="09:30 AM">09:30 AM</option>
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="10:30 AM">10:30 AM</option>
                          <option value="11:00 AM">11:00 AM</option>
                          <option value="11:30 AM">11:30 AM</option>
                          <option value="12:00 PM">12:00 PM</option>
                        </>
                      ) : aptFormData.shift === "evening" ? (
                        <>
                          <option value="04:00 PM">04:00 PM</option>
                          <option value="04:30 PM">04:30 PM</option>
                          <option value="05:00 PM">05:00 PM</option>
                          <option value="03:30 PM">05:30 PM</option>
                          <option value="03:00 PM">06:00 PM</option>
                          <option value="02:30 PM">06:30 PM</option>
                          <option value="02:00 PM">07:00 PM</option>
                        </>
                      ) : (
                        ""
                      )}
                    </select>
                  </div>
                </div>

                {/* Reason for Visit */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for Visit <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="reasonForVisit"
                    rows={4}
                    onChange={handleInputChange}
                    placeholder="Please describe your symptoms or reason for appointment"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                {/* Additional Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500 rounded-full p-1 mt-0.5">
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">
                        Important Information
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>
                          Please arrive 15 minutes before your appointment time
                        </li>
                        <li>Bring your medical records and insurance card</li>
                        <li>
                          Appointment confirmation will be sent via SMS and
                          email
                        </li>
                        <li>
                          You can cancel or reschedule up to 24 hours before the
                          appointment
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
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
                </div>
              </div>
              {/* Appointment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Patient Information */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Patient Information
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Patient Name
                    </label>
                    <p className="text-base text-gray-900 font-medium">
                      {selectedApt.patientId.fullName || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Patient ID
                    </label>
                    <p className="text-base text-gray-900 font-mono">
                      {selectedApt.patientId.id_no || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Contact Number
                    </label>
                    <p className="text-base text-gray-900">
                      {selectedApt.patientId.phoneNo || "N/A"}
                    </p>
                  </div>

                  {selectedApt.patientId.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Email
                      </label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-base text-gray-900">
                          {selectedApt.patientId.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Doctor Information */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Doctor Information
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Doctor Name
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        {selectedApt.doctorId.photo ? (
                          <img
                            src={`${baseurl}/images/uploads/${selectedApt.doctorId.photo}`}
                            alt={selectedApt.doctorId.photo}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <span className="text-blue-600 font-semibold text-sm">
                            {selectedApt.doctorId.fullName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "?"}
                          </span>
                        )}
                      </div>
                      <p className="text-base text-gray-900 font-medium">
                        {selectedApt.doctorId.fullName || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Department
                    </label>
                    <p className="text-base text-gray-900">
                      {selectedApt.departmentId.name || "N/A"}
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

              {/* Reason for Visit */}
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
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
          {modalType === "cancelApt" && selectedApt && (
            <div>
              <h1 className="">
                Are you sure you want to cancel appointment with{" "}
                <span className="font-bold">
                  {selectedApt.doctorId?.fullName}
                </span>
                ?
              </h1>
            </div>
          )}
          {modalType === "deleteApt" && selectedApt && (
            <div>
              <h1 className="">
                Are you sure you want to Delete this appointment?
              </h1>
            </div>
          )}
          {modalType === "resAptDt" && selectedApt && (
            <div className="space-y-6">
              <form className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900">
                    Rescheduling appointment with{" "}
                    <span className="font-semibold">
                      {selectedApt.doctorId?.fullName}
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Appointment Date{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="aptDate"
                      defaultValue={selectedApt.aptDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Shift <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="shift"
                      defaultValue={selectedApt.shift}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      onChange={handleInputChange}
                    >
                      <option value="">Select Option</option>
                      <option value="morning">Morning</option>
                      <option value="evening">Evening</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Appointment Time <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="appointmentTime"
                    defaultValue={selectedApt.appointmentTime}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Time</option>
                    {(aptFormData.shift || selectedApt.shift) &&
                    (aptFormData.shift || selectedApt.shift) === "morning" ? (
                      <>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="09:30 AM">09:30 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="10:30 AM">10:30 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                      </>
                    ) : (aptFormData.shift || selectedApt.shift) ===
                      "evening" ? (
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
              </form>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MyAppointments;
