import { useState, useEffect } from "react";
import {
  Search,
  FlaskConical,
  User,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  FileText,
  X,
} from "lucide-react";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import DataTable, { type TableColumn } from "../../components/table/DataTable";
import TableFilters from "../../components/filter/TableFilters";

interface LabTest {
  _id: string;
  id_no: string;
  patientId: {
    _id: string;
    id_no: string;
    fullName: string;
    phoneNo: string;
    email: string;
  };
  doctorId: {
    _id: string;
    fullName: string;
    id_no: string;
  };
  tests: Array<{
    _id: string;
    id_no: string;
    testId: {
      _id: string;
      name: string;
      departmentId: {
        _id: string;
        name: string;
      };
    };
    testName: string;
    status: "Pending" | "In Progress" | "Completed";
    results: Array<{
      name: string;
      value: number;
      range: string;
      unit: string;
      status: "Normal" | "High" | "Low" | "Critical";
    }>;
    remarks?: string;
    resultPDF?: string;
    completedAt?: string;
  }>;
  createdAt: string;
}

const statusConfig: Record<
  string,
  {
    label: string;
    classes: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  Pending: {
    label: "Pending",
    classes: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    icon: Clock,
  },
  "In Progress": {
    label: "In Progress",
    classes: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: FlaskConical,
  },
  Completed: {
    label: "Completed",
    classes: "bg-green-50 text-green-700 border border-green-200",
    icon: CheckCircle,
  },
  Cancelled: {
    label: "Cancelled",
    classes: "bg-red-50 text-red-700 border border-red-200",
    icon: XCircle,
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

function fmtDateTime(d: string) {
  return new Date(d).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const DoctorLabTestReports = () => {
  const doctor = useSelector(
    (state: { auth?: { user?: any } } | any) => state?.auth?.user,
  );
  const location = useLocation();
  const { isOpen, openModal, closeModal } = useModal();

  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [modalType, setModalType] = useState("");
  const [search, setSearch] = useState(location.state?.testId || "");
  const [activeFilter, setActiveFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // Replace with your actual API call
  const fetchLabTests = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/doctor/fetch/lab-tests`);
      if (response.data.success) {
        setLabTests(response.data.labTests);
        console.log(response.data.labTests);
      }
    } catch (error) {
      console.error("Error fetching lab tests:", error);
      const errorMessage =
        (error as any)?.response?.data?.message || "Failed to fetch lab tests";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctor?.id) {
      const fetchData = async () => {
        await fetchLabTests();
      };
      fetchData();
    }
  }, [doctor?.id]);

  const filtered = labTests.filter((t) => {
    const matchFilter =
      activeFilter === "All" ||
      t.tests.map((test) => test.status).includes(activeFilter as any);
    const matchSearch =
      t.patientId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      t.id_no?.toLowerCase().includes(search.toLowerCase()) ||
      t.tests
        .map((test) => test.testId?.name?.toLowerCase())
        .includes(search.toLowerCase());
    const matchDate = dateFilter
      ? new Date(t.createdAt).toDateString() ===
        new Date(dateFilter).toDateString()
      : true;
    return matchFilter && matchSearch && matchDate;
  });

  const stats = {
    total: labTests.length,
    pending: labTests.filter((t) =>
      t.tests.some((test) => test.status === "Pending"),
    ).length,
    inProgress: labTests.filter((t) =>
      t.tests.some((test) => test.status === "In Progress"),
    ).length,
    completed: labTests.filter((t) =>
      t.tests.some((test) => test.status === "Completed"),
    ).length,
    cancelled: 0,
  };

  const flattenedData = filtered.flatMap((test) =>
    test.tests.map((t) => ({ ...t, parentTest: test })),
  );

  const columns: TableColumn[] = [
    {
      key: "id_no",
      label: "Report ID",
      render: (_, row) => (
        <span className="text-xs font-mono text-gray-500">
          {row.parentTest.id_no}
        </span>
      ),
    },
    {
      key: "patient",
      label: "Patient",
      render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 text-xs font-medium">
            {initials(row.parentTest.patientId?.fullName || "?")}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {row.parentTest.patientId?.fullName}
            </p>
            <p className="text-xs text-gray-400">
              {row.parentTest.patientId?.id_no}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "testId",
      label: "Test Name",
      render: (_, row) => (
        <span className="text-sm text-gray-800 font-medium">
          {row.testId?.name}
        </span>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (_, row) => (
        <span className="text-sm text-gray-600">
          {row.testId?.departmentId?.name}
        </span>
      ),
    },
    {
      key: "ordered",
      label: "Ordered",
      render: (_, row) => (
        <span className="text-sm text-gray-600">
          {fmtDate(row.parentTest.createdAt)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) => {
        const status = statusConfig[row.status] ?? statusConfig["Pending"];
        const StatusIcon = status.icon;
        return (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${status.classes}`}
          >
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
        );
      },
    },
    {
      key: "action",
      label: "Action",
      render: (_, row) => (
        <button
          onClick={() => {
            setSelectedTest(row.parentTest);
            openModal();
          }}
          className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
          title="View Details"
        >
          <Eye className="h-5 w-5" />
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 p-3">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Lab Test Reports
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                All lab tests ordered by you
              </p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Dr. {doctor?.fullName}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          {[
            {
              label: "Total",
              value: stats.total,
              color: "text-gray-900",
              bg: "bg-white",
              border: "border-gray-100",
            },
            {
              label: "Pending",
              value: stats.pending,
              color: "text-yellow-700",
              bg: "bg-yellow-50",
              border: "border-yellow-100",
            },
            {
              label: "In Progress",
              value: stats.inProgress,
              color: "text-blue-700",
              bg: "bg-blue-50",
              border: "border-blue-100",
            },
            {
              label: "Completed",
              value: stats.completed,
              color: "text-green-700",
              bg: "bg-green-50",
              border: "border-green-100",
            },
            {
              label: "Cancelled",
              value: stats.cancelled,
              color: "text-red-700",
              bg: "bg-red-50",
              border: "border-red-100",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`${s.bg} border ${s.border} rounded-xl px-4 py-3`}
            >
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <TableFilters
          searchPlaceholder="Search by patient, test name or report ID..."
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            {
              id: "status",
              label: "Status",
              type: "select",
              value: activeFilter,
              onChange: setActiveFilter,
              options: [
                { label: "All", value: "All" },
                { label: "Pending", value: "Pending" },
                { label: "In Progress", value: "In Progress" },
                { label: "Completed", value: "Completed" },
              ],
            },
            {
              id: "date",
              label: "Date",
              type: "date",
              value: dateFilter,
              onChange: setDateFilter,
            },
          ]}
          onClearAll={() => {
            setSearch("");
            setActiveFilter("All");
            setDateFilter("");
          }}
        />

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-3">
          Showing{" "}
          <span className="font-medium text-gray-900">{filtered.length}</span>{" "}
          of{" "}
          <span className="font-medium text-gray-900">{labTests.length}</span>{" "}
          reports
        </p>

        <DataTable
          columns={columns}
          data={flattenedData}
          loading={loading}
          emptyStateIcon={FlaskConical}
          emptyStateTitle="No lab reports found"
          emptyStateDescription={
            search || activeFilter !== "All" || dateFilter
              ? "Try adjusting your filters"
              : "No lab tests have been ordered yet"
          }
        />

        {/* Modal */}
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          title={
            modalType === "viewDetail"
              ? "Lab Report Details"
              : "Lab Report Details"
          }
          width="max-w-2/3"
          height="max-h-[450px]"
          cancelIcon={<X className="w-4 h-4 mr-2" />}
          cancelText="Close"
          onBtn1={closeModal}
          btn1Text="Done"
          btn1Color="bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          btn1Icon={<CheckCircle className="w-5 h-5 mr-2" />}
        >
          {modalType === "viewDetail" && selectedTest?._id && (
            <div className="space-y-3">
              {/* Report ID + ordered date */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">
                      Report ID:{" "}
                    </span>
                    <span className="text-gray-900 font-mono font-semibold">
                      {selectedTest.id_no}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Ordered: </span>
                    <span className="text-gray-900">
                      {fmtDateTime(selectedTest.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tests List */}
              {selectedTest.tests && selectedTest.tests.length > 0 && (
                <div className="space-y-3">
                  {selectedTest.tests.map((test, idx) => (
                    <div
                      key={test._id || idx}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Test Header */}
                      <div className="bg-blue-50 p-3 border-b border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Test Name
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {test.testName || test.testId?.name || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Department
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {test.testId?.departmentId?.name || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Status</p>
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                                statusConfig[test.status]?.classes
                              }`}
                            >
                              {test.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Test Details */}
                      <div className="p-3 space-y-3">
                        {test.completedAt && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Completed At
                            </p>
                            <p className="text-sm text-gray-900">
                              {fmtDateTime(test.completedAt)}
                            </p>
                          </div>
                        )}

                        {/* Results Section */}
                        {test.status === "Completed" &&
                          test.results &&
                          test.results.length > 0 && (
                            <div className="border-t pt-3">
                              <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-green-600" />
                                Results
                              </h5>
                              <div className="space-y-2">
                                {test.results.map(
                                  (result: any, rIdx: number) => (
                                    <div
                                      key={rIdx}
                                      className={`rounded p-2.5 ${
                                        result.status === "Normal"
                                          ? "bg-green-50 border border-green-200"
                                          : result.status === "High" ||
                                              result.status === "Low"
                                            ? "bg-yellow-50 border border-yellow-200"
                                            : "bg-red-50 border border-red-200"
                                      }`}
                                    >
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                        <div>
                                          <p className="text-gray-500 mb-0.5">
                                            Parameter
                                          </p>
                                          <p className="font-semibold text-gray-900">
                                            {result.name}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-gray-500 mb-0.5">
                                            Value
                                          </p>
                                          <p className="font-bold text-gray-900">
                                            {result.value} {result.unit || ""}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-gray-500 mb-0.5">
                                            Range
                                          </p>
                                          <p className="text-gray-700">
                                            {result.range || "—"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-gray-500 mb-0.5">
                                            Status
                                          </p>
                                          <span
                                            className={`inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${
                                              result.status === "Normal"
                                                ? "bg-green-100 text-green-800"
                                                : result.status === "High"
                                                  ? "bg-yellow-100 text-yellow-800"
                                                  : result.status === "Low"
                                                    ? "bg-orange-100 text-orange-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                          >
                                            {result.status}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                        {/* Remarks */}
                        {test.remarks && (
                          <div className="border-t pt-3">
                            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                              <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                              Remarks
                            </p>
                            <div className="bg-amber-50 border border-amber-200 rounded p-2">
                              <p className="text-xs text-amber-900 leading-relaxed">
                                {test.remarks}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Result PDF */}
                        {test.resultPDF && (
                          <div className="border-t pt-3">
                            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                              Report PDF
                            </p>
                            <a
                              href={`${import.meta.env.VITE_BASE_URL}/images/pdfs/${test.resultPDF}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                            >
                              <FileText className="h-4 w-4" />
                              View PDF Report
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Patient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t pt-3">
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    Patient
                  </h4>
                  {[
                    { label: "Name", value: selectedTest.patientId?.fullName },
                    { label: "ID", value: selectedTest.patientId?.id_no },
                    { label: "Phone", value: selectedTest.patientId?.phoneNo },
                    { label: "Email", value: selectedTest.patientId?.email },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {item.value || "—"}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Ordered By
                  </h4>
                  {[
                    { label: "Doctor", value: selectedTest.doctorId?.fullName },
                    { label: "Doctor ID", value: selectedTest.doctorId?.id_no },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {item.value || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default DoctorLabTestReports;
