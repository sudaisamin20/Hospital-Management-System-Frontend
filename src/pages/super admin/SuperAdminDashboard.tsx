import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Building2,
  Activity,
  TrendingUp,
  DollarSign,
  Calendar,
  Settings,
  BarChart3,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
} from "lucide-react";

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Stats Data
  const stats = [
    {
      title: "Total Users",
      value: "1,248",
      change: "+12.5%",
      icon: <Users className="w-6 h-6" />,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: "up",
    },
    {
      title: "Active Doctors",
      value: "156",
      change: "+8",
      icon: <Activity className="w-6 h-6" />,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      trend: "up",
    },
    {
      title: "Total Revenue",
      value: "$284.5K",
      change: "+18.2%",
      icon: <DollarSign className="w-6 h-6" />,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      trend: "up",
    },
    {
      title: "Appointments Today",
      value: "324",
      change: "-5.2%",
      icon: <Calendar className="w-6 h-6" />,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      trend: "down",
    },
  ];

  // Recent Users Data
  const recentUsers = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      email: "sarah.j@hospital.com",
      role: "Doctor",
      department: "Cardiology",
      status: "Active",
      joinDate: "Feb 10, 2024",
    },
    {
      id: 2,
      name: "John Smith",
      email: "john.smith@email.com",
      role: "Patient",
      department: "N/A",
      status: "Active",
      joinDate: "Feb 08, 2024",
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emily.d@hospital.com",
      role: "Receptionist",
      department: "Front Desk",
      status: "Active",
      joinDate: "Feb 05, 2024",
    },
    {
      id: 4,
      name: "Michael Chen",
      email: "michael.c@hospital.com",
      role: "Doctor",
      department: "Neurology",
      status: "Inactive",
      joinDate: "Jan 28, 2024",
    },
  ];

  // System Health Data
  const systemHealth = [
    {
      service: "API Server",
      status: "Operational",
      uptime: "99.9%",
      responseTime: "45ms",
      type: "success",
    },
    {
      service: "Database",
      status: "Operational",
      uptime: "99.8%",
      responseTime: "12ms",
      type: "success",
    },
    {
      service: "Payment Gateway",
      status: "Degraded",
      uptime: "97.2%",
      responseTime: "320ms",
      type: "warning",
    },
    {
      service: "Email Service",
      status: "Operational",
      uptime: "100%",
      responseTime: "102ms",
      type: "success",
    },
  ];

  // Recent Activities
  const recentActivities = [
    {
      user: "Dr. Sarah Johnson",
      action: "Created new patient record",
      time: "5 minutes ago",
      type: "create",
    },
    {
      user: "Admin",
      action: "Updated system settings",
      time: "15 minutes ago",
      type: "update",
    },
    {
      user: "Emily Davis",
      action: "Registered new patient",
      time: "1 hour ago",
      type: "create",
    },
    {
      user: "System",
      action: "Backup completed successfully",
      time: "2 hours ago",
      type: "system",
    },
    {
      user: "Michael Chen",
      action: "Account deactivated",
      time: "3 hours ago",
      type: "delete",
    },
  ];

  // Department Performance
  const departments = [
    { name: "Cardiology", patients: 245, revenue: "$45.2K", rating: 4.8 },
    { name: "Neurology", patients: 189, revenue: "$38.5K", rating: 4.7 },
    { name: "Pediatrics", patients: 312, revenue: "$42.8K", rating: 4.9 },
    { name: "Orthopedics", patients: 178, revenue: "$35.6K", rating: 4.6 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
              </div>
              <p className="text-blue-100">
                Smart Hospital Management System - Complete Control Center
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <button className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-2 font-medium">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>
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
                <div className="flex items-center gap-1">
                  <TrendingUp
                    className={`w-4 h-4 ${
                      stat.trend === "up" ? "text-green-500" : "text-red-500"
                    } ${stat.trend === "down" && "rotate-180"}`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {[
                {
                  id: "overview",
                  label: "Overview",
                  icon: <BarChart3 className="w-4 h-4" />,
                },
                {
                  id: "users",
                  label: "User Management",
                  icon: <Users className="w-4 h-4" />,
                },
                {
                  id: "system",
                  label: "System Health",
                  icon: <Activity className="w-4 h-4" />,
                },
                {
                  id: "departments",
                  label: "Departments",
                  icon: <Building2 className="w-4 h-4" />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Recent Activities */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Recent Activities
                  </h3>
                  <div className="space-y-3">
                    {recentActivities.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex-shrink-0 mt-1">
                          {activity.type === "create" && (
                            <Plus className="w-5 h-5 text-green-500" />
                          )}
                          {activity.type === "update" && (
                            <Edit className="w-5 h-5 text-blue-500" />
                          )}
                          {activity.type === "delete" && (
                            <Trash2 className="w-5 h-5 text-red-500" />
                          )}
                          {activity.type === "system" && (
                            <Settings className="w-5 h-5 text-purple-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            <span className="font-semibold">
                              {activity.user}
                            </span>{" "}
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        title: "Add New User",
                        icon: <UserPlus className="w-5 h-5" />,
                      },
                      {
                        title: "Generate Report",
                        icon: <BarChart3 className="w-5 h-5" />,
                      },
                      {
                        title: "System Backup",
                        icon: <Download className="w-5 h-5" />,
                      },
                      {
                        title: "Manage Roles",
                        icon: <Shield className="w-5 h-5" />,
                      },
                    ].map((action, index) => (
                      <button
                        key={index}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center gap-3 font-medium"
                      >
                        {action.icon}
                        {action.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <UserPlus className="w-4 h-4" />
                    Add User
                  </button>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Join Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.joinDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button className="text-blue-600 hover:text-blue-800">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-800">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-800">
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-800">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* System Health Tab */}
            {activeTab === "system" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  System Services Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {systemHealth.map((service, index) => (
                    <div
                      key={index}
                      className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800">
                          {service.service}
                        </h4>
                        {service.type === "success" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Status:</span>
                          <span
                            className={`font-medium ${
                              service.type === "success"
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {service.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Uptime:</span>
                          <span className="font-medium text-gray-800">
                            {service.uptime}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Response Time:</span>
                          <span className="font-medium text-gray-800">
                            {service.responseTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Departments Tab */}
            {activeTab === "departments" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Department Performance
                  </h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    Add Department
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {departments.map((dept, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all"
                    >
                      <h4 className="text-xl font-bold text-gray-800 mb-4">
                        {dept.name}
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Patients:</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {dept.patients}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            Monthly Revenue:
                          </span>
                          <span className="text-xl font-bold text-green-600">
                            {dept.revenue}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Rating:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xl font-bold text-yellow-500">
                              ★
                            </span>
                            <span className="font-bold text-gray-800">
                              {dept.rating}
                            </span>
                          </div>
                        </div>
                      </div>
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

export default SuperAdminDashboard;
