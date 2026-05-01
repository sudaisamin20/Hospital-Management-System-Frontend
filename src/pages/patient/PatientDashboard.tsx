import {
  Calendar,
  Activity,
  FileText,
  CreditCard,
  Clock,
  Heart,
  Thermometer,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Users,
  CalendarMinus,
  DollarSign,
} from "lucide-react";
import { useSelector } from "react-redux";
import { StatsCard } from "../../components/index";
import type { IStateData } from "../../features";
import {
  getPatientDashboardDataApi,
  type DashboardData,
  type RecentActivity,
} from "../../api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { getFormatDate } from "../../helpers/index";

const formatRelativeTime = (isoString: string): string => {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
};

const getInitials = (name: string): string =>
  name
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const getActivityIcon = (type: RecentActivity["type"]) => {
  switch (type) {
    case "appointment":
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "prescription":
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    case "lab":
      return <CheckCircle className="w-5 h-5 text-blue-500" />;
    default:
      return <AlertCircle className="w-5 h-5 text-gray-400" />;
  }
};

const getActivityTitle = (type: RecentActivity["type"]) => {
  switch (type) {
    case "appointment":
      return "Consultation Completed";
    case "prescription":
      return "Prescription Dispensed";
    case "lab":
      return "Lab Test Completed";
  }
};

const PatientDashboard = () => {
  const patient = useSelector((state: IStateData) => state.auth.user);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const navigate: NavigateFunction = useNavigate();

  const fetchPatientDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getPatientDashboardDataApi();
      if (response.data.success) {
        setDashboardData({
          stats: response.data.stats,
          trends: response.data.trends,
          upcomingAppointments: response.data.upcomingAppointments,
          recentActivity: response.data.recentActivity,
          healthMetrics: response.data.healthMetrics,
          notifications: response.data.notifications,
        });
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error.message);
      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patient?.id) {
      fetchPatientDashboardData();
    }
  }, [patient?.id]);

  // ── Stats wired to API + trend labels ─────────────────────────────────────
  const stats = dashboardData
    ? [
        {
          label: "Upcoming Appointments",
          value: String(dashboardData.stats.upcomingAppointmentCount),
          icon: Calendar,
          icon2: Clock,
          color: "yellow",
          label2: dashboardData.trends.upcomingAppointments.label,
          trendUp: dashboardData.trends.upcomingAppointments.direction === "up",
        },
        {
          label: "Medical Records",
          value: String(dashboardData.stats.totalMedicalRecords),
          icon: FileText,
          icon2: Users,
          color: "blue",
          label2: dashboardData.trends.medicalRecords.label,
          trendUp: dashboardData.trends.medicalRecords.direction === "up",
        },
        {
          label: "Active Prescriptions",
          value: String(dashboardData.stats.activePrescriptions),
          icon: Activity,
          icon2: CalendarMinus,
          color: "purple",
          label2: dashboardData.trends.activePrescriptions.label,
          trendUp: dashboardData.trends.activePrescriptions.direction === "up",
        },
        {
          label: "Outstanding Bills",
          value: `$${dashboardData.stats.outstandingBills}`,
          icon: CreditCard,
          icon2: DollarSign,
          color: "green",
          label2: "Due amount",
          trendUp: false,
        },
      ]
    : [];

  // ── Health metrics wired to API ────────────────────────────────────────────
  const hm = dashboardData?.healthMetrics;

  const healthMetrics = [
    {
      label: "Blood Pressure",
      value: hm?.bloodPressure ?? "—",
      unit: hm?.bloodPressure ? "mmHg" : "",
      status: hm?.bloodPressure ? "Normal" : "No data",
      icon: <Heart className="w-5 h-5" />,
      color: hm?.bloodPressure ? "text-green-600" : "text-gray-400",
      bgColor: hm?.bloodPressure ? "bg-green-50" : "bg-gray-50",
    },
    {
      label: "Heart Rate",
      value: hm?.heartRate != null ? String(hm.heartRate) : "—",
      unit: hm?.heartRate != null ? "bpm" : "",
      status: hm?.heartRate != null ? "Normal" : "No data",
      icon: <Activity className="w-5 h-5" />,
      color: hm?.heartRate != null ? "text-green-600" : "text-gray-400",
      bgColor: hm?.heartRate != null ? "bg-green-50" : "bg-gray-50",
    },
    {
      label: "Temperature",
      value: hm?.temperature != null ? String(hm.temperature) : "—",
      unit: hm?.temperature != null ? "°F" : "",
      status: hm?.temperature != null ? "Normal" : "No data",
      icon: <Thermometer className="w-5 h-5" />,
      color: hm?.temperature != null ? "text-green-600" : "text-gray-400",
      bgColor: hm?.temperature != null ? "bg-green-50" : "bg-gray-50",
    },
    {
      label: "Weight",
      value: hm?.weight != null ? String(hm.weight) : "—",
      unit: hm?.weight != null ? "lbs" : "",
      status: hm?.weight != null ? "Stable" : "No data",
      icon: <TrendingUp className="w-5 h-5" />,
      color: hm?.weight != null ? "text-blue-600" : "text-gray-400",
      bgColor: hm?.weight != null ? "bg-blue-50" : "bg-gray-50",
    },
  ];

  if (loading) {
    return <Spinner title="Loading dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="text-blue-600 mb-3">
          <h1 className="text-2xl font-bold mb-1">
            Welcome back, {patient?.fullName}!
          </h1>
          <p className="text-blue-500 text-sm">
            Here's your health overview for today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              index={index}
              statType="dashboard"
              label={stat.label}
              color={stat.color}
              icon={stat.icon}
              icon2={stat.icon2}
              value={stat.value}
              label2={stat.label2}
              trendUp={stat.trendUp}
            />
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Upcoming Appointments
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {dashboardData?.upcomingAppointments.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">
                  No upcoming appointments
                </p>
              )}
              {dashboardData?.upcomingAppointments.map((apt, index) => (
                <div
                  key={apt._id ?? index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                      {getInitials(apt.doctorName)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {apt.doctorName}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {apt.shift} Shift
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {getFormatDate(apt.date)}
                    </p>
                    <p className="text-sm text-gray-500">{apt.time}</p>
                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/patient/book-appointment")}
              className="w-full cursor-pointer mt-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Book New Appointment
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-600" />
              Recent Activity
            </h2>

            <div className="space-y-2">
              {dashboardData?.recentActivity.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">
                  No recent activity
                </p>
              )}
              {dashboardData?.recentActivity.map(
                (activity: RecentAc, index: number) => (
                  <div
                    key={activity._id ?? index}
                    className="flex gap-3 pb-4 border-b border-gray-200 last:border-0"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-800">
                        {getActivityTitle(activity.type)}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatRelativeTime(activity.time)}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Health Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Heart className="w-6 h-6 text-blue-600" />
              Latest Health Metrics
            </h2>
            {hm?.recordedAt && (
              <p className="text-xs text-gray-400">
                Recorded {formatRelativeTime(hm.recordedAt)}
              </p>
            )}
          </div>

          {!hm ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No health metrics recorded yet
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {healthMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                      <span className={metric.color}>{metric.icon}</span>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${metric.bgColor} ${metric.color}`}
                    >
                      {metric.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {metric.value}
                    {metric.unit && (
                      <span className="text-sm text-gray-500 ml-1">
                        {metric.unit}
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
