import { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  Activity,
  Bell,
  TrendingUp,
  FileText,
  AlertCircle,
  ArrowRight,
  UserPlus,
  PhoneCall,
  ClipboardList,
  Stethoscope,
  XCircle,
  Search,
  DoorOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// import axiosInstance from "../../api/axiosInstance";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface DashboardStats {
  totalAppointmentsToday: number;
  patientsCheckedIn: number;
  patientsWaiting: number;
  appointmentsCancelled: number;
  newRegistrationsToday: number;
  avgWaitTime: string;
}

interface WaitingPatient {
  _id: string;
  id_no: string;
  patientName: string;
  patientId: string;
  checkInTime: string;
  appointmentTime: string;
  doctorName: string;
  status: "Waiting" | "With Doctor" | "Called";
  waitMinutes: number;
}

interface TodayAppointment {
  _id: string;
  id_no: string;
  patientName: string;
  doctorName: string;
  appointmentTime: string;
  reason: string;
  status: "Scheduled" | "Checked In" | "Completed" | "Cancelled" | "No Show";
  shift: string;
}

interface RecentActivity {
  _id: string;
  type: "check_in" | "registration" | "cancellation" | "reschedule" | "call";
  patientName: string;
  action: string;
  timestamp: string;
}

interface Notification {
  _id: string;
  type: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

// ─── Dummy Data ────────────────────────────────────────────────────────────────

const dummyStats: DashboardStats = {
  totalAppointmentsToday: 24,
  patientsCheckedIn: 17,
  patientsWaiting: 5,
  appointmentsCancelled: 2,
  newRegistrationsToday: 3,
  avgWaitTime: "18 min",
};

const dummyWaitingPatients: WaitingPatient[] = [
  {
    _id: "1",
    id_no: "PT-1021",
    patientName: "Ayesha Malik",
    patientId: "p1",
    checkInTime: "09:10 AM",
    appointmentTime: "09:00 AM",
    doctorName: "Dr. Usman Tariq",
    status: "Waiting",
    waitMinutes: 22,
  },
  {
    _id: "2",
    id_no: "PT-1034",
    patientName: "Bilal Ahmed",
    patientId: "p2",
    checkInTime: "09:25 AM",
    appointmentTime: "09:30 AM",
    doctorName: "Dr. Sara Noor",
    status: "Waiting",
    waitMinutes: 10,
  },
  {
    _id: "3",
    id_no: "PT-1047",
    patientName: "Fatima Zahra",
    patientId: "p3",
    checkInTime: "09:40 AM",
    appointmentTime: "09:45 AM",
    doctorName: "Dr. Usman Tariq",
    status: "With Doctor",
    waitMinutes: 0,
  },
  {
    _id: "4",
    id_no: "PT-1058",
    patientName: "Hassan Raza",
    patientId: "p4",
    checkInTime: "10:00 AM",
    appointmentTime: "10:00 AM",
    doctorName: "Dr. Kamran Ali",
    status: "Called",
    waitMinutes: 5,
  },
  {
    _id: "5",
    id_no: "PT-1062",
    patientName: "Sana Iqbal",
    patientId: "p5",
    checkInTime: "10:15 AM",
    appointmentTime: "10:15 AM",
    doctorName: "Dr. Sara Noor",
    status: "Waiting",
    waitMinutes: 8,
  },
];

const dummyAppointments: TodayAppointment[] = [
  {
    _id: "a1",
    id_no: "PT-1021",
    patientName: "Ayesha Malik",
    doctorName: "Dr. Usman Tariq",
    appointmentTime: "09:00 AM",
    reason: "Follow-up",
    status: "Checked In",
    shift: "Morning",
  },
  {
    _id: "a2",
    id_no: "PT-1034",
    patientName: "Bilal Ahmed",
    doctorName: "Dr. Sara Noor",
    appointmentTime: "09:30 AM",
    reason: "Fever & Cough",
    status: "Checked In",
    shift: "Morning",
  },
  {
    _id: "a3",
    id_no: "PT-1047",
    patientName: "Fatima Zahra",
    doctorName: "Dr. Usman Tariq",
    appointmentTime: "09:45 AM",
    reason: "Routine Checkup",
    status: "Completed",
    shift: "Morning",
  },
  {
    _id: "a4",
    id_no: "PT-1058",
    patientName: "Hassan Raza",
    doctorName: "Dr. Kamran Ali",
    appointmentTime: "10:00 AM",
    reason: "Blood Pressure",
    status: "Checked In",
    shift: "Morning",
  },
  {
    _id: "a5",
    id_no: "PT-1070",
    patientName: "Nadia Hussain",
    doctorName: "Dr. Sara Noor",
    appointmentTime: "10:30 AM",
    reason: "Skin Allergy",
    status: "Scheduled",
    shift: "Morning",
  },
  {
    _id: "a6",
    id_no: "PT-1083",
    patientName: "Tariq Mehmood",
    doctorName: "Dr. Kamran Ali",
    appointmentTime: "11:00 AM",
    reason: "Diabetes Review",
    status: "Cancelled",
    shift: "Morning",
  },
];

const dummyRecentActivity: RecentActivity[] = [
  {
    _id: "r1",
    type: "check_in",
    patientName: "Sana Iqbal",
    action: "Patient checked in",
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    _id: "r2",
    type: "registration",
    patientName: "Zaid Hamid",
    action: "New patient registered",
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
  },
  {
    _id: "r3",
    type: "cancellation",
    patientName: "Tariq Mehmood",
    action: "Appointment cancelled",
    timestamp: new Date(Date.now() - 34 * 60000).toISOString(),
  },
  {
    _id: "r4",
    type: "reschedule",
    patientName: "Amna Khalid",
    action: "Appointment rescheduled",
    timestamp: new Date(Date.now() - 52 * 60000).toISOString(),
  },
  {
    _id: "r5",
    type: "call",
    patientName: "Hassan Raza",
    action: "Patient called to doctor",
    timestamp: new Date(Date.now() - 65 * 60000).toISOString(),
  },
];

const dummyNotifications: Notification[] = [
  {
    _id: "n1",
    type: "alert",
    message: "Dr. Usman Tariq is running 15 min late for morning shift.",
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    isRead: false,
  },
  {
    _id: "n2",
    type: "info",
    message: "Ayesha Malik has been waiting for over 20 minutes.",
    timestamp: new Date(Date.now() - 22 * 60000).toISOString(),
    isRead: false,
  },
  {
    _id: "n3",
    type: "info",
    message: "New appointment booked for 2:00 PM — Waqas Javed.",
    timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
    isRead: true,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const ReceptionistDashboard = () => {
  const receptionist = useSelector((state: any) => state.auth.user);
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>(dummyStats);
  const [waitingPatients, setWaitingPatients] =
    useState<WaitingPatient[]>(dummyWaitingPatients);
  const [todayAppointments, setTodayAppointments] =
    useState<TodayAppointment[]>(dummyAppointments);
  const [recentActivity, setRecentActivity] =
    useState<RecentActivity[]>(dummyRecentActivity);
  const [notifications, setNotifications] =
    useState<Notification[]>(dummyNotifications);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  // ── Replace dummy fetches with real API calls ──────────────────────────────
  // const fetchDashboardData = async () => {
  //   try {
  //     const response = await axiosInstance.get("/receptionist/get-dashboard-data");
  //     if (response.data.success) {
  //       setStats(response.data.stats);
  //       setWaitingPatients(response.data.waitingPatients);
  //       setTodayAppointments(response.data.todayAppointments);
  //       setRecentActivity(response.data.recentActivity);
  //       setNotifications(response.data.notifications);
  //     }
  //   } catch (error: any) {
  //     toast.error(error.response?.data?.message || "Failed to load dashboard");
  //   }
  // };

  useEffect(() => {
    // fetchDashboardData();   // ← uncomment when backend is ready

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const formatTimeAgo = (timestamp: string) => {
    const diff = Math.floor(
      (Date.now() - new Date(timestamp).getTime()) / 1000,
    );
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Checked In":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Scheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "No Show":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getWaitingStatusColor = (status: string) => {
    switch (status) {
      case "With Doctor":
        return "bg-green-100 text-green-800 border-green-200";
      case "Called":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Waiting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "check_in":
        return <DoorOpen className="h-4 w-4 text-green-600" />;
      case "registration":
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      case "cancellation":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "reschedule":
        return <Calendar className="h-4 w-4 text-yellow-600" />;
      case "call":
        return <PhoneCall className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleCheckIn = (id_no: string) => {
    navigate("/receptionist/appointments", { state: { id_no } });
  };

  const handleCallPatient = (id_no: string) => {
    toast.success(`Patient ${id_no} has been called.`);
    // navigate or trigger API here
  };

  const filteredAppointments = todayAppointments.filter(
    (apt) =>
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.id_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen w-full bg-gray-50 p-3">
      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-blue-600">
                Good{" "}
                {currentTime.getHours() < 12
                  ? "Morning"
                  : currentTime.getHours() < 18
                    ? "Afternoon"
                    : "Evening"}
                , {receptionist?.fullName ?? "Receptionist"}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-blue-600">
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-sm text-gray-500">Current Time</p>
            </div>
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
          {/* Total Appointments */}
          <div className="bg-blue-100 rounded-lg shadow-lg p-4 text-blue-700">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-300 bg-opacity-30 p-2 rounded-full">
                <Calendar className="h-5 w-5" />
              </div>
              <ArrowRight className="h-5 w-5 opacity-70" />
            </div>
            <p className="text-blue-700 text-sm font-medium">
              Today's Appointments
            </p>
            <p className="text-2xl font-bold mt-2">
              {stats.totalAppointmentsToday}
            </p>
            <p className="text-blue-700 text-xs mt-2">Total scheduled</p>
          </div>

          {/* Patients Waiting */}
          <div className="bg-yellow-100 rounded-lg shadow-lg p-4 text-yellow-700">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-yellow-300 bg-opacity-30 p-2 rounded-full">
                <Clock className="h-5 w-5" />
              </div>
              <AlertCircle className="h-5 w-5 opacity-70" />
            </div>
            <p className="text-yellow-700 text-sm font-medium">
              Patients Waiting
            </p>
            <p className="text-2xl font-bold mt-2">{stats.patientsWaiting}</p>
            <p className="text-yellow-700 text-xs mt-2">
              Avg. wait: {stats.avgWaitTime}
            </p>
          </div>

          {/* Checked In */}
          <div className="bg-green-100 rounded-lg shadow-lg p-4 text-green-700">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-300 bg-opacity-30 p-2 rounded-full">
                <CheckCircle className="h-5 w-5" />
              </div>
              <TrendingUp className="h-5 w-5 opacity-70" />
            </div>
            <p className="text-green-700 text-sm font-medium">Checked In</p>
            <p className="text-2xl font-bold mt-2">{stats.patientsCheckedIn}</p>
            <p className="text-green-700 text-xs mt-2">
              {stats.appointmentsCancelled} cancelled today
            </p>
          </div>

          {/* New Registrations */}
          <div className="bg-purple-100 rounded-lg shadow-lg p-4 text-purple-700">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-300 bg-opacity-30 p-2 rounded-full">
                <UserPlus className="h-5 w-5" />
              </div>
              <Activity className="h-5 w-5 opacity-70" />
            </div>
            <p className="text-purple-700 text-sm font-medium">
              New Registrations
            </p>
            <p className="text-2xl font-bold mt-2">
              {stats.newRegistrationsToday}
            </p>
            <p className="text-purple-700 text-xs mt-2">Registered today</p>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* ── Left / Centre Column ── */}
          <div className="lg:col-span-2 space-y-3">
            {/* Waiting Room */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-blue-600" />
                  Waiting Room
                </h3>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                  {waitingPatients.filter((p) => p.status === "Waiting").length}{" "}
                  waiting
                </span>
              </div>

              <div className="space-y-3">
                {waitingPatients.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No patients in waiting room</p>
                  </div>
                ) : (
                  waitingPatients.map((patient, index) => (
                    <div
                      key={patient._id}
                      className={`border rounded-lg p-3 transition-all ${
                        patient.status === "With Doctor"
                          ? "bg-green-50 border-green-400 border-2 shadow-lg"
                          : patient.waitMinutes >= 20
                            ? "bg-red-50 border-red-300"
                            : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-shrink-0">
                            <div
                              className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                patient.status === "With Doctor"
                                  ? "bg-green-600 text-white"
                                  : patient.waitMinutes >= 20
                                    ? "bg-red-500 text-white animate-pulse"
                                    : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-lg font-bold text-gray-900">
                                {patient.patientName}
                              </p>
                              <span
                                className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getWaitingStatusColor(patient.status)}`}
                              >
                                {patient.status}
                              </span>
                              {patient.waitMinutes >= 20 &&
                                patient.status === "Waiting" && (
                                  <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded-full animate-pulse">
                                    LONG WAIT
                                  </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {patient.doctorName}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Appt: {patient.appointmentTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <DoorOpen className="h-3 w-3" />
                                In: {patient.checkInTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {patient.id_no}
                              </span>
                              {patient.status === "Waiting" && (
                                <span className="text-yellow-600 font-semibold">
                                  {patient.waitMinutes}m waiting
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {patient.status === "Waiting" && (
                            <button
                              onClick={() => handleCallPatient(patient.id_no)}
                              className="px-3 py-2 rounded-lg font-medium cursor-pointer flex items-center gap-2 transition-all bg-blue-600 text-white hover:bg-blue-700"
                            >
                              <PhoneCall className="h-4 w-4" />
                              Call
                            </button>
                          )}
                          {patient.status === "With Doctor" && (
                            <span className="px-3 py-2 rounded-lg flex items-center gap-2 bg-green-100 text-green-700 text-sm font-medium">
                              <Stethoscope className="h-4 w-4" />
                              In Consultation
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Today's Appointments Table */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  Today's Appointments
                </h3>
                <button
                  onClick={() => navigate("/receptionist/appointments")}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient, ID, or doctor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Patient
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Doctor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Reason
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAppointments.map((apt) => (
                      <tr key={apt._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {apt.appointmentTime}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">
                            {apt.patientName}
                          </p>
                          <p className="text-xs text-gray-500">{apt.id_no}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {apt.doctorName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {apt.reason}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(apt.status)}`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {apt.status === "Scheduled" && (
                            <button
                              onClick={() => handleCheckIn(apt.id_no)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-semibold cursor-pointer flex items-center gap-1"
                            >
                              <DoorOpen className="h-4 w-4" />
                              Check In
                            </button>
                          )}
                          {apt.status === "Checked In" && (
                            <span className="text-green-600 text-xs flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Done
                            </span>
                          )}
                          {apt.status === "Completed" && (
                            <span className="text-gray-400 text-xs flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-3">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/receptionist/register-patient")}
                  className="w-full px-4 py-3 bg-blue-600 cursor-pointer duration-300 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <UserPlus className="h-5 w-5" />
                  Register New Patient
                </button>
                <button
                  onClick={() => navigate("/receptionist/appointments/new")}
                  className="w-full px-4 py-3 bg-gray-100 cursor-pointer duration-300 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <ClipboardList className="h-5 w-5" />
                  Book Appointment
                </button>
                <button
                  onClick={() => navigate("/receptionist/appointments")}
                  className="w-full px-4 py-3 bg-gray-100 cursor-pointer duration-300 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Calendar className="h-5 w-5" />
                  View Appointments
                </button>
                <button
                  onClick={() => navigate("/receptionist/patients")}
                  className="w-full px-4 py-3 bg-gray-100 cursor-pointer duration-300 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Users className="h-5 w-5" />
                  View Patients
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  Notifications
                </h3>
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              </div>
              <div className="space-y-2">
                {notifications.slice(0, 3).map((notif) => (
                  <div
                    key={notif._id}
                    className={`p-3 rounded-lg border ${
                      notif.isRead
                        ? "bg-gray-50 border-gray-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`mt-1 ${notif.isRead ? "text-gray-400" : "text-blue-600"}`}
                      >
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(notif.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
                View All Notifications
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Recent Activity
              </h3>
              <div className="space-y-2">
                {recentActivity.map((activity) => (
                  <div
                    key={activity._id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="mt-1">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {activity.patientName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desk Summary */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-4 text-white">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Desk Summary
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100 text-sm">
                    Checked In Today
                  </span>
                  <span className="text-xl font-bold">
                    {stats.patientsCheckedIn}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100 text-sm">
                    New Registrations
                  </span>
                  <span className="text-xl font-bold">
                    {stats.newRegistrationsToday}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100 text-sm">
                    Avg. Wait Time
                  </span>
                  <span className="text-xl font-bold">{stats.avgWaitTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100 text-sm">Cancellations</span>
                  <span className="text-xl font-bold">
                    {stats.appointmentsCancelled}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
