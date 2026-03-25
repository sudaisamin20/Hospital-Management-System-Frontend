import {
  Calendar,
  Activity,
  FileText,
  CreditCard,
  Clock,
  User,
  Heart,
  Thermometer,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useSelector } from "react-redux";

const PatientDashboard = () => {
  const patient = useSelector((state: any) => state.auth);
  console.log("Authenticated Patient Data:", patient);
  const stats = [
    {
      title: "Upcoming Appointments",
      value: "3",
      icon: <Calendar className="w-6 h-6" />,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: "+2 this week",
      trendUp: true,
    },
    {
      title: "Medical Records",
      value: "24",
      icon: <FileText className="w-6 h-6" />,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: "5 recent",
      trendUp: false,
    },
    {
      title: "Active Prescriptions",
      value: "5",
      icon: <Activity className="w-6 h-6" />,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: "2 expiring soon",
      trendUp: false,
    },
    {
      title: "Outstanding Bills",
      value: "$245",
      icon: <CreditCard className="w-6 h-6" />,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: "Due in 5 days",
      trendUp: false,
    },
  ];

  const upcomingAppointments = [
    {
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      date: "Feb 15, 2024",
      time: "10:00 AM",
      status: "Confirmed",
      avatar: "SJ",
    },
    {
      doctor: "Dr. Michael Chen",
      specialty: "Dermatologist",
      date: "Feb 18, 2024",
      time: "2:30 PM",
      status: "Pending",
      avatar: "MC",
    },
    {
      doctor: "Dr. Emily Williams",
      specialty: "General Physician",
      date: "Feb 22, 2024",
      time: "11:15 AM",
      status: "Confirmed",
      avatar: "EW",
    },
  ];

  const healthMetrics = [
    {
      label: "Blood Pressure",
      value: "120/80",
      unit: "mmHg",
      status: "Normal",
      icon: <Heart className="w-5 h-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Heart Rate",
      value: "72",
      unit: "bpm",
      status: "Normal",
      icon: <Activity className="w-5 h-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Temperature",
      value: "98.6",
      unit: "°F",
      status: "Normal",
      icon: <Thermometer className="w-5 h-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Weight",
      value: "165",
      unit: "lbs",
      status: "Stable",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  const recentActivities = [
    {
      title: "Lab Results Available",
      description: "Blood test results are now available",
      time: "2 hours ago",
      type: "success",
    },
    {
      title: "Prescription Refill Reminder",
      description: "Medication expires in 3 days",
      time: "5 hours ago",
      type: "warning",
    },
    {
      title: "Appointment Confirmed",
      description: "Dr. Sarah Johnson - Feb 15, 10:00 AM",
      time: "1 day ago",
      type: "info",
    },
    {
      title: "Bill Payment Received",
      description: "Payment of $150 processed successfully",
      time: "2 days ago",
      type: "success",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Welcome back, John!</h1>
          <p className="text-blue-100">Here's your health overview for today</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <span className={stat.iconColor}>{stat.icon}</span>
                </div>
                {stat.trendUp ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-gray-800 mb-2">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500">{stat.trend}</p>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Upcoming Appointments - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                      {appointment.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {appointment.doctor}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {appointment.specialty}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {appointment.date}
                    </p>
                    <p className="text-sm text-gray-500">{appointment.time}</p>
                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              Book New Appointment
            </button>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-600" />
              Recent Activity
            </h2>

            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex gap-3 pb-4 border-b border-gray-200 last:border-0"
                >
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === "success" ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : activity.type === "warning" ? (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-800">
                      {activity.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Heart className="w-6 h-6 text-blue-600" />
            Latest Health Metrics
          </h2>

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
                  <span className="text-sm text-gray-500 ml-1">
                    {metric.unit}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "View Medical Records",
              icon: <FileText className="w-6 h-6" />,
              color: "bg-blue-600 hover:bg-blue-700",
            },
            {
              title: "Prescription Refill",
              icon: <Activity className="w-6 h-6" />,
              color: "bg-blue-600 hover:bg-blue-700",
            },
            {
              title: "Pay Bills",
              icon: <CreditCard className="w-6 h-6" />,
              color: "bg-blue-600 hover:bg-blue-700",
            },
            {
              title: "Update Profile",
              icon: <User className="w-6 h-6" />,
              color: "bg-blue-600 hover:bg-blue-700",
            },
          ].map((action, index) => (
            <button
              key={index}
              className={`${action.color} text-white p-4 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center gap-3`}
            >
              {action.icon}
              <span className="font-medium">{action.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
