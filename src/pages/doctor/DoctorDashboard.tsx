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
  Stethoscope,
  AlertCircle,
  Play,
  Eye,
  ArrowRight,
  Pill,
  FlaskRound,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  todayAppointments: number;
  pendingConsultations: number;
  completedToday: number;
  totalPatients: number;
  avgConsultationTime: string;
  completionRate: number;
}

interface NextPatient {
  _id: string;
  id_no: string;
  patientName: string;
  patientId: string;
  time: string;
  reason: string;
  status: string;
  patientPhoto?: string;
}

interface TodayAppointment {
  _id: string;
  id_no: string;
  patientName: string;
  patientId: string;
  time: string;
  reason: string;
  status: string;
  shift: string;
}

interface RecentActivity {
  _id: string;
  type: "consultation" | "prescription" | "labTest";
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

const DoctorDashboard = () => {
  const doctor = useSelector((state: any) => state.auth.user);
  const navigate = useNavigate();
  const baseurl = import.meta.env.VITE_BASE_URL;

  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    pendingConsultations: 0,
    completedToday: 0,
    totalPatients: 0,
    avgConsultationTime: "0 min",
    completionRate: 0,
  });

  const [nextPatients, setNextPatients] = useState<NextPatient[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<
    TodayAppointment[]
  >([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(
        `${baseurl}/api/doctor/dashboard/${doctor.id}`,
        {
          headers: {
            "auth-token": localStorage.getItem("authToken") || doctor?.token,
          },
        },
      );
      if (response.data.success) {
        setStats(response.data.stats);
        setNextPatients(response.data.nextPatients);
        setTodayAppointments(response.data.todayAppointments);
        setRecentActivity(response.data.recentActivity);
        setNotifications(response.data.notifications);
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error.message);
      toast.error(error.response?.data?.message || "Failed to load dashboard");
    }
  };

  useEffect(() => {
    if (doctor?.id) {
      fetchDashboardData();
    }

    // Sample data for demo
    setStats({
      todayAppointments: 12,
      pendingConsultations: 5,
      completedToday: 7,
      totalPatients: 30,
      avgConsultationTime: "15 min",
      completionRate: 85,
    });

    setNextPatients([
      {
        _id: "1",
        id_no: "APT-001",
        patientName: "Ali Khan",
        patientId: "PAT-001",
        time: "09:00 AM",
        reason: "Fever and body aches",
        status: "Confirmed",
      },
      {
        _id: "2",
        id_no: "APT-002",
        patientName: "Ahmed Raza",
        patientId: "PAT-002",
        time: "09:30 AM",
        reason: "Regular checkup",
        status: "Confirmed",
      },
      {
        _id: "3",
        id_no: "APT-003",
        patientName: "Sara Ali",
        patientId: "PAT-003",
        time: "10:00 AM",
        reason: "Headache and dizziness",
        status: "Confirmed",
      },
      {
        _id: "4",
        id_no: "APT-004",
        patientName: "Fatima Hassan",
        patientId: "PAT-004",
        time: "10:30 AM",
        reason: "Follow-up consultation",
        status: "Confirmed",
      },
      {
        _id: "5",
        id_no: "APT-005",
        patientName: "Hassan Ali",
        patientId: "PAT-005",
        time: "11:00 AM",
        reason: "Chest pain",
        status: "Confirmed",
      },
    ]);

    setTodayAppointments([
      {
        _id: "1",
        id_no: "APT-001",
        patientName: "Ali Khan",
        patientId: "PAT-001",
        time: "09:00 AM",
        reason: "Fever and body aches",
        status: "Confirmed",
        shift: "Morning",
      },
      {
        _id: "2",
        id_no: "APT-002",
        patientName: "Ahmed Raza",
        patientId: "PAT-002",
        time: "09:30 AM",
        reason: "Regular checkup",
        status: "Confirmed",
        shift: "Morning",
      },
      {
        _id: "3",
        id_no: "APT-003",
        patientName: "Sara Ali",
        patientId: "PAT-003",
        time: "10:00 AM",
        reason: "Headache and dizziness",
        status: "Completed",
        shift: "Morning",
      },
      {
        _id: "4",
        id_no: "APT-004",
        patientName: "Fatima Hassan",
        patientId: "PAT-004",
        time: "10:30 AM",
        reason: "Follow-up consultation",
        status: "Confirmed",
        shift: "Morning",
      },
      {
        _id: "5",
        id_no: "APT-005",
        patientName: "Hassan Ali",
        patientId: "PAT-005",
        time: "11:00 AM",
        reason: "Chest pain",
        status: "Confirmed",
        shift: "Morning",
      },
      {
        _id: "6",
        id_no: "APT-006",
        patientName: "Ayesha Malik",
        patientId: "PAT-006",
        time: "11:30 AM",
        reason: "Diabetes checkup",
        status: "Completed",
        shift: "Morning",
      },
    ]);

    setRecentActivity([
      {
        _id: "1",
        type: "consultation",
        patientName: "Sara Ali",
        action: "Completed consultation",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        _id: "2",
        type: "prescription",
        patientName: "Ahmed Raza",
        action: "Added prescription",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        _id: "3",
        type: "labTest",
        patientName: "Ali Khan",
        action: "Ordered lab test (CBC)",
        timestamp: new Date(Date.now() - 5400000).toISOString(),
      },
      {
        _id: "4",
        type: "consultation",
        patientName: "Ayesha Malik",
        action: "Completed consultation",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
    ]);

    setNotifications([
      {
        _id: "1",
        type: "lab_result",
        message: "Lab test completed for Ali Khan",
        timestamp: new Date(Date.now() - 900000).toISOString(),
        isRead: false,
      },
      {
        _id: "2",
        type: "prescription",
        message: "Prescription dispensed for Ahmed",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        isRead: false,
      },
      {
        _id: "3",
        type: "appointment",
        message: "New appointment scheduled for tomorrow",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: true,
      },
    ]);

    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [doctor?.id]);

  const handleStartConsultation = (appointmentId: string) => {
    navigate(`/doctor/appointments`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "consultation":
        return <Stethoscope className="h-4 w-4 text-green-600" />;
      case "prescription":
        return <Pill className="h-4 w-4 text-blue-600" />;
      case "labTest":
        return <FlaskRound className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const isCurrentAppointment = (time: string) => {
    const [hours, minutes] = time.split(":").map((t) => {
      const num = parseInt(t.replace(/\D/g, ""));
      return num;
    });
    const isPM = time.includes("PM");
    const appointmentHour = isPM && hours !== 12 ? hours + 12 : hours;
    const appointmentMinutes = minutes;

    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();

    const appointmentTimeInMinutes = appointmentHour * 60 + appointmentMinutes;
    const currentTimeInMinutes = currentHour * 60 + currentMinutes;

    // Highlight if within 30 minutes before or after
    return (
      Math.abs(appointmentTimeInMinutes - currentTimeInMinutes) <= 30 &&
      currentTimeInMinutes >= appointmentTimeInMinutes
    );
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Good{" "}
                {currentTime.getHours() < 12
                  ? "Morning"
                  : currentTime.getHours() < 18
                    ? "Afternoon"
                    : "Evening"}
                , Dr. {doctor?.fullName}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-blue-600">
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-sm text-gray-500">Current Time</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Today's Appointments */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
                <Calendar className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 opacity-70" />
            </div>
            <p className="text-blue-100 text-sm font-medium">
              Today's Appointments
            </p>
            <p className="text-4xl font-bold mt-2">{stats.todayAppointments}</p>
            <p className="text-blue-100 text-xs mt-2">Total scheduled</p>
          </div>

          {/* Pending Consultations */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-yellow-400 bg-opacity-30 p-3 rounded-full">
                <Clock className="h-6 w-6" />
              </div>
              <AlertCircle className="h-5 w-5 opacity-70" />
            </div>
            <p className="text-yellow-100 text-sm font-medium">
              Pending Consultations
            </p>
            <p className="text-4xl font-bold mt-2">
              {stats.pendingConsultations}
            </p>
            <p className="text-yellow-100 text-xs mt-2">
              Awaiting consultation
            </p>
          </div>

          {/* Completed Today */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-400 bg-opacity-30 p-3 rounded-full">
                <CheckCircle className="h-6 w-6" />
              </div>
              <TrendingUp className="h-5 w-5 opacity-70" />
            </div>
            <p className="text-green-100 text-sm font-medium">
              Completed Today
            </p>
            <p className="text-4xl font-bold mt-2">{stats.completedToday}</p>
            <p className="text-green-100 text-xs mt-2">
              {stats.completionRate}% completion rate
            </p>
          </div>

          {/* Total Patients */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-400 bg-opacity-30 p-3 rounded-full">
                <Users className="h-6 w-6" />
              </div>
              <Activity className="h-5 w-5 opacity-70" />
            </div>
            <p className="text-purple-100 text-sm font-medium">
              Total Patients
            </p>
            <p className="text-4xl font-bold mt-2">{stats.totalPatients}</p>
            <p className="text-purple-100 text-xs mt-2">
              Avg. {stats.avgConsultationTime} per patient
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Next Patients */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-blue-600" />
                  Next Patients
                </h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                  {nextPatients.length} waiting
                </span>
              </div>

              <div className="space-y-3">
                {nextPatients.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No upcoming patients</p>
                  </div>
                ) : (
                  nextPatients.map((patient, index) => (
                    <div
                      key={patient._id}
                      className={`border rounded-lg p-4 transition-all ${
                        isCurrentAppointment(patient.time)
                          ? "bg-green-50 border-green-400 border-2 shadow-lg"
                          : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-shrink-0">
                            <div
                              className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                isCurrentAppointment(patient.time)
                                  ? "bg-green-600 text-white animate-pulse"
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
                              {isCurrentAppointment(patient.time) && (
                                <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-semibold rounded-full animate-pulse">
                                  NOW
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {patient.reason}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {patient.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {patient.id_no}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartConsultation(patient._id)}
                          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                            isCurrentAppointment(patient.time)
                              ? "bg-green-600 text-white hover:bg-green-700 shadow-lg"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          <Play className="h-4 w-4" />
                          {isCurrentAppointment(patient.time)
                            ? "Start Now"
                            : "Start"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Today's Appointments List */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  Today's Appointments
                </h3>
                <button
                  onClick={() => navigate("/doctor/appointments")}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </button>
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
                    {todayAppointments.map((apt) => (
                      <tr
                        key={apt._id}
                        className={`hover:bg-gray-50 ${
                          isCurrentAppointment(apt.time) ? "bg-green-50" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {apt.time}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {apt.patientName}
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
                          {apt.status === "Confirmed" && (
                            <button
                              onClick={() => handleStartConsultation(apt._id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Start
                            </button>
                          )}
                          {apt.status === "Completed" && (
                            <span className="text-green-600 text-sm">
                              <CheckCircle className="h-4 w-4" />
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

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/doctor/appointments")}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Play className="h-5 w-5" />
                  Start Consultation
                </button>
                <button
                  onClick={() => navigate("/doctor/appointments")}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Calendar className="h-5 w-5" />
                  View Appointments
                </button>
                <button
                  onClick={() => navigate("/doctor/appointments")}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Users className="h-5 w-5" />
                  View Patients
                </button>
              </div>
            </div>

            {/* Notifications Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  Notifications
                </h3>
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              </div>
              <div className="space-y-3">
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
                        className={`mt-1 ${
                          notif.isRead ? "text-gray-400" : "text-blue-600"
                        }`}
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Recent Activity
              </h3>
              <div className="space-y-3">
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

            {/* Performance Snapshot */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Today
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100 text-sm">
                    Patients Handled
                  </span>
                  <span className="text-2xl font-bold">
                    {stats.completedToday}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100 text-sm">
                    Avg. Consultation
                  </span>
                  <span className="text-2xl font-bold">
                    {stats.avgConsultationTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100 text-sm">
                    Completion Rate
                  </span>
                  <span className="text-2xl font-bold">
                    {stats.completionRate}%
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

export default DoctorDashboard;
