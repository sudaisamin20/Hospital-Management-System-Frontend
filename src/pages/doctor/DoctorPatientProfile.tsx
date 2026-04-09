import { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Activity,
  AlertCircle,
  Calendar,
  Pill,
  FlaskRound,
  FileText,
  Stethoscope,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Plus,
  ChevronLeft,
  Heart,
  TrendingUp,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

interface PatientProfile {
  _id: string;
  id_no: string;
  fullName: string;
  email: string;
  phoneNo: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  photo?: string;
  address: {
    street: string;
    city: string;
    state: string;
  };
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: {
    name: string;
    phoneNo: string;
  };
}

interface ILabTestReports {
  _id: string;
  appointmentId: string;
  doctorId: {
    _id: string;
    id_no: string;
    fullName: string;
    photo: string;
  };
  consultationId: string;
  patientid: string;
  tests: [
    {
      _id: string;
      id_no: string;
      testName: string;
      testId: string;
      completedAt: Date;
      remarks: string;
      resultPDF: string;
      results: [
        {
          name: string;
          value: number;
          range: string;
          unit: string;
          status: string;
          _id: string;
        },
      ];
      hiddenFor: [
        {
          role: string;
          userId: string;
          hiddenAt: Date;
        },
      ];
      createdAt: Date;
      updatedAt: Date;
    },
  ];
}

interface Stats {
  totalAppointments: number;
  completedAppointments: number;
  prescriptionCount: number;
  totalLabTests: number;
  lastVisit: string;
}

const DoctorPatientProfile = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const baseurl = import.meta.env.VITE_BASE_URL;

  const [activeTab, setActiveTab] = useState("overview");
  const [patientData, setPatientData] = useState<PatientProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<ILabTestReports[]>([]);
  const [labTests, setLabTests] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [appointmentFilter, setAppointmentFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchPatientData = async () => {
    try {
      const response = await axiosInstance.get(
        `/doctor/patients/${patientId}/profile`,
      );
      if (response.data.success) {
        setPatientData(response.data.patientProfile.patientInfo);
        setStats(response.data.patientProfile.stats);
        setAppointments(response.data.patientProfile.appointments);
        setConsultations(response.data.patientProfile.consultations);
        setPrescriptions(response.data.patientProfile.prescriptions);
        setLabTests(response.data.patientProfile.labOrders);
        setNotes(response.data.patientProfile.notes);
      }
    } catch (error: any) {
      console.error("Error fetching patient data:", error.message);
      toast.error("Failed to load patient data");
    }
  };
  useEffect(() => {
    if (patientId) {
      const fetchData = async () => {
        await fetchPatientData();
      };
      fetchData();
    }
  }, [patientId]);

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4" />;
      case "Confirmed":
        return <Clock className="h-4 w-4" />;
      case "Pending":
        return <AlertCircle className="h-4 w-4" />;
      case "Cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Timeline data - combining all records with improved deduplication
  const timelineDataRaw = [
    ...appointments.map((apt) => ({
      date: apt.createdAt,
      type: "appointment",
      data: apt,
      id: apt._id || apt.id_no,
      uniqueKey: `appointment-${apt._id || apt.id_no || apt.createdAt}`,
    })),
    ...consultations.map((cons) => ({
      date: cons.createdAt,
      type: "consultation",
      data: cons,
      id: cons._id,
      uniqueKey: `consultation-${cons._id || cons.createdAt}`,
    })),
    ...prescriptions.map((pres) => ({
      date: pres.createdAt,
      type: "prescription",
      data: pres,
      id: pres._id || pres.id_no,
      uniqueKey: `prescription-${pres._id || pres.id_no || pres.createdAt}`,
    })),
    ...labTests.map((lab) => ({
      date: lab.createdAt,
      type: "labTest",
      data: lab,
      id: lab._id || lab.id_no,
      uniqueKey: `labTest-${lab._id || lab.id_no || lab.createdAt}`,
    })),
  ];
  console.log("Raw Timeline Data:", timelineDataRaw);
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
  console.log("Grouped Timeline Data:", groupedTimeline);

  const filteredAppointments = appointments.filter((apt) => {
    if (appointmentFilter === "all") return true;
    return apt.status === appointmentFilter;
  });

  const handleSaveNote = () => {
    if (!newNote.trim()) {
      toast.error("Please enter a note");
      return;
    }

    const note = {
      _id: Date.now().toString(),
      content: newNote,
      date: new Date().toISOString().split("T")[0],
    };

    setNotes([note, ...notes]);
    setNewNote("");
    toast.success("Note saved successfully");
  };

  const statusConfig: Record<string, { label: string; classes: string }> = {
    Dispensed: {
      label: "Dispensed",
      classes: "bg-green-50 text-green-700 border border-green-200",
    },
    Pending: {
      label: "Pending",
      classes: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    },
    Cancelled: {
      label: "Cancelled",
      classes: "bg-red-50 text-red-700 border border-red-200",
    },
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      count: appointments.length,
    },
    {
      id: "prescriptions",
      label: "Prescriptions",
      icon: Pill,
      count: prescriptions.length,
    },
    {
      id: "labTests",
      label: "Lab Reports",
      icon: FlaskRound,
      count: labTests.length,
    },
    {
      id: "timeline",
      label: "Timeline",
      icon: Clock,
      count: timelineData.length,
    },
    { id: "notes", label: "Notes", icon: FileText, count: notes?.length },
  ];

  if (!patientData) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 text-gray-400 mx-auto mb-3 animate-spin"></div>
          <p className="text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }
  console.log(labTests);
  return (
    <div className="min-h-screen w-full bg-gray-50 p-3">
      <div className="max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => navigate("/doctor/patients")}
          className="mb-2 text-blue-600 cursor-pointer hover:text-blue-800 font-medium flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Patients
        </button>

        {/* Header - Patient Info */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
            {/* Left - Patient Info */}
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                {patientData.photo ? (
                  <img
                    src={`${baseurl}/images/uploads/${patientData.photo}`}
                    alt={patientData.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">
                  {patientData.fullName}
                </h1>
                <p className="text-sm text-gray-500 font-mono mt-1">
                  {patientData.id_no}
                </p>

                {/* Quick Info */}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                    {calculateAge(patientData.dob)} years • {patientData.gender}
                  </span>
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                    {patientData.bloodGroup}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm">
                  <div className="flex items-center col-span-1 gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    {patientData.phoneNo}
                  </div>
                  <div className="flex items-center col-span-1 gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    {patientData.email}
                  </div>
                  <div className="flex col-span-2 items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {patientData.address}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Allergies Warning */}
          {patientData.allergies.length > 0 && (
            <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h3 className="text-sm font-bold text-red-900 uppercase">
                  ⚠️ ALLERGIES
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {patientData.allergies.map((allergy, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-red-100 text-red-800 text-sm font-bold rounded-full border-2 border-red-300"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Chronic Conditions */}
          {/* {patientData.chronicConditions.length > 0 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-amber-600" />
                <h3 className="text-sm font-bold text-amber-900 uppercase">
                  Chronic Conditions
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {patientData.chronicConditions.map((condition, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-semibold rounded-full"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          )} */}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-3">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm cursor-pointer whitespace-nowrap border-b-2 transition-colors ${
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
          <div className="p-3">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-3">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-3 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Calendar className="h-6 w-6 opacity-80" />
                    </div>
                    <p className="text-blue-100 text-sm font-medium">
                      Total Visits
                    </p>
                    <p className="text-xl font-bold mt-1">
                      {stats.totalAppointments}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-3 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="h-6 w-6 opacity-80" />
                    </div>
                    <p className="text-green-100 text-sm font-medium">
                      Completed
                    </p>
                    <p className="text-xl font-bold mt-1">
                      {stats?.completedAppointments}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-3 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Pill className="h-6 w-6 opacity-80" />
                    </div>
                    <p className="text-purple-100 text-sm font-medium">
                      Prescriptions
                    </p>
                    <p className="text-xl font-bold mt-1">
                      {stats?.prescriptionCount}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-3 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="h-6 w-6 opacity-80" />
                    </div>
                    <p className="text-orange-100 text-sm font-medium">
                      Last Visit
                    </p>
                    <p className="text-lg font-bold mt-1">
                      {new Date(stats.lastVisit).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {/* Recent Visits */}
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Recent Visits
                    </h3>
                    <div className="space-y-3">
                      {appointments.slice(0, 5).map((apt) => (
                        <div
                          key={apt._id}
                          className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50 rounded-r-lg"
                        >
                          <p className="text-sm font-bold text-gray-900">
                            {apt.reasonForVisit.length > 50
                              ? apt.reasonForVisit.substring(0, 50) + "..."
                              : apt.reasonForVisit}
                          </p>
                          <p className="text-xs text-gray-600">
                            Dr. {apt.doctorId.fullName}
                          </p>
                          <div className="flex items-center justify-between mt-1 mr-1">
                            <p className="text-xs text-gray-600">
                              {apt.aptDate} at {apt.appointmentTime}
                            </p>
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(apt.status)}`}
                            >
                              {apt.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alerts / Status */}
                  <div className="space-y-3">
                    {/* Follow-up Required */}
                    {new Date().getTime() -
                      new Date(stats.lastVisit).getTime() >
                      30 * 24 * 60 * 60 * 1000 && (
                      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-6 w-6 text-yellow-600 mt-1" />
                          <div>
                            <h4 className="text-sm font-bold text-yellow-900 uppercase">
                              ⚠️ Follow-up Required
                            </h4>
                            <p className="text-sm text-yellow-800 mt-1">
                              Last visit was over 30 days ago. Schedule a
                              follow-up appointment.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Allergies Box */}
                    {patientData.allergies.length > 0 && (
                      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
                          <div>
                            <h4 className="text-sm font-bold text-red-900 uppercase">
                              🚨 Known Allergies
                            </h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {patientData.allergies.map((allergy, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-red-100 text-red-800 text-sm font-bold rounded-full"
                                >
                                  {allergy}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Current Medications */}
                    {prescriptions.length > 0 && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <h4 className="flex gap-2 items-center text-sm font-bold text-purple-900 uppercase mb-2">
                          <Pill className="h-5 w-5" />
                          <span>Current Medications</span>
                        </h4>
                        <div className="space-y-2">
                          {prescriptions[0].medicines.map(
                            (med: any, idx: number) => (
                              <div
                                key={idx}
                                className="bg-white rounded-lg p-2 border border-purple-200"
                              >
                                <p className="text-sm font-semibold text-gray-900">
                                  {med.medicineName}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {med.dosage}mg • {med.frequency}x/day •{" "}
                                  {med.duration} days
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {/* Emergency Contact */}
                    {/* <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <h4 className="text-sm font-bold text-indigo-900 uppercase mb-3">
                        📞 Emergency Contact
                      </h4>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {patientData.emergencyContact.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {patientData.emergencyContact.phoneNo}
                        </p>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            )}

            {/* TIMELINE TAB */}
            {activeTab === "timeline" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Medical Timeline
                </h3>
                {Object.entries(groupedTimeline).map(([date, items]: any) => (
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
                          className={`border-l-4 pl-4 py-3 rounded-r-lg ${
                            item.type === "appointment"
                              ? "border-blue-400 bg-blue-50"
                              : item.type === "prescription"
                                ? "border-purple-400 bg-purple-50"
                                : item.type === "consultation"
                                  ? "border-green-400 bg-green-50"
                                  : "border-orange-400 bg-orange-50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {item.type === "appointment" && (
                                  <Calendar className="h-4 w-4 text-blue-600" />
                                )}
                                {item.type === "prescription" && (
                                  <Pill className="h-4 w-4 text-purple-600" />
                                )}
                                {item.type === "consultation" && (
                                  <Stethoscope className="h-4 w-4 text-green-600" />
                                )}
                                {item.type === "labTest" && (
                                  <FlaskRound className="h-4 w-4 text-orange-600" />
                                )}
                                <p className="text-xs font-semibold text-gray-600 uppercase">
                                  {item.type === "appointment"
                                    ? "Appointment"
                                    : item.type === "prescription"
                                      ? "Prescription"
                                      : item.type === "labTest"
                                        ? "Lab Reports"
                                        : "Consultation"}
                                </p>
                              </div>
                              <div className="text-sm font-semibold text-gray-900">
                                {item.type === "appointment" &&
                                  `${item.data.reasonForVisit} - ${item.data.status}`}
                                {item.type === "prescription" &&
                                  `${item.data.medicines.length} medicine(s) prescribed`}
                                {item.type === "labTest" &&
                                  item.data.tests.map((test) => (
                                    <div key={test._id}>
                                      {test.testName} - {test.status}
                                    </div>
                                  ))}
                                {item.type === "consultation" &&
                                  `${item.data.diagnosis}`}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                {item.type === "appointment" &&
                                  `Time: ${item.data.appointmentTime}`}
                                {item.type === "prescription" &&
                                  (item.data.dispensedAt
                                    ? `Dispensed on ${new Date(
                                        item.data.dispensedAt,
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}`
                                    : item.data.createdAt &&
                                      `Prescribed on ${new Date(
                                        item.data.createdAt,
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}`)}
                                {item.type === "labTest" &&
                                  `Ordered on ${new Date(
                                    item.data.createdAt,
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}`}
                                {item.type === "consultation" &&
                                  `${item.data.symptoms}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* APPOINTMENTS TAB */}
            {activeTab === "appointments" && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    Appointments History
                  </h3>
                  <select
                    value={appointmentFilter}
                    onChange={(e) => setAppointmentFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="Completed">Completed</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Shift
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredAppointments.map((apt) => (
                        <tr key={apt._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            {apt.aptDate.slice(0, 10)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {apt.appointmentTime}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full border ${getStatusColor(apt.status)}`}
                            >
                              {getStatusIcon(apt.status)}
                              {apt.status}
                            </span>
                          </td>
                          <td className="px-4 capitalize py-3 text-sm text-gray-900">
                            {apt.shift}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {apt.reasonForVisit.length > 100
                              ? apt.reasonForVisit.substring(0, 100) + "..."
                              : apt.reasonForVisit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PRESCRIPTIONS TAB */}
            {activeTab === "prescriptions" && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Prescription history
                </h3>

                {prescriptions.length === 0 ? (
                  <div className="text-center py-12">
                    <Pill className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 text-base">
                      No prescriptions found
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {prescriptions.map((pres) => {
                      const isExpanded = expanded === pres._id;
                      const status =
                        statusConfig[pres.status] ?? statusConfig["Pending"];

                      return (
                        <div
                          key={pres._id}
                          className="bg-white border border-gray-100 rounded-xl p-5"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              {pres.doctorId ? (
                                <img
                                  src={`${baseurl}/images/uploads/${pres.doctorId.photo}`}
                                  alt={pres.doctorId.fullName}
                                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-sm font-medium flex-shrink-0">
                                  {pres.doctorId.fullName
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
                                  Dr. {pres.doctorId.fullName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Issued{" "}
                                  {`${new Date(
                                    pres.createdAt,
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })} at ${new Date(
                                    pres.createdAt,
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
                                  setExpanded(isExpanded ? null : pres._id);
                                }}
                                className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 hover:bg-blue-100 transition-colors cursor-pointer"
                              >
                                {isExpanded ? "Hide Details" : "View details"}
                              </button>
                            </div>
                          </div>

                          {/* Medicines */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
                                Medicines ({pres.medicines.length})
                              </p>
                              <div className="flex flex-col gap-2">
                                {pres.medicines.map((med, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-gray-100"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-gray-400 w-4">
                                        {idx + 1}
                                      </span>
                                      <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center">
                                        <Pill className="h-4 w-4 text-green-500" />
                                      </div>
                                      <span className="text-sm font-medium text-gray-800">
                                        {med.medicineName}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {med.instructions}
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
                                          className="text-xs px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-500"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* LAB Reports TAB */}
            {activeTab === "labTests" && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Laboratory Test Reports
                </h3>
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
                      {labTests.flatMap((orders) =>
                        orders.tests.map((test: any) => (
                          <tr key={test._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                              {test.id_no}
                            </td>

                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                              {test.testName}
                            </td>

                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                              Dr. {orders.doctorId.fullName}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-700">
                              <div className="flex flex-col gap-1">
                                <p className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(
                                    orders.createdAt,
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                                <p className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {new Date(
                                    orders.createdAt,
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                  test.status,
                                )}`}
                              >
                                {test.status}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              {test.status === "Completed" ? (
                                <button
                                  onClick={() => {
                                    navigate(`/doctor/lab-test-reports`, {
                                      state: { testId: test.id_no },
                                    });
                                  }}
                                  className="text-sm flex items-center gap-1 font-medium text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                                >
                                  <Eye className="h-4 w-4" />
                                  View details
                                </button>
                              ) : (
                                <span className="text-sm text-gray-400">
                                  Awaiting results
                                </span>
                              )}
                            </td>
                          </tr>
                        )),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* NOTES TAB */}
            {activeTab === "notes" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Clinical Notes
                </h3>

                {/* Add Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-blue-900 mb-2">
                    Add New Note
                  </label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter clinical notes, observations, or recommendations..."
                  />
                  <button
                    onClick={handleSaveNote}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Save Note
                  </button>
                </div>

                {/* Notes List */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase">
                    Previous Notes
                  </h4>
                  {notes.map((note) => (
                    <div
                      key={note._id}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <FileText className="h-5 w-5 text-gray-400 mt-1" />
                        <span className="text-xs text-gray-500">
                          {new Date(note.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPatientProfile;
