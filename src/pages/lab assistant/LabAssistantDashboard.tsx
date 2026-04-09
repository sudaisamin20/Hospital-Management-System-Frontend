import React, { useState } from "react";
import {
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Microscope,
  Thermometer,
  PackageOpen,
  Bell,
  RefreshCw,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type TestStatus = "pending" | "progress" | "ready" | "critical" | "cancelled";

type LabTest = {
  id: string;
  patientName: string;
  patientId: string;
  testName: string;
  sampleType: string;
  requestedAt: string;
  status: TestStatus;
  doctor: string;
};

type Equipment = {
  id: string;
  name: string;
  status: "online" | "calibration" | "offline";
  lastUsed: string;
};

type LabAlert = {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  time: string;
};

type Sample = {
  id: string;
  testName: string;
  sampleType: string;
  receivedAt: string;
  status: TestStatus;
};

// ── Dummy Data ─────────────────────────────────────────────────────────────

const TESTS: LabTest[] = [
  {
    id: "T-001",
    patientName: "Ali Raza",
    patientId: "P-2041",
    testName: "CBC + ESR",
    sampleType: "Blood",
    requestedAt: "09:15",
    status: "progress",
    doctor: "Dr. Hassan",
  },
  {
    id: "T-002",
    patientName: "Sana Malik",
    patientId: "P-1887",
    testName: "LFT Panel",
    sampleType: "Serum",
    requestedAt: "08:50",
    status: "critical",
    doctor: "Dr. Ayesha",
  },
  {
    id: "T-003",
    patientName: "Usman Khan",
    patientId: "P-3302",
    testName: "Urine R/E",
    sampleType: "Urine",
    requestedAt: "09:00",
    status: "pending",
    doctor: "Dr. Tariq",
  },
  {
    id: "T-004",
    patientName: "Fatima Noor",
    patientId: "P-0981",
    testName: "HbA1c",
    sampleType: "Blood",
    requestedAt: "08:30",
    status: "ready",
    doctor: "Dr. Hassan",
  },
  {
    id: "T-005",
    patientName: "Bilal Ahmed",
    patientId: "P-1145",
    testName: "Lipid Profile",
    sampleType: "Serum",
    requestedAt: "08:10",
    status: "ready",
    doctor: "Dr. Fatima",
  },
  {
    id: "T-006",
    patientName: "Zara Shah",
    patientId: "P-2278",
    testName: "Stool Culture",
    sampleType: "Stool",
    requestedAt: "07:55",
    status: "pending",
    doctor: "Dr. Tariq",
  },
  {
    id: "T-007",
    patientName: "Kamran Ali",
    patientId: "P-0033",
    testName: "Thyroid TSH",
    sampleType: "Blood",
    requestedAt: "07:40",
    status: "progress",
    doctor: "Dr. Ayesha",
  },
  {
    id: "T-008",
    patientName: "Hina Javed",
    patientId: "P-4412",
    testName: "Blood Glucose",
    sampleType: "Blood",
    requestedAt: "09:20",
    status: "critical",
    doctor: "Dr. Hassan",
  },
];

const EQUIPMENT: Equipment[] = [
  {
    id: "EQ-001",
    name: "Hematology Analyzer",
    status: "online",
    lastUsed: "09:10",
  },
  {
    id: "EQ-002",
    name: "Centrifuge 3000",
    status: "calibration",
    lastUsed: "07:00",
  },
  { id: "EQ-003", name: "PCR Machine", status: "online", lastUsed: "08:45" },
  {
    id: "EQ-004",
    name: "Urine Analyzer",
    status: "offline",
    lastUsed: "07:30",
  },
  {
    id: "EQ-005",
    name: "Spectrophotometer",
    status: "online",
    lastUsed: "09:05",
  },
];

const ALERTS: LabAlert[] = [
  {
    id: "A-1",
    type: "critical",
    title: "Critical result — Patient #P-2041",
    description: "Serum potassium 6.8 mEq/L · Notify Dr. Hassan immediately",
    time: "08:52",
  },
  {
    id: "A-2",
    type: "critical",
    title: "Critical result — Patient #P-1887",
    description: "Hemoglobin 5.2 g/dL · Notify Dr. Ayesha immediately",
    time: "09:05",
  },
  {
    id: "A-3",
    type: "warning",
    title: "Reagent low — HbA1c Kit",
    description: "12 tests remaining · Reorder before noon",
    time: "08:30",
  },
  {
    id: "A-4",
    type: "warning",
    title: "Centrifuge calibration overdue",
    description: "Scheduled 07:00 — not completed",
    time: "09:00",
  },
  {
    id: "A-5",
    type: "info",
    title: "5 results dispatched to portal",
    description: "Automated send to doctor portal completed",
    time: "09:10",
  },
];

const SAMPLES: Sample[] = [
  {
    id: "SMP-0041",
    testName: "CBC",
    sampleType: "Blood",
    receivedAt: "08:15",
    status: "progress",
  },
  {
    id: "SMP-0038",
    testName: "Urine R/E",
    sampleType: "Urine",
    receivedAt: "07:50",
    status: "ready",
  },
  {
    id: "SMP-0035",
    testName: "LFT",
    sampleType: "Serum",
    receivedAt: "07:22",
    status: "critical",
  },
  {
    id: "SMP-0033",
    testName: "HbA1c",
    sampleType: "Blood",
    receivedAt: "06:55",
    status: "pending",
  },
  {
    id: "SMP-0029",
    testName: "Stool Culture",
    sampleType: "Stool",
    receivedAt: "06:30",
    status: "ready",
  },
];

const WORKLOAD = [
  { label: "Hematology", count: 18, total: 24, color: "bg-blue-500" },
  { label: "Biochemistry", count: 13, total: 24, color: "bg-emerald-500" },
  { label: "Microbiology", count: 7, total: 24, color: "bg-violet-500" },
  { label: "Urinalysis", count: 10, total: 24, color: "bg-amber-500" },
];

// ── Sub-components ─────────────────────────────────────────────────────────

const statusConfig: Record<TestStatus, { label: string; cls: string }> = {
  pending: {
    label: "Pending",
    cls: "bg-amber-50  text-amber-800  border border-amber-200",
  },
  progress: {
    label: "In progress",
    cls: "bg-blue-50   text-blue-800   border border-blue-200",
  },
  ready: {
    label: "Ready",
    cls: "bg-green-50  text-green-800  border border-green-200",
  },
  critical: {
    label: "Critical",
    cls: "bg-red-50    text-red-800    border border-red-200",
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-gray-100  text-gray-600   border border-gray-200",
  },
};

const StatusPill = ({ status }: { status: TestStatus }) => {
  const { label, cls } = statusConfig[status];
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}
    >
      {label}
    </span>
  );
};

