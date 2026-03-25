import { useState, useEffect } from "react";
import {
  FlaskRound,
  Calendar,
  User,
  Stethoscope,
  Download,
  Eye,
  Search,
  Filter,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Trash,
} from "lucide-react";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import axios from "axios";
import { useSelector } from "react-redux";

interface LabReport {
  _id: string;
  id_no: string;
  consultationId: string;
  appointmentId: {
    _id: string;
    id_no: string;
    aptDate: string;
    appointmentTime: string;
  };
  doctorId: {
    _id: string;
    id_no: string;
    fullName: string;
    photo: string;
    specialization: string;
  };
  patientId: {
    _id: string;
    id_no: string;
    fullName: string;
    phoneNo: string;
    email: string;
    age: number;
    gender: string;
  };
  tests: Array<{
    id_no: string;
    testName: string;
    testId: string;
    status: "Pending" | "In Progress" | "Completed";
    _id: string;
    completedAt?: string;
    remarks?: string;
    resultPDF?: string;
    results?: Array<{
      name: string;
      value: string;
      range: string;
      unit: string;
      status: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

const LabReports = () => {
  const patient = useSelector((state: any) => state.auth.user);
  const { isOpen, openModal, closeModal } = useModal();
  const [modalType, setModalType] = useState("");
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const baseurl = import.meta.env.VITE_BASE_URL;

  const fetchLabReports = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/lab/patient/reports`, {
        headers: {
          "auth-token": localStorage.getItem("authToken") || patient?.token,
        },
      });
      if (response.data.success) {
        setLabReports(response.data.labReports);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching lab reports:", error.message);
        toast.error(error.response?.data?.message);
      }
    }
  };

  const handleDownloadReport = (testId: string, resultPDF: string) => {
    window.open(`${baseurl}/images/pdfs/${resultPDF}`, "_blank");
    toast.success("Downloading lab report...");
  };

  const handleDeleteLabOrder = async (labOrderId: string) => {
    try {
      const response = await axios.put(
        `${baseurl}/api/lab/delete-lab-order`,
        {
          labOrderId,
          role: patient?.role,
          userId: patient?.id,
        },
        {
          headers: {
            "auth-token": localStorage.getItem("authToken") || patient?.token,
          },
        },
      );
      if (response.data.success) {
        toast.success(response.data.message);
        closeModal();
        fetchLabReports();
        console.log(response.data.labOrder);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching lab reports:", error.message);
        toast.error(error.response?.data?.message);
      }
    }
  };

  useEffect(() => {
    if (patient?.id) {
      const fetchData = async () => {
        await fetchLabReports();
      };
      fetchData();
    }
  }, [patient?.id]);

  // Filter lab reports
  const filteredReports = labReports.filter((report) => {
    const matchesSearch =
      report.id_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.doctorId?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      report.tests?.some((test) =>
        test.testName.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const hasMatchingStatus =
      statusFilter === "all" ||
      report.tests?.some((test) => test.status === statusFilter);

    const matchesDate =
      !dateFilter || report.appointmentId?.aptDate === dateFilter;

    return matchesSearch && hasMatchingStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getResultStatusColor = (status: string) => {
    switch (status) {
      case "Normal":
        return "bg-green-100 text-green-800";
      case "High":
        return "bg-red-100 text-red-800";
      case "Low":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Statistics
  const totalTests = labReports.reduce(
    (sum, report) => sum + report.tests.length,
    0,
  );
  const completedTests = labReports.reduce(
    (sum, report) =>
      sum + report.tests.filter((t) => t.status === "Completed").length,
    0,
  );
  const pendingTests = labReports.reduce(
    (sum, report) =>
      sum + report.tests.filter((t) => t.status === "Pending").length,
    0,
  );
  const inProgressTests = labReports.reduce(
    (sum, report) =>
      sum + report.tests.filter((t) => t.status === "In Progress").length,
    0,
  );

  const stats = [
    {
      label: "Total Tests",
      value: totalTests,
      icon: FlaskRound,
      color: "blue",
    },
    {
      label: "Completed",
      value: completedTests,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "In Progress",
      value: inProgressTests,
      icon: Clock,
      color: "blue",
    },
    {
      label: "Pending",
      value: pendingTests,
      icon: AlertCircle,
      color: "yellow",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 p-3">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <FlaskRound className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  My Lab Reports
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  View and download your laboratory test results
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {item.label}
                  </p>
                  <p
                    className={`text-lg font-bold text-${item.color}-600 mt-1`}
                  >
                    {item.value}
                  </p>
                </div>
                <div className={`bg-${item.color}-100 p-2 rounded-full`}>
                  <Icon className={`h-5 w-5 text-${item.color}-600`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/3 -translate-y-1/6 transform h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by test, doctor, order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Clear Filters */}
          {(searchTerm || statusFilter !== "all" || dateFilter) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setDateFilter("");
              }}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-2">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredReports.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {labReports.length}
            </span>{" "}
            lab orders
          </p>
        </div>

        {/* Lab Reports Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Tests
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Created At
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FlaskRound className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">
                          No lab reports found
                        </p>
                        <p className="text-gray-400 mt-1">
                          {searchTerm || statusFilter !== "all" || dateFilter
                            ? "Try adjusting your filters"
                            : "Your lab reports will appear here"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr
                      key={report._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Order ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-mono font-semibold text-gray-900">
                            {report.id_no}
                          </span>
                          <span className="text-xs text-gray-500">
                            {report.appointmentId?.id_no}
                          </span>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-purple-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {report.doctorId?.photo ? (
                              <img
                                src={`${baseurl}/images/uploads/${report.doctorId.photo}`}
                                alt={report.doctorId.fullName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Stethoscope className="h-5 w-5 text-purple-600" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {report.doctorId?.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {report.doctorId?.specialization}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Tests */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {report.tests?.length} Test
                            {report.tests?.length > 1 ? "s" : ""}
                          </span>
                          <span className="text-xs text-gray-600">
                            {report.tests?.[0]?.testName}
                            {report.tests?.length > 1 &&
                              `, +${report.tests.length - 1} more`}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-1 items-center">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {new Date(report.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                          <div className="flex gap-1 items-center">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {new Date(report.createdAt).toLocaleTimeString(
                                "en-US",
                                {
                                  minute: "2-digit",
                                  hour: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.tests?.every(
                          (t) => t.status === "Completed",
                        ) ? (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border bg-green-100 text-green-800 border-green-200">
                            All Completed
                          </span>
                        ) : report.tests?.some(
                            (t) => t.status === "In Progress",
                          ) ? (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border bg-blue-100 text-blue-800 border-blue-200">
                            In Progress
                          </span>
                        ) : (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border bg-yellow-100 text-yellow-800 border-yellow-200">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setModalType("viewOrder");
                              openModal();
                            }}
                            className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setModalType("dltTestOrder");
                              openModal();
                            }}
                            className="text-red-600 cursor-pointer hover:text-red-800 font-medium text-sm flex items-center gap-1"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={isOpen}
          title={
            modalType === "viewOrder"
              ? "Lab Order Details"
              : modalType === "dltTestOrder"
                ? "Delete Test Order"
                : "Lab Test Results"
          }
          onClose={closeModal}
          width="max-w-2/3"
          height="max-h-[450px]"
          cancelIcon={
            modalType === "viewResults" ? (
              <ArrowLeft className="w-5 h-5 mr-2" />
            ) : (
              <X className="w-5 h-5 mr-2" />
            )
          }
          confirmText={
            modalType === "viewResults"
              ? "Download PDF"
              : modalType === "dltTestOrder"
                ? "Delete"
                : ""
          }
          onConfirm={
            modalType === "viewResults"
              ? () =>
                  handleDownloadReport(selectedTest._id, selectedTest.resultPDF)
              : modalType === "dltTestOrder"
                ? () => handleDeleteLabOrder(selectedReport?._id)
                : undefined
          }
          confirmColor={
            modalType === "viewResults"
              ? "bg-green-600 text-white rounded-lg hover:bg-green-700"
              : modalType === "dltTestOrder"
                ? "bg-red-600 text-white rounded-lg hover:bg-red-700"
                : ""
          }
          confirmIcon={
            modalType === "viewResults" ? (
              <Download className="w-5 h-5 mr-2" />
            ) : modalType === "dltTestOrder" ? (
              <Trash className="w-5 h-5 mr-2" />
            ) : (
              ""
            )
          }
          onCancel={
            modalType === "viewResults"
              ? () => setModalType("viewOrder")
              : modalType === "dltTestOrder"
                ? closeModal
                : ""
          }
          cancelText={modalType === "viewResults" ? "Back" : "Cancel"}
        >
          {modalType === "viewOrder" && selectedReport && (
            <div className="space-y-2">
              {/* Header Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">
                      Order ID:{" "}
                    </span>
                    <span className="text-gray-900 font-mono font-semibold">
                      {selectedReport.id_no}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">
                      Appointment:{" "}
                    </span>
                    <span className="text-gray-900 font-mono">
                      {selectedReport.appointmentId?.id_no}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Doctor: </span>
                    <span className="text-gray-900 font-semibold">
                      {selectedReport.doctorId?.fullName}
                    </span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="text-gray-600 font-medium">
                      Created At:
                    </span>
                    <span className="text-sm text-gray-900">
                      {`${new Date(selectedReport.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}, ${new Date(
                        selectedReport.createdAt,
                      ).toLocaleTimeString("en-US", {
                        minute: "2-digit",
                        hour: "2-digit",
                      })}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient Info */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Patient Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700 font-medium">Name: </span>
                    <span className="text-blue-900">
                      {selectedReport.patientId?.fullName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700 font-medium">ID: </span>
                    <span className="text-blue-900 font-mono">
                      {selectedReport.patientId?.id_no}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700 font-medium">Phone: </span>
                    <span className="text-blue-900">
                      {selectedReport.patientId?.phoneNo}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700 font-medium">Email: </span>
                    <span className="text-blue-900">
                      {selectedReport.patientId?.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tests List */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <FlaskRound className="h-4 w-4" />
                  Ordered Tests ({selectedReport.tests?.length})
                </h4>
                <div className="space-y-2">
                  {selectedReport.tests?.map((test) => (
                    <div
                      key={test._id}
                      className={`border rounded-lg p-3 ${
                        test.status === "Completed"
                          ? "bg-green-50 border-green-200"
                          : test.status === "In Progress"
                            ? "bg-blue-50 border-blue-200"
                            : "bg-yellow-50 border-yellow-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <h5 className="text-sm font-bold text-gray-900">
                            {test.testName}
                          </h5>
                          <p className="text-xs text-gray-600 mt-1">
                            Test ID: {test.id_no}
                          </p>
                          {test.completedAt && (
                            <p className="text-xs text-gray-600 mt-1">
                              Completed:{" "}
                              {new Date(test.completedAt).toLocaleString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(test.status)}`}
                        >
                          {test.status}
                        </span>
                      </div>

                      {test.status === "Completed" && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => {
                              setSelectedTest(test);
                              setModalType("viewResults");
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 text-sm cursor-pointer transition-colors duration-300 ease-in-out"
                          >
                            <Eye className="h-4 w-4" />
                            View Results
                          </button>
                          {test.resultPDF && (
                            <button
                              onClick={() =>
                                handleDownloadReport(test._id, test.resultPDF)
                              }
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 text-sm cursor-pointer transition-colors duration-300 ease-in-out"
                            >
                              <Download className="h-4 w-4" />
                              Download PDF
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {modalType === "viewResults" && selectedTest && selectedReport && (
            <div className="space-y-2">
              {/* Header Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">Test: </span>
                    <span className="text-gray-900 font-semibold">
                      {selectedTest.testName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Test ID: </span>
                    <span className="text-gray-900 font-mono">
                      {selectedTest.id_no}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Doctor: </span>
                    <span className="text-gray-900">
                      {selectedReport.doctorId?.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">
                      Completed:{" "}
                    </span>
                    <span className="text-gray-900">
                      {new Date(selectedTest.completedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Results Table */}
              {selectedTest.results && selectedTest.results.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">
                    Test Results
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                            Parameter
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                            Result
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                            Reference Range
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                            Unit
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTest.results.map((result, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {result.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">
                              {result.value}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">
                              {result.range}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">
                              {result.unit}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getResultStatusColor(result.status)}`}
                              >
                                {result.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Remarks */}
              {selectedTest.remarks && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-amber-900 mb-1">
                    Remarks / Interpretation
                  </h4>
                  <p className="text-sm text-amber-800">
                    {selectedTest.remarks}
                  </p>
                </div>
              )}
            </div>
          )}
          {modalType === "dltTestOrder" && selectedReport && (
            <div className="pb-4">
              <h1 className="">
                Are you sure you want to delete this lab report?
              </h1>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default LabReports;
