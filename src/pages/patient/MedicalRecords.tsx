import { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Activity,
  FileText,
  Pill,
  FlaskRound,
  Download,
  Eye,
  Clock,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  X,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useSelector } from "react-redux";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";

interface MedicalRecord {
  appointments: any[];
  consultations: any[];
  prescriptions: any[];
  labTests: any[];
  patientOverview: {
    fullName: string;
    age: number;
    gender: string;
    bloodGroup: string;
    lastVisit: string;
    totalAppointments: number;
    allergies: string[];
  };
}

const MedicalRecords = () => {
  const patient = useSelector((state: any) => state.auth.user);
  const baseurl = import.meta.env.VITE_BASE_URL;
  const { isOpen, openModal, closeModal } = useModal();

  const [activeTab, setActiveTab] = useState("appointments");
  const [modalType, setModalType] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord>({
    appointments: [],
    consultations: [],
    prescriptions: [],
    labTests: [],
    patientOverview: {
      fullName: "",
      age: 0,
      gender: "",
      bloodGroup: "",
      lastVisit: "",
      totalAppointments: 0,
      allergies: [],
    },
  });
  console.log(medicalRecords);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${baseurl}/api/patient/medical-records`,
        {
          headers: {
            "auth-token": localStorage.getItem("authToken") || patient?.token,
          },
        },
      );
      if (response.data.success) {
        setMedicalRecords(response.data.medicalRecords);
      }
    } catch (error: any) {
      console.error("Error fetching medical records:", error.message);
      toast.error(error.response?.data?.message || "Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  console.log(medicalRecords);

  useEffect(() => {
    if (patient?.id) {
      fetchMedicalRecords();
    }
  }, [patient?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "Dispensed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4" />;
      case "Pending":
        return <Clock className="h-4 w-4" />;
      case "Cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const tabs = [
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      count: medicalRecords.appointments.length,
    },
    {
      id: "consultations",
      label: "Consultations",
      icon: Stethoscope,
      count: medicalRecords.consultations.length,
    },
    {
      id: "prescriptions",
      label: "Prescriptions",
      icon: Pill,
      count: medicalRecords.prescriptions.length,
    },
    {
      id: "labTests",
      label: "Lab Reports",
      icon: FlaskRound,
      count: medicalRecords.labTests.length,
    },
    {
      id: "timeline",
      label: "Timeline",
      icon: Activity,
      count: 0,
    },
  ];

  // Timeline data - combining all records with improved deduplication
  const timelineDataRaw = [
    ...medicalRecords.appointments.map((apt) => ({
      date: apt.date,
      type: "appointment",
      data: apt,
      id: apt._id || apt.id_no,
      uniqueKey: `appointment-${apt._id || apt.id_no || apt.date}`,
    })),
    ...medicalRecords.consultations.map((cons) => ({
      date: cons.date,
      type: "consultation",
      data: cons,
      id: cons._id,
      uniqueKey: `consultation-${cons._id || cons.date}`,
    })),
    ...medicalRecords.prescriptions.map((pres) => ({
      date: pres.date,
      type: "prescription",
      data: pres,
      id: pres._id || pres.id_no,
      uniqueKey: `prescription-${pres._id || pres.id_no || pres.date}`,
    })),
    ...medicalRecords.labTests.map((lab) => ({
      date: lab.date,
      type: "labTest",
      data: lab,
      id: lab._id || lab.id_no,
      uniqueKey: `labTest-${lab._id || lab.id_no || lab.date}`,
    })),
  ];

  // Deduplicate by uniqueKey with strict checking
  const seenKeys = new Map();
  const timelineData = timelineDataRaw
    .filter((item) => {
      if (!item.uniqueKey) return true;

      if (seenKeys.has(item.uniqueKey)) {
        return false;
      }
      seenKeys.set(item.uniqueKey, true);
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group timeline by date
  const groupedTimeline = timelineData.reduce((acc: any, item) => {
    const date = new Date(item.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  const getResultStatusColor = (status: string) => {
    switch (status) {
      case "Normal":
        return "bg-green-100 text-green-800";
      case "High":
        return "bg-red-100 text-red-800";
      case "Low":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-3">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Medical Records
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Complete health history and medical documentation
              </p>
            </div>
          </div>

          {/* Patient Overview */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Patient Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-blue-600" />
                  <p className="text-xs text-gray-500 uppercase">Name</p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {medicalRecords.patientOverview.fullName}
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <p className="text-xs text-gray-500 uppercase">Age</p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {medicalRecords.patientOverview.age} years
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-blue-600" />
                  <p className="text-xs text-gray-500 uppercase">Gender</p>
                </div>
                <p className="text-sm font-bold text-gray-900 capitalize">
                  {medicalRecords.patientOverview.gender}
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-red-600" />
                  <p className="text-xs text-gray-500 uppercase">Blood Group</p>
                </div>
                <p className="text-sm font-bold text-red-600">
                  {medicalRecords.patientOverview.bloodGroup}
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <p className="text-xs text-gray-500 uppercase">Last Visit</p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(
                    medicalRecords.patientOverview.lastVisit,
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <p className="text-xs text-gray-500 uppercase">Visits</p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {medicalRecords.patientOverview.totalAppointments}
                </p>
              </div>
            </div>

            {/* Allergies */}
            {medicalRecords.patientOverview.allergies.length > 0 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-xs text-red-600 font-semibold uppercase">
                    Known Allergies
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {medicalRecords.patientOverview.allergies.map(
                    (allergy, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full"
                      >
                        {allergy}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center cursor-pointer gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600 bg-blue-50"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {tab.count > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          activeTab === tab.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">
                    Loading medical records...
                  </p>
                </div>
              </div>
            )}

            {!loading && (
              <>
                {/* Appointments Tab */}
                {activeTab === "appointments" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Appointment History
                      </h3>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search appointments..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 focus:outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                              Date & Time
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                              Appointment ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                              Doctor
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                              Department
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                              Reason
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {medicalRecords.appointments
                            .filter(
                              (apt) =>
                                apt.doctor
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase()) ||
                                apt.department
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase()) ||
                                apt.reason
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase()),
                            )
                            .map((apt) => (
                              <tr key={apt._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  <div>
                                    <p className="font-semibold">
                                      {apt.date.slice(0, 10)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {apt.time}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {apt.id_no}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {apt.doctor}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {apt.department}
                                </td>
                                <td className="px-4 py-3 w-1/6 text-sm text-gray-600">
                                  {apt.reason}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full border ${getStatusColor(apt.status)}`}
                                  >
                                    {getStatusIcon(apt.status)}
                                    {apt.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => {
                                      setSelectedRecord(apt);
                                      setModalType("appointmentDetails");
                                      openModal();
                                    }}
                                    className="text-blue-600 cursor-pointer hover:text-blue-800 text-sm font-medium"
                                  >
                                    <Eye className="w-5 h-5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      {medicalRecords.appointments.filter(
                        (apt) =>
                          apt.doctor
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          apt.department
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          apt.reason
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                      ).length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No appointments found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Consultations Tab */}
                {activeTab === "consultations" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Consultation History
                    </h3>

                    {medicalRecords.consultations.length === 0 ? (
                      <div className="text-center py-12">
                        <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                          No consultations found
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {medicalRecords.consultations.map((cons) => (
                          <div
                            key={cons._id}
                            className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-1">
                              <div>
                                <p className="text-sm text-gray-600">
                                  {new Date(cons.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    },
                                  )}
                                </p>
                                <p className="text-lg font-bold text-gray-900 mt-1">
                                  {cons.doctor}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedRecord(cons);
                                  setModalType("consultationDetails");
                                  openModal();
                                }}
                                className="px-4 py-2 cursor-pointer transition-colors ease-in-out duration-300 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                              >
                                View Full Details
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-red-600 font-semibold uppercase mb-2">
                                  Diagnosis
                                </p>
                                <p className="text-sm text-gray-900">
                                  {cons.diagnosis}
                                </p>
                              </div>

                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-yellow-600 font-semibold uppercase mb-2">
                                  Symptoms
                                </p>
                                <p className="text-sm text-gray-900">
                                  {cons.symptoms}
                                </p>
                              </div>

                              <div className="bg-white rounded-lg p-3 border border-gray-200 md:col-span-2">
                                <p className="text-xs text-blue-600 font-semibold uppercase mb-2">
                                  Doctor's Notes
                                </p>
                                <p className="text-sm text-gray-900">
                                  {cons.notes}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Prescriptions Tab */}
                {activeTab === "prescriptions" && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Prescription history
                    </h3>

                    {medicalRecords.prescriptions.length === 0 ? (
                      <div className="text-center py-12">
                        <Pill className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-400 text-base">
                          No prescriptions found
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {medicalRecords.prescriptions.map((pres) => (
                          <div
                            key={pres._id}
                            className="bg-white border border-gray-100 rounded-xl p-5"
                          >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                {pres.doctor ? (
                                  <img
                                    src={`${baseurl}/images/uploads/${pres.doctor.photo}`}
                                    alt={pres.doctor.fullName}
                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-sm font-medium flex-shrink-0">
                                    {pres.doctor.fullName
                                      .split(" ")
                                      .map((w: string) => w[0])
                                      .join("")
                                      .toUpperCase()
                                      .slice(0, 2)}
                                  </div>
                                )}

                                {/* Meta info */}
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs text-gray-400 tracking-wide">
                                    {pres.id_no}
                                  </span>
                                  <span className="text-sm font-medium text-gray-900">
                                    Dr. {pres.doctor.fullName}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Issued{" "}
                                    {`${new Date(pres.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      },
                                    )} at ${new Date(
                                      pres.date,
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}`}
                                  </span>
                                  {pres.dispensedBy ? (
                                    <span className="text-xs text-gray-500">
                                      Dispensed by{" "}
                                      <span className="text-green-600 font-medium">
                                        {pres.dispensedBy.fullName}
                                      </span>{" "}
                                      ·{" "}
                                      {new Date(
                                        pres.dispensedAt,
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}{" "}
                                      at{" "}
                                      {new Date(
                                        pres.dispensedAt,
                                      ).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-yellow-600 font-medium">
                                      Awaiting dispensation
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Right: badge + button */}
                              <div className="flex flex-col items-end gap-2">
                                <span
                                  className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(pres.status)}`}
                                >
                                  {pres.status}
                                </span>
                                <button
                                  onClick={() => {
                                    setSelectedRecord(pres);
                                    setModalType("prescriptionDetails");
                                    openModal();
                                  }}
                                  className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 hover:bg-blue-100 transition-colors cursor-pointer"
                                >
                                  View details
                                </button>
                              </div>
                            </div>

                            {/* Divider */}
                            <hr className="my-4 border-gray-100" />

                            {/* Medicines */}
                            <div className="flex flex-col gap-2">
                              {pres.medicines.map((med: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 w-4">
                                      {idx + 1}
                                    </span>
                                    <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center">
                                      <Pill className="h-3.5 w-3.5 text-green-500" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-800">
                                      {med.name}
                                    </span>
                                  </div>
                                  <div className="flex gap-1.5 flex-wrap justify-end">
                                    {[
                                      `${med.dosage} mg`,
                                      `${med.frequency}× daily`,
                                      `${med.duration} days`,
                                    ].map((tag) => (
                                      <span
                                        key={tag}
                                        className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-500"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Lab Tests Tab */}
                {activeTab === "labTests" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Laboratory Test Reports
                    </h3>

                    {medicalRecords.labTests.length === 0 ? (
                      <div className="text-center py-12">
                        <FlaskRound className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                          No lab tests found
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Test ID
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Test Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Issued By
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Date & Time
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Status
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {medicalRecords.labTests.map((lab) => (
                              <tr key={lab._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-900">
                                  {lab.id_no}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {lab.testName}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  Dr. {lab.orderedBy}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  <div className="flex flex-col gap-1">
                                    <p className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {new Date(lab.date).toLocaleDateString(
                                        "en-US",
                                        {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        },
                                      )}
                                    </p>
                                    <p className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {new Date(lab.date).toLocaleTimeString(
                                        "en-US",
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        },
                                      )}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full border ${getStatusColor(lab.status)}`}
                                  >
                                    {getStatusIcon(lab.status)}
                                    {lab.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2">
                                    {lab.status === "Completed" && (
                                      <>
                                        <button
                                          onClick={() => {
                                            setSelectedRecord(lab);
                                            setModalType("labTestDetails");
                                            openModal();
                                          }}
                                          className="text-blue-600 cursor-pointer hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                        >
                                          <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            window.open(
                                              `${baseurl}/images/pdfs/${lab.resultPDF}`,
                                              "_blank",
                                            );
                                          }}
                                          className="text-green-600 cursor-pointer hover:text-green-800 text-sm font-medium flex items-center gap-1"
                                        >
                                          <Download className="h-4 w-4" />
                                        </button>
                                      </>
                                    )}
                                    {lab.status === "Pending" && (
                                      <span className="text-xs text-gray-500">
                                        Awaiting results
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Timeline Tab */}
                {activeTab === "timeline" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Medical History Timeline
                    </h3>

                    <div className="space-y-6">
                      {Object.entries(groupedTimeline).map(
                        ([date, items]: any) => (
                          <div key={date}>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                                <p className="text-sm font-bold">{date}</p>
                              </div>
                              <div className="flex-1 h-px bg-gray-300"></div>
                            </div>

                            <div className="space-y-3 ml-8">
                              {items.map((item: any, idx: number) => (
                                <div
                                  key={idx}
                                  className={`border-l-4 pl-4 pr-2 py-3 ${
                                    item.type === "appointment"
                                      ? "border-blue-400 bg-blue-50"
                                      : item.type === "consultation"
                                        ? "border-green-400 bg-green-50"
                                        : item.type === "prescription"
                                          ? "border-purple-400 bg-purple-50"
                                          : "border-orange-400 bg-orange-50"
                                  } rounded-r-lg`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        {item.type === "appointment" && (
                                          <Calendar className="h-4 w-4 text-blue-600" />
                                        )}
                                        {item.type === "consultation" && (
                                          <Stethoscope className="h-4 w-4 text-green-600" />
                                        )}
                                        {item.type === "prescription" && (
                                          <Pill className="h-4 w-4 text-purple-600" />
                                        )}
                                        {item.type === "labTest" && (
                                          <FlaskRound className="h-4 w-4 text-orange-600" />
                                        )}
                                        <p className="text-xs font-semibold text-gray-600 uppercase">
                                          {item.type === "appointment"
                                            ? "Appointment"
                                            : item.type === "consultation"
                                              ? "Consultation"
                                              : item.type === "prescription"
                                                ? "Prescription"
                                                : "Lab Test"}
                                        </p>
                                      </div>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {item.type === "appointment" &&
                                          `with ${item.data.doctor}`}
                                        {item.type === "consultation" &&
                                          item.data.diagnosis}
                                        {item.type === "prescription" &&
                                          `${item.data.medicines.length} medicine(s) prescribed`}
                                        {item.type === "labTest" &&
                                          item.data.testName}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-1">
                                        {item.type === "appointment" &&
                                          item.data.department}
                                        {item.type === "consultation" &&
                                          `By ${item.data.doctor}`}
                                        {item.type === "prescription" &&
                                          `By ${item.data.doctor}`}
                                        {item.type === "labTest" &&
                                          `Ordered by ${item.data.orderedBy}`}
                                      </p>
                                    </div>
                                    {item.type === "appointment" && (
                                      <span
                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.data.status)}`}
                                      >
                                        {item.data.status}
                                      </span>
                                    )}
                                    {item.type === "labTest" && (
                                      <span
                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.data.status)}`}
                                      >
                                        {item.data.status}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={isOpen}
          title={
            modalType === "appointmentDetails"
              ? "Appointment Details"
              : modalType === "consultationDetails"
                ? "Consultation Details"
                : modalType === "prescriptionDetails"
                  ? "Prescription Details"
                  : "Lab Test Details"
          }
          onClose={closeModal}
          width="max-w-2/3"
          height="max-h-[450px]"
          cancelIcon={<X className="w-5 h-5 mr-2" />}
        >
          {modalType === "appointmentDetails" && selectedRecord && (
            <div className="space-y-2">
              {/* 🔹 Header Info */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Doctor</p>
                    <p className="font-semibold text-gray-900">
                      {selectedRecord.doctor}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600">Department</p>
                    <p className="font-semibold text-gray-900">
                      {selectedRecord.department}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600">Appointment</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedRecord.date).toLocaleDateString(
                        "en-US",
                        {
                          timeZone: "Asia/Karachi",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}{" "}
                      at {selectedRecord.time}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600">Shift</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {selectedRecord.shift}
                    </p>
                  </div>
                </div>
              </div>

              {/* 🔹 Reason */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Reason for Visit
                </h4>
                <p className="text-sm text-blue-800">{selectedRecord.reason}</p>
              </div>

              {/* 🔹 Status */}
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-cyan-900 mb-1">
                  Appointment Status
                </h4>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(selectedRecord.status)}`}
                >
                  {getStatusIcon(selectedRecord.status)}
                  {selectedRecord.status}
                </span>
              </div>

              {/* 🔹 Confirmation */}
              {selectedRecord.confirmedAt && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-green-900 mb-1">
                    Confirmed At
                  </h4>
                  <p className="text-sm text-green-800">
                    {new Date(selectedRecord.confirmedAt).toLocaleString(
                      "en-US",
                      {
                        timeZone: "Asia/Karachi",
                      },
                    )}
                  </p>
                </div>
              )}

              {/* 🔹 Reschedule Info */}
              {selectedRecord.rescheduleStatus && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-2">
                  <h4 className="text-sm font-semibold text-yellow-900">
                    Reschedule Details
                  </h4>

                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Status:</span>{" "}
                    {selectedRecord.rescheduleStatus}
                  </p>

                  {selectedRecord.oldAptDate && (
                    <p className="text-sm text-yellow-800">
                      <span className="font-medium">Old Appointment:</span>{" "}
                      {`${new Date(
                        selectedRecord.oldAptDate,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })} 
                      ${new Date(selectedRecord.oldAptDate).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}`}
                    </p>
                  )}

                  {selectedRecord.rescheduleReason && (
                    <p className="text-sm text-yellow-800">
                      <span className="font-medium">Reason:</span>{" "}
                      {selectedRecord.rescheduleReason}
                    </p>
                  )}

                  {selectedRecord.rescheduledAt && (
                    <p className="text-sm text-yellow-800">
                      <span className="font-medium">Rescheduled At:</span>{" "}
                      {`${new Date(
                        selectedRecord.rescheduledAt,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })} 
                      ${new Date(
                        selectedRecord.rescheduledAt,
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`}
                    </p>
                  )}
                </div>
              )}

              {/* 🔹 Additional Notes */}
              {selectedRecord.addDetails && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-purple-900 mb-1">
                    Additional Details
                  </h4>
                  <p className="text-sm text-purple-800">
                    {selectedRecord.addDetails}
                  </p>
                </div>
              )}
            </div>
          )}

          {modalType === "prescriptionDetails" && selectedRecord && (
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Prescription ID:</p>
                    <p className="font-semibold text-gray-900">
                      {selectedRecord.id_no}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Doctor:</p>
                    <p className="font-semibold text-gray-900">
                      {selectedRecord.doctor}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date:</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedRecord.date).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "short", day: "numeric" },
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-900 mb-3">
                  Prescribed Medicines
                </h4>
                <div className="space-y-2">
                  {selectedRecord.medicines.map((med: any, idx: number) => (
                    <div
                      key={med._id}
                      className="bg-green-50 border border-green-200 p-3 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h5 className="text-sm font-bold text-green-900">
                          {idx + 1}. {med.name}
                        </h5>
                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full font-semibold">
                          {med.dosage}mg
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-green-700 font-medium">
                            Frequency:{" "}
                          </span>
                          <span className="text-green-900">
                            {med.frequency}x daily
                          </span>
                        </div>
                        <div>
                          <span className="text-green-700 font-medium">
                            Duration:{" "}
                          </span>
                          <span className="text-green-900">
                            {med.duration} days
                          </span>
                        </div>
                        <div>
                          <span className="text-green-700 font-medium">
                            Quantity:{" "}
                          </span>
                          <span className="text-green-900">
                            {med.quantity} tablets
                          </span>
                        </div>
                        <div>
                          <span className="text-green-700 font-medium">
                            When:{" "}
                          </span>
                          <span className="text-green-900">{med.timing}</span>
                        </div>
                      </div>
                      {med.instructions && (
                        <p className="text-xs text-green-700 mt-2 italic bg-green-100 p-2 rounded">
                          Note: {med.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-purple-700">Total Amount:</p>
                    <p className="font-semibold text-purple-900 text-lg">
                      Rs. {selectedRecord.totalAmount}
                    </p>
                  </div>
                  <div>
                    <p className="text-purple-700">Status:</p>
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(selectedRecord.status)}`}
                    >
                      {selectedRecord.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {modalType === "labTestDetails" && selectedRecord && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Test ID:</p>
                    <p className="font-semibold text-gray-900">
                      {selectedRecord.id_no}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Test Name:</p>
                    <p className="font-semibold text-gray-900">
                      {selectedRecord.testName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ordered By:</p>
                    <p className="font-semibold text-gray-900">
                      {selectedRecord.orderedBy}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-orange-900 mb-1">
                  Test Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-orange-700">Date Ordered:</p>
                    <p className="font-semibold text-orange-900">
                      {new Date(selectedRecord.date).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "short", day: "numeric" },
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-orange-700">Status:</p>
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(selectedRecord.status)}`}
                    >
                      {getStatusIcon(selectedRecord.status)}
                      {selectedRecord.status}
                    </span>
                  </div>
                </div>
              </div>

              {selectedRecord.status === "Completed" &&
                selectedRecord.results && (
                  <>
                    <div className="">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">
                        Test Results
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 rounded-lg">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                Parameter
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                                Result
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                                Reference Range
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                                Unit
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedRecord.results.map(
                              (result: any, idx: number) => (
                                <tr
                                  key={idx}
                                  className={
                                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                  }
                                >
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {result.name}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">
                                    {result.value}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-center text-gray-600">
                                    {result.range}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-center text-gray-600">
                                    {result.unit}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getResultStatusColor(result.status)}`}
                                    >
                                      {result.status}
                                    </span>
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {selectedRecord.remarks && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">
                          Lab Remarks
                        </h4>
                        <p className="text-sm text-blue-800">
                          {selectedRecord.remarks}
                        </p>
                      </div>
                    )}
                  </>
                )}
            </div>
          )}

          {modalType === "consultationDetails" && selectedRecord && (
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Doctor:</p>
                    <p className="font-semibold text-gray-900">
                      {selectedRecord.doctor}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date:</p>
                    <p className="font-semibold text-gray-900">
                      {`${new Date(selectedRecord.date).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )} 
                      ${new Date(selectedRecord.date).toLocaleTimeString(
                        "en-US",
                        { hour: "2-digit", minute: "2-digit" },
                      )}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-purple-900 mb-1">
                  Vital Signs
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-purple-700">Blood Pressure</p>
                    <p className="font-semibold text-purple-900">
                      {selectedRecord.vitals.bloodPressure} mmHg
                    </p>
                  </div>
                  <div>
                    <p className="text-purple-700">Heart Rate</p>
                    <p className="font-semibold text-purple-900">
                      {selectedRecord.vitals.heartRate} bpm
                    </p>
                  </div>
                  <div>
                    <p className="text-purple-700">Temperature</p>
                    <p className="font-semibold text-purple-900">
                      {selectedRecord.vitals.temperature} °F
                    </p>
                  </div>
                  <div>
                    <p className="text-purple-700">Weight</p>
                    <p className="font-semibold text-purple-900">
                      {selectedRecord.vitals.weight} kg
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-red-900 mb-1">
                  Diagnosis
                </h4>
                <p className="text-sm text-red-800">
                  {selectedRecord.diagnosis}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                  Symptoms
                </h4>
                <p className="text-sm text-yellow-800">
                  {selectedRecord.symptoms}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Doctor's Notes
                </h4>
                <p className="text-sm text-blue-800">{selectedRecord.notes}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MedicalRecords;