const equipStatusMap = {
  online: { dot: "bg-green-500", label: "Online", text: "text-green-700" },
  calibration: {
    dot: "bg-amber-500",
    label: "Calibration",
    text: "text-amber-700",
  },
  offline: { dot: "bg-red-500", label: "Offline", text: "text-red-700" },
};

const alertIconMap = {
  critical: {
    bg: "bg-red-50",
    icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600" />,
  },
  warning: {
    bg: "bg-amber-50",
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
  },
  info: {
    bg: "bg-blue-50",
    icon: <Bell className="w-3.5 h-3.5 text-blue-600" />,
  },
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const avatarColors = [
  "bg-blue-100   text-blue-800",
  "bg-teal-100   text-teal-800",
  "bg-violet-100 text-violet-800",
  "bg-amber-100  text-amber-800",
];

// ── Main Dashboard ─────────────────────────────────────────────────────────

const LabAssistantDashboard = () => {
  const [filter, setFilter] = useState<TestStatus | "all">("all");

  const filteredTests =
    filter === "all" ? TESTS : TESTS.filter((t) => t.status === filter);

  const stats = [
    {
      label: "Tests today",
      value: 48,
      sub: "12 pending",
      icon: <FlaskConical className="w-4 h-4" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "In progress",
      value: 7,
      sub: "Avg. 32 min left",
      icon: <Clock className="w-4 h-4" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Results ready",
      value: 29,
      sub: "3 sent to doctor",
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Critical flags",
      value: 2,
      sub: "Needs attention",
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Samples collected",
      value: 61,
      sub: "This shift",
      icon: <Microscope className="w-4 h-4" />,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  const filters: { label: string; value: TestStatus | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "In progress", value: "progress" },
    { label: "Ready", value: "ready" },
    { label: "Critical", value: "critical" },
  ];

  return (
    <div className="p-6 flex flex-col gap-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Lab assistant dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString("en-PK", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            · Morning shift
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-50 text-green-800 border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Lab online
          </span>
          <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-800 flex items-center justify-center text-xs font-bold border border-violet-200">
            LA
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-4"
          >
            <div
              className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center mb-3 ${s.color}`}
            >
              {s.icon}
            </div>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Test Queue */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Test queue</h3>
          <div className="flex items-center gap-2">
            {/* Ping badge */}
            <span className="relative inline-flex items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-amber-600 text-white text-[10px] font-bold">
                {
                  TESTS.filter(
                    (t) => t.status === "pending" || t.status === "critical",
                  ).length
                }
              </span>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap px-4 py-2.5 border-b border-gray-100 bg-gray-50">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`text-xs px-3 py-1 rounded-full border font-medium transition-all duration-150 ${
                filter === f.value
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Rows */}
        <div>
          {filteredTests.map((t, i) => (
            <div
              key={t.id}
              className={`flex items-center gap-3 px-4 py-3 text-sm ${
                i < filteredTests.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[i % 4]}`}
              >
                {initials(t.patientName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">
                  {t.patientName}
                </p>
                <p className="text-xs text-gray-400">
                  {t.testName} · {t.sampleType} · {t.requestedAt} · {t.doctor}
                </p>
              </div>
              <StatusPill status={t.status} />
              <button className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors hidden sm:block">
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Tracking + Equipment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sample Tracking */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">
              Sample tracking
            </h3>
            <span className="text-xs text-gray-400">Today</span>
          </div>
          <div>
            {SAMPLES.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 px-4 py-3 text-sm ${i < SAMPLES.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <span className="text-[11px] font-mono text-gray-400 min-w-[72px]">
                  #{s.id}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{s.testName}</p>
                  <p className="text-xs text-gray-400">
                    {s.sampleType} · Received {s.receivedAt}
                  </p>
                </div>
                <StatusPill status={s.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Equipment Status */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">
              Equipment status
            </h3>
            <button className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
          <div>
            {EQUIPMENT.map((eq, i) => {
              const s = equipStatusMap[eq.status];
              return (
                <div
                  key={eq.id}
                  className={`flex items-center gap-3 px-4 py-3 text-sm ${i < EQUIPMENT.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {eq.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {eq.id} · Last used {eq.lastUsed}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                    <span className={`text-xs font-medium ${s.text}`}>
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">
            Alerts &amp; notifications
          </h3>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200">
            2 critical
          </span>
        </div>
        <div>
          {ALERTS.map((a, i) => {
            const cfg = alertIconMap[a.type];
            return (
              <div
                key={a.id}
                className={`flex items-start gap-3 px-4 py-3 text-sm ${i < ALERTS.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <div
                  className={`w-7 h-7 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                >
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.description} · {a.time}
                  </p>
                </div>
                {a.type !== "info" && (
                  <button className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap hidden sm:block">
                    Action
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Workload */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">
            Today's workload
          </h3>
          <span className="text-xs text-gray-400">48 of 60 capacity</span>
        </div>
        <div className="px-4 py-4 flex flex-col gap-4">
          {WORKLOAD.map((w, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="text-gray-500 min-w-[100px] text-xs">
                {w.label}
              </span>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${w.color}`}
                  style={{ width: `${Math.round((w.count / w.total) * 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700 min-w-[24px] text-right">
                {w.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LabAssistantDashboard;
