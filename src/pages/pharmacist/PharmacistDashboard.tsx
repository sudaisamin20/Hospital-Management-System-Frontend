import { useState, useEffect } from "react";
import {
  Package,
  Pill,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Clock,
  FileText,
  ShoppingCart,
  Users,
  Activity,
  Eye,
  ArrowRight,
  TrendingDown,
  BarChart3,
  Percent,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

interface DashboardStats {
  totalMedicines: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringCount: number;
  expiredCount: number;
  pendingPrescriptions: number;
  dispensedToday: number;
  dispensedThisWeek: number;
  dispensedThisMonth: number;
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  totalInventoryValue: number;
  avgPrescriptionValue: number;
  totalPatients: number;
}

interface RecentActivity {
  _id: string;
  type: "dispensed" | "added" | "updated";
  medicineName: string;
  quantity?: number;
  amount?: number;
  patientName?: string;
  paymentMethod?: string;
  timestamp: string;
}

interface LowStockMedicine {
  _id: string;
  name: string;
  stockQuantity: number;
  genericName: string;
  price: number;
  brand: string;
}

interface ExpiringMedicine {
  _id: string;
  name: string;
  expiryDate: string;
  stockQuantity: number;
  daysUntilExpiry: number;
  batchNumber: string;
  brand: string;
}

interface TopSellingMedicine {
  _id: string;
  name: string;
  quantitySold: number;
  revenue: number;
  genericName: string;
}

interface RecentPrescription {
  _id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  medicineCount: number;
  createdAt: string;
  status: "Pending" | "Dispensed";
}

const PharmacistDashboard = () => {
  const navigate = useNavigate();
  const pharmacist = useSelector((state: any) => state.auth.user);
  const [stats, setStats] = useState<DashboardStats>({
    totalMedicines: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    expiringCount: 0,
    expiredCount: 0,
    pendingPrescriptions: 0,
    dispensedToday: 0,
    dispensedThisWeek: 0,
    dispensedThisMonth: 0,
    todayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    totalInventoryValue: 0,
    avgPrescriptionValue: 0,
    totalPatients: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );
  const [lowStockMedicines, setLowStockMedicines] = useState<
    LowStockMedicine[]
  >([]);
  const [expiringMedicines, setExpiringMedicines] = useState<
    ExpiringMedicine[]
  >([]);
  const [topSellingMedicines, setTopSellingMedicines] = useState<
    TopSellingMedicine[]
  >([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState<
    RecentPrescription[]
  >([]);
  const baseurl = import.meta.env.VITE_BASE_URL;

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(
        `${baseurl}/api/pharmacist/dashboard/${pharmacist.id}`,
      );
      if (response.data.success) {
        setStats(response.data.stats);
        setRecentActivities(response.data.recentActivities);
        setLowStockMedicines(response.data.lowStockMedicines);
        setExpiringMedicines(response.data.expiringMedicines);
        setTopSellingMedicines(response.data.topSellingMedicines);
        setRecentPrescriptions(response.data.recentPrescriptions);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching dashboard data:", error.message);
      }
    }
  };

  useEffect(() => {
    // fetchDashboardData();

    // Sample data for demo
    setStats({
      totalMedicines: 248,
      lowStockCount: 12,
      outOfStockCount: 3,
      expiringCount: 8,
      expiredCount: 2,
      pendingPrescriptions: 15,
      dispensedToday: 28,
      dispensedThisWeek: 156,
      dispensedThisMonth: 542,
      todayRevenue: 2840.5,
      weeklyRevenue: 18420.25,
      monthlyRevenue: 45620.75,
      totalInventoryValue: 125840.0,
      avgPrescriptionValue: 101.45,
      totalPatients: 1248,
    });

    setRecentActivities([
      {
        _id: "1",
        type: "dispensed",
        medicineName: "Amoxicillin 500mg",
        quantity: 14,
        amount: 280,
        patientName: "John Doe",
        paymentMethod: "Cash",
        timestamp: new Date().toISOString(),
      },
      {
        _id: "2",
        type: "added",
        medicineName: "Paracetamol 500mg",
        quantity: 200,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        _id: "3",
        type: "dispensed",
        medicineName: "Ibuprofen 400mg",
        quantity: 10,
        amount: 150,
        patientName: "Jane Smith",
        paymentMethod: "Card",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        _id: "4",
        type: "dispensed",
        medicineName: "Omeprazole 20mg",
        quantity: 7,
        amount: 140,
        patientName: "Robert Brown",
        paymentMethod: "Cash",
        timestamp: new Date(Date.now() - 10800000).toISOString(),
      },
    ]);

    setLowStockMedicines([
      {
        _id: "1",
        name: "Aspirin 75mg",
        stockQuantity: 15,
        genericName: "Acetylsalicylic Acid",
        price: 8.5,
        brand: "Bayer",
      },
      {
        _id: "2",
        name: "Metformin 500mg",
        stockQuantity: 22,
        genericName: "Metformin",
        price: 12.0,
        brand: "GSK",
      },
      {
        _id: "3",
        name: "Lisinopril 10mg",
        stockQuantity: 8,
        genericName: "Lisinopril",
        price: 15.5,
        brand: "Pfizer",
      },
      {
        _id: "4",
        name: "Atorvastatin 20mg",
        stockQuantity: 18,
        genericName: "Atorvastatin",
        price: 22.0,
        brand: "Lipitor",
      },
    ]);

    setExpiringMedicines([
      {
        _id: "1",
        name: "Cetirizine 10mg",
        expiryDate: "2026-04-15",
        stockQuantity: 45,
        daysUntilExpiry: 43,
        batchNumber: "B2024-045",
        brand: "Zyrtec",
      },
      {
        _id: "2",
        name: "Omeprazole 20mg",
        expiryDate: "2026-05-20",
        stockQuantity: 30,
        daysUntilExpiry: 78,
        batchNumber: "B2024-067",
        brand: "Prilosec",
      },
      {
        _id: "3",
        name: "Amoxicillin 250mg",
        expiryDate: "2026-04-01",
        stockQuantity: 60,
        daysUntilExpiry: 29,
        batchNumber: "B2024-023",
        brand: "Amoxil",
      },
    ]);

    setTopSellingMedicines([
      {
        _id: "1",
        name: "Paracetamol 500mg",
        quantitySold: 342,
        revenue: 3420.0,
        genericName: "Paracetamol",
      },
      {
        _id: "2",
        name: "Amoxicillin 500mg",
        quantitySold: 218,
        revenue: 4360.0,
        genericName: "Amoxicillin",
      },
      {
        _id: "3",
        name: "Ibuprofen 400mg",
        quantitySold: 195,
        revenue: 2925.0,
        genericName: "Ibuprofen",
      },
      {
        _id: "4",
        name: "Omeprazole 20mg",
        quantitySold: 156,
        revenue: 3120.0,
        genericName: "Omeprazole",
      },
    ]);

    setRecentPrescriptions([
      {
        _id: "1",
        patientName: "Sarah Johnson",
        patientId: "PAT-1045",
        doctorName: "Dr. Michael Chen",
        medicineCount: 3,
        createdAt: new Date().toISOString(),
        status: "Pending",
      },
      {
        _id: "2",
        patientName: "David Williams",
        patientId: "PAT-1046",
        doctorName: "Dr. Emily Watson",
        medicineCount: 2,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        status: "Pending",
      },
      {
        _id: "3",
        patientName: "Maria Garcia",
        patientId: "PAT-1047",
        doctorName: "Dr. James Miller",
        medicineCount: 4,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        status: "Pending",
      },
    ]);
  }, []);

  const mainStats = [
    {
      label: "Total Medicines",
      value: stats.totalMedicines,
      subValue: `$${stats.totalInventoryValue.toFixed(0)}`,
      subLabel: "Total Value",
      icon: Package,
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      link: "/pharmacist/inventory",
    },
    {
      label: "Pending Prescriptions",
      value: stats.pendingPrescriptions,
      subValue: `${stats.avgPrescriptionValue.toFixed(2)}`,
      subLabel: "Avg Value",
      icon: FileText,
      color: "yellow",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
      link: "/pharmacist/prescriptions",
    },
    {
      label: "Dispensed Today",
      value: stats.dispensedToday,
      subValue: `${stats.dispensedThisWeek} this week`,
      subLabel: "",
      icon: ShoppingCart,
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      link: "/pharmacist/dispensed-history",
    },
    {
      label: "Today's Revenue",
      value: `$${stats.todayRevenue.toFixed(2)}`,
      subValue: `$${stats.weeklyRevenue.toFixed(0)}`,
      subLabel: "This Week",
      icon: DollarSign,
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      link: "/pharmacist/dispensed-history",
    },
  ];

  const alertStats = [
    {
      label: "Low Stock Items",
      value: stats.lowStockCount,
      icon: AlertTriangle,
      color: "orange",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
      description: "Reorder needed",
    },
    {
      label: "Out of Stock",
      value: stats.outOfStockCount,
      icon: AlertTriangle,
      color: "red",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      description: "Urgent action",
    },
    {
      label: "Expiring Soon",
      value: stats.expiringCount,
      icon: Calendar,
      color: "amber",
      bgColor: "bg-amber-100",
      textColor: "text-amber-600",
      description: "Within 90 days",
    },
    {
      label: "Expired",
      value: stats.expiredCount,
      icon: AlertTriangle,
      color: "red",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      description: "Remove immediately",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "dispensed":
        return <ShoppingCart className="h-4 w-4 text-green-600" />;
      case "added":
        return <Package className="h-4 w-4 text-blue-600" />;
      case "updated":
        return <Activity className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "dispensed":
        return "bg-green-50 border-green-200";
      case "added":
        return "bg-blue-50 border-blue-200";
      case "updated":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "Cash":
        return "bg-green-100 text-green-700";
      case "Card":
        return "bg-blue-100 text-blue-700";
      case "Insurance":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
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

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Pharmacist Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {pharmacist?.fullName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Main Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {mainStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                onClick={() => navigate(stat.link)}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`${stat.bgColor} p-3 rounded-full`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm font-medium">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${stat.textColor} mt-1`}>
                  {stat.value}
                </p>
                {stat.subValue && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">{stat.subLabel}</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {stat.subValue}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Alert Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {alertStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} border-2 ${stat.bgColor.replace("100", "200")} rounded-lg p-4`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-xs font-medium ${stat.textColor} mb-1`}>
                      {stat.label}
                    </p>
                    <p className={`text-3xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </p>
                    <p className={`text-xs ${stat.textColor} opacity-80 mt-1`}>
                      {stat.description}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.textColor} opacity-70`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Monthly Revenue */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold opacity-90">
                Monthly Revenue
              </h3>
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold mb-1">
              ${stats.monthlyRevenue.toFixed(2)}
            </p>
            <p className="text-green-100 text-xs">
              {stats.dispensedThisMonth} prescriptions dispensed
            </p>
          </div>

          {/* Weekly Revenue */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold opacity-90">
                Weekly Revenue
              </h3>
              <BarChart3 className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold mb-1">
              ${stats.weeklyRevenue.toFixed(2)}
            </p>
            <p className="text-blue-100 text-xs">
              {stats.dispensedThisWeek} prescriptions this week
            </p>
          </div>

          {/* Inventory Value */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold opacity-90">
                Inventory Value
              </h3>
              <Package className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold mb-1">
              ${stats.totalInventoryValue.toFixed(2)}
            </p>
            <p className="text-purple-100 text-xs">
              {stats.totalMedicines} different medicines
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-600" />
                Recent Activities
              </h3>
              <button
                onClick={() => navigate("/pharmacist/dispensed-history")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activities</p>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div
                    key={activity._id}
                    className={`border rounded-lg p-4 ${getActivityColor(activity.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {activity.type === "dispensed"
                                ? "Dispensed Medicine"
                                : activity.type === "added"
                                  ? "Stock Added"
                                  : "Stock Updated"}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              {activity.medicineName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {activity.quantity && (
                                <span className="text-xs text-gray-600">
                                  Qty: {activity.quantity}
                                </span>
                              )}
                              {activity.patientName && (
                                <span className="text-xs text-gray-600">
                                  • Patient: {activity.patientName}
                                </span>
                              )}
                              {activity.paymentMethod && (
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${getPaymentMethodColor(activity.paymentMethod)}`}
                                >
                                  {activity.paymentMethod}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {activity.amount && (
                              <p className="text-sm font-bold text-green-600">
                                ${activity.amount.toFixed(2)}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimeAgo(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Prescriptions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                Recent Prescriptions
              </h3>
              <button
                onClick={() => navigate("/pharmacist/prescriptions")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All
              </button>
            </div>

            <div className="space-y-2">
              {recentPrescriptions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No pending prescriptions
                </p>
              ) : (
                recentPrescriptions.map((prescription) => (
                  <div
                    key={prescription._id}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 hover:bg-yellow-100 cursor-pointer transition-colors"
                    onClick={() => navigate("/pharmacist/prescriptions")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {prescription.patientName}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          ID: {prescription.patientId}
                        </p>
                        <p className="text-xs text-gray-600">
                          Dr. {prescription.doctorName}
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          {prescription.medicineCount} medicine(s)
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatTimeAgo(prescription.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Selling Medicines */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                Top Selling Medicines
              </h3>
              <span className="text-xs text-gray-500">This Month</span>
            </div>

            <div className="space-y-3">
              {topSellingMedicines.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No sales data
                </p>
              ) : (
                topSellingMedicines.map((medicine, index) => (
                  <div
                    key={medicine._id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {medicine.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {medicine.genericName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">
                        ${medicine.revenue.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {medicine.quantitySold} sold
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Low Stock Alerts
              </h3>
              <button
                onClick={() => navigate("/pharmacist/inventory")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2">
              {lowStockMedicines.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No low stock items
                </p>
              ) : (
                lowStockMedicines.map((medicine) => (
                  <div
                    key={medicine._id}
                    className="bg-orange-50 border border-orange-200 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {medicine.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {medicine.genericName} • {medicine.brand}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          ${medicine.price.toFixed(2)} per unit
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="px-3 py-1 bg-orange-200 text-orange-800 text-sm rounded-full font-bold">
                          {medicine.stockQuantity}
                        </span>
                        <p className="text-xs text-orange-600 mt-1">
                          Value: $
                          {(medicine.stockQuantity * medicine.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Expiring Medicines */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-600" />
              Medicines Expiring Soon
            </h3>
            <button
              onClick={() => navigate("/pharmacist/inventory")}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiringMedicines.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4 col-span-3">
                No expiring medicines
              </p>
            ) : (
              expiringMedicines.map((medicine) => (
                <div
                  key={medicine._id}
                  className="bg-amber-50 border border-amber-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {medicine.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {medicine.brand} • #{medicine.batchNumber}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-amber-200 text-amber-800 text-xs rounded-full font-semibold whitespace-nowrap">
                      {medicine.daysUntilExpiry}d
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Expiry Date:</span>
                      <span className="text-amber-700 font-semibold">
                        {new Date(medicine.expiryDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Stock:</span>
                      <span className="text-gray-900 font-semibold">
                        {medicine.stockQuantity} units
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/pharmacist/prescriptions")}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
            >
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">
                Prescriptions
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {stats.pendingPrescriptions} pending
              </span>
            </button>

            <button
              onClick={() => navigate("/pharmacist/inventory")}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer"
            >
              <Package className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">
                Inventory
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {stats.totalMedicines} items
              </span>
            </button>

            <button
              onClick={() => navigate("/pharmacist/dispensed-history")}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer"
            >
              <Activity className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">History</span>
              <span className="text-xs text-gray-500 mt-1">
                {stats.dispensedToday} today
              </span>
            </button>

            <button
              onClick={() => navigate("/pharmacist/inventory")}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer"
            >
              <AlertTriangle className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Alerts</span>
              <span className="text-xs text-gray-500 mt-1">
                {stats.lowStockCount + stats.expiringCount} items
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboard;
