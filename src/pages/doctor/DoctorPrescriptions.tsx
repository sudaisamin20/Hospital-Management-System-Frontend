import { CheckCircle, Clock, FileText, Icon, Pill, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useSelector } from "react-redux";

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

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Medicine {
  medicineName: string;
  dosage: string;
  frequency?: number;
  duration?: number;
  instructions?: string;
}

interface Prescription {
  _id: string;
  patientId?: {
    fullName: string;
    id_no?: string;
    photo?: string;
  };
  id_no?: string;
  status: "Dispensed" | "Pending" | "Cancelled";
  medicines: Medicine[];
  dispensedAt?: string;
  dispensedBy?: { fullName?: string } | string;
  createdAt?: string;
}

const DoctorPrescriptions = () => {
  const location = useLocation();
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const doctor = useSelector((state: any) => state.auth.user);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState(location.state?.prescriptionId || "");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [dateFilter, setDateFilter] = useState("");

  const fetchPrescriptions = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/doctor/fetch/prescriptions");
      if (response.data.success) {
        setPrescriptions(response.data.prescriptions);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      const message =
        (error as any)?.response?.data?.message ||
        "Failed to fetch prescriptions";
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    if (doctor?.id) {
      const fetchData = async () => {
        await fetchPrescriptions();
      };
      fetchData();
    }
  }, [doctor?.id]);

  const filtered = prescriptions.filter((p) => {
    const matchFilter = activeFilter === "All" || p.status === activeFilter;
    const matchSearch =
      (p.patientId?.fullName || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (p.id_no || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.patientId?.id_no || "").toLowerCase().includes(search.toLowerCase()) ||
      dateFilter === "" ||
      (p.createdAt &&
        new Date(p.createdAt).toISOString().startsWith(dateFilter));
    return matchFilter && matchSearch;
  });

  const stats = {
    total: prescriptions.length,
    dispensed: prescriptions.filter((p) => p.status === "Dispensed").length,
    pending: prescriptions.filter((p) => p.status === "Pending").length,
    cancelled: prescriptions.filter((p) => p.status === "Cancelled").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="max-w-7xl">
        {/* Page Header */}
        <div className="mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Prescriptions
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                All prescriptions issued by you
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {[
            {
              label: "Total",
              value: stats.total,
              color: "text-blue-700",
              bg: "bg-blue-100",
              Icon: FileText,
            },
            {
              label: "Dispensed",
              value: stats.dispensed,
              color: "text-green-700",
              bg: "bg-green-100",
              Icon: CheckCircle,
            },
            {
              label: "Pending",
              value: stats.pending,
              color: "text-yellow-700",
              bg: "bg-yellow-100",
              Icon: Clock,
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`${s.bg} rounded-xl border shadow-sm border-gray-100 px-4 py-3 flex items-center justify-between`}
            >
              <div>
                <p className={`text-xs text-gray-500 mb-1`}>{s.label}</p>
                <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
              </div>
              <div>
                <s.Icon className={`h-5 w-5 ${s.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/3 transform -translate-y-1/4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient or prescription ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm w-full pl-8 pr-2 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
            />
          </div>
          <select
            name="statusFilter"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            id=""
            className="text-sm p-2 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
          >
            <option value="All">All</option>
            <option value="Dispensed">Dispensed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-sm p-2 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
          />
        </div>

        {/* Prescription Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-base">No prescriptions found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((pres) => {
              const isExpanded = expanded === pres._id;
              const status =
                statusConfig[pres.status] ?? statusConfig["Pending"];

              return (
                <div
                  key={pres._id}
                  className="bg-white border border-gray-100 rounded-xl overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      {/* Patient info */}
                      <div className="flex items-start gap-3">
                        {pres.patientId?.photo ? (
                          <img
                            src={`${BASE_URL}/images/uploads/${pres.patientId.photo}`}
                            alt={pres.patientId.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-sm font-medium shrink-0">
                            {initials(pres.patientId?.fullName || "P")}
                          </div>
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-gray-400 tracking-wide">
                            {pres.id_no || "N/A"}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {pres.patientId?.fullName || "N/A"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {pres.createdAt
                              ? `Issued ${fmtDate(pres.createdAt)} at ${fmtTime(pres.createdAt)}`
                              : "N/A"}
                          </span>
                          {pres.dispensedBy ? (
                            <span className="text-xs text-gray-500">
                              Dispensed by{" "}
                              <span className="text-green-600 font-medium">
                                {typeof pres.dispensedBy === "string"
                                  ? pres.dispensedBy
                                  : pres.dispensedBy?.fullName || "N/A"}
                              </span>{" "}
                              ·{" "}
                              {pres.dispensedAt
                                ? fmtDate(pres.dispensedAt)
                                : "N/A"}{" "}
                              at{" "}
                              {pres.dispensedAt
                                ? fmtTime(pres.dispensedAt)
                                : ""}
                            </span>
                          ) : (
                            <span className="text-xs text-yellow-600 font-medium">
                              Awaiting dispensation
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: badge + expand */}
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full ${status.classes}`}
                        >
                          {status.label}
                        </span>
                        <button
                          onClick={() =>
                            setExpanded(isExpanded ? null : pres._id)
                          }
                          className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 hover:bg-blue-100 transition-colors cursor-pointer font-medium"
                        >
                          {isExpanded ? "Hide Details" : "View medicines"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Medicines */}
                  {isExpanded && (
                    <div className="border-t border-green-200 px-5 py-4 bg-green-100">
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
    </div>
  );
};

export default DoctorPrescriptions;
