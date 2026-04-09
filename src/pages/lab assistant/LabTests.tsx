import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  User,
  Stethoscope,
  Eye,
  CheckCircle,
  Clock,
  Search,
  X,
  AlertCircle,
  FlaskRound,
  ArrowLeft,
  Plus,
  Trash,
} from "lucide-react";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import axios from "axios";
import { useSelector } from "react-redux";

interface LabTest {
  _id: string;
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
    testName: string;
    status: "Pending" | "In Progress" | "Completed";
    result?: string;
    remarks?: string;
    resultPDF?: string;
    completedAt: string;
    _id: string;
    testId: {
      _id: string;
      name: string;
      departmentId: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ITestData {
  testName: string;
  status: string;
  result?: string;
  remarks?: string;
  resultPDF?: string;
  completedAt: string;
  _id: string;
  testId: {
    id_no?: string;
    _id: string;
    name: string;
    departmentId: string;
  };
}

const LabTests = () => {
  const labAssistant = useSelector((state: any) => state.auth.user);
  const { isOpen, openModal, closeModal } = useModal();
  const [modalType, setModalType] = useState("");
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [selectedLabTest, setSelectedLabTest] = useState<LabTest | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [testResultData, setTestResultData] = useState({
    results: [{ name: "", value: "", range: "", unit: "", status: "" }],
    remarks: "",
  });
  const baseurl = import.meta.env.VITE_BASE_URL;
  const [testData, setTestData] = useState<ITestData>({});

  const fetchLabTests = async () => {
    try {
      const response = await axios.get(
        `${baseurl}/api/lab/fetch/all-tests/${labAssistant?.departmentId}`,
        {
          headers: {
            "auth-token":
              localStorage.getItem("authToken") || labAssistant?.token,
          },
        },
      );
      if (response.data.success) {
        setLabTests(response.data.labTests);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching lab tests:", error.message);
        toast.error(error.message);
      }
    }
  };
  const handleUpdateTestStatus = async (
    labTestId: string,
    testId: string,
    status: string,
  ) => {
    try {
      const response = await axios.put(
        `${baseurl}/api/lab/start-test`,
        {
          labTestId,
          testId,
          status,
        },
        {
          headers: {
            "auth-token":
              localStorage.getItem("authToken") || labAssistant?.token,
          },
        },
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchLabTests();
        closeModal();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error updating test status:", error.message);
        toast.error(error.response.data.message);
      }
    }
  };

  const handleSubmitTestResult = async () => {
    try {
      const response = await axios.put(
        `${baseurl}/api/lab/submit-result`,
        {
          labTestId: selectedLabTest?._id,
          testId: selectedTestId,
          results: testResultData?.results,
          remarks: testResultData?.remarks,
          status: "Completed",
        },
        {
          headers: {
            "auth-token":
              localStorage.getItem("authToken") || labAssistant?.token,
          },
        },
      );
      if (response.data.success) {
        toast.success("Test result submitted successfully!");
        closeModal();
        fetchLabTests();
        setTestResultData({ result: "", remarks: "" });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error submitting test result:", error.message);
        toast.error(error.message);
      }
    }
  };

  useEffect(() => {
    if (labAssistant?.id) {
      const fetchData = async () => {
        await fetchLabTests();
      };
      fetchData();
    }
  }, [labAssistant?.id]);

  // Filter lab tests
  const filteredLabTests = labTests?.filter((labTest) => {
    const matchesSearch =
      labTest.patientId?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      labTest.patientId?.id_no
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      labTest.doctorId?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      labTest.appointmentId?.id_no
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      labTest.tests?.some((test) =>
        test.testName.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const hasMatchingStatus =
      statusFilter === "all" ||
      labTest.tests?.some((test) => test.status === statusFilter);

    const matchesDate =
      !dateFilter || labTest.appointmentId?.aptDate === dateFilter;

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

  // Statistics
  const totalTests = labTests?.reduce(
    (sum, labTest) => sum + labTest.tests?.length,
    0,
  );
  const pendingTests = labTests?.reduce(
    (sum, labTest) =>
      sum + labTest.tests.filter((t) => t.status === "Pending")?.length,
    0,
  );
  const inProgressTests = labTests?.reduce(
    (sum, labTest) =>
      sum + labTest.tests.filter((t) => t.status === "In Progress")?.length,
    0,
  );
  const completedTests = labTests?.reduce(
    (sum, labTest) =>
      sum + labTest.tests.filter((t) => t.status === "Completed")?.length,
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
      label: "Pending",
      value: pendingTests,
      icon: Clock,
      color: "yellow",
    },
    {
      label: "In Progress",
      value: inProgressTests,
      icon: AlertCircle,
      color: "blue",
    },
    {
      label: "Completed",
      value: completedTests,
      icon: CheckCircle,
      color: "green",
    },
  ];

  const calcAge = (dob: string) => {
    const newDt = new Date();
    const dtoBt = new Date(dob);
    const age = Math.floor(
      (newDt.getTime() - dtoBt.getTime()) / (365 * 24 * 60 * 60 * 1000),
    );
    return age;
  };

  // Update a field
  const handleResultChange = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const updatedResults = [...testResultData.results];
    updatedResults[index][field] = value;
    setTestResultData({ ...testResultData, results: updatedResults });
  };

  // Add new parameter
  const addResultRow = () => {
    setTestResultData({
      ...testResultData,
      results: [
        ...testResultData.results,
        { name: "", value: "", range: "", unit: "", status: "" },
      ],
    });
  };

  // Remove parameter
  const removeResultRow = (index: number) => {
    const updatedResults = testResultData.results.filter((_, i) => i !== index);
    setTestResultData({ ...testResultData, results: updatedResults });
  };

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
                  Lab Tests Management
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Manage and process laboratory test orders
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {stats?.map((item, index) => {
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
                placeholder="Search by patient, doctor, test..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent"
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
              {filteredLabTests?.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {labTests?.length}
            </span>{" "}
            test orders
          </p>
        </div>

        {/* Lab Tests Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Tests Ordered
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Date & Time
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
                {filteredLabTests?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FlaskRound className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">
                          No lab tests found
                        </p>
                        <p className="text-gray-400 mt-1">
                          {searchTerm || statusFilter !== "all" || dateFilter
                            ? "Try adjusting your filters"
                            : "No test orders available"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLabTests?.map((labTest) => (
                    <tr
                      key={labTest._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Patient */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {labTest.patientId?.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {labTest.patientId?.id_no}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {calcAge(labTest.patientId?.dob)} Years Old •{" "}
                              {labTest.patientId?.gender}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {labTest.doctorId?.photo ? (
                              <img
                                src={`${baseurl}/images/uploads/${labTest.doctorId.photo}`}
                                alt={labTest.doctorId.fullName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Stethoscope className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {labTest.doctorId?.fullName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Tests Ordered */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {labTest.tests?.length ?? 0}{" "}
                            {(labTest.tests?.length ?? 0) > 1
                              ? "Tests"
                              : "Test"}
                          </span>
                          <div className="space-y-1">
                            {(labTest.tests ?? []).slice(0, 2).map((test) => (
                              <div
                                key={test._id}
                                className="flex items-center gap-2"
                              >
                                <span className="text-xs text-gray-700">
                                  • {test.testName}
                                </span>
                              </div>
                            ))}
                            {(labTest.tests?.length ?? 0) > 2 && (
                              <div className="text-xs text-gray-500">
                                +{labTest.tests!.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {new Date(labTest.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {new Date(labTest.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Overall Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {labTest.tests?.every(
                            (t) => t.status === "Completed",
                          ) ? (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border bg-green-100 text-green-800 border-green-200 w-fit">
                              All Completed
                            </span>
                          ) : labTest.tests?.some(
                              (t) => t.status === "In Progress",
                            ) ? (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border bg-blue-100 text-blue-800 border-blue-200 w-fit">
                              In Progress
                            </span>
                          ) : (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border bg-yellow-100 text-yellow-800 border-yellow-200 w-fit">
                              Pending
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedLabTest(labTest);
                              setModalType("viewTests");
                              openModal();
                            }}
                            className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium text-sm"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
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
            modalType === "viewTests"
              ? "Lab Test Details"
              : modalType === "submitResult"
                ? "Submit Test Result"
                : modalType === "viewTestDetail"
                  ? testData.testName
                  : ""
          }
          onClose={closeModal}
          width={modalType === "submitResult" ? "w-1/2" : "w-2/5"}
          height={"max-h-[450px]"}
          onConfirm={
            modalType === "submitResult"
              ? handleSubmitTestResult
              : modalType === "viewTestDetail"
                ? () => {
                    const fileUrl = `${baseurl}/images/pdfs/${testData.resultPDF}`;
                    window.open(fileUrl, "_blank");
                  }
                : undefined
          }
          confirmText={
            modalType === "submitResult"
              ? "Submit Result"
              : modalType === "viewTestDetail"
                ? "Download PDF"
                : ""
          }
          confirmIcon={
            modalType === "submitResult" ? (
              <CheckCircle className="w-5 h-5 mr-1" />
            ) : (
              ""
            )
          }
          confirmColor={
            modalType === "viewTestDetail"
              ? "bg-green-600 text-white rounded hover:bg-green-700"
              : "bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          }
          onCancel={
            modalType === "submitResult" || modalType === "viewTestDetail"
              ? () => setModalType("viewTests")
              : ""
          }
          cancelIcon={<ArrowLeft className="w-5 h-5 mr-1" />}
          cancelText={modalType === "viewTests" ? "Cancel" : "Back"}
        >
          {modalType === "viewTests" && selectedLabTest && (
            <div className="space-y-3">
              {/* Header Info */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">Patient: </span>
                    <span className="text-gray-900 font-semibold">
                      {selectedLabTest.patientId?.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">
                      Patient ID:{" "}
                    </span>
                    <span className="text-gray-900 font-mono">
                      {selectedLabTest.patientId?.id_no}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Doctor: </span>
                    <span className="text-gray-900">
                      Dr. {selectedLabTest.doctorId?.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">
                      Appointment ID:{" "}
                    </span>
                    <span className="text-gray-900 font-mono">
                      {selectedLabTest.appointmentId?.id_no}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">
                      Age/Gender:{" "}
                    </span>
                    <span className="text-gray-900 capitalize">
                      {selectedLabTest.patientId?.dob
                        ? `${calcAge(selectedLabTest.patientId.dob)} years old`
                        : ""}
                      {" • "}
                      {selectedLabTest.patientId?.gender}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Contact: </span>
                    <span className="text-gray-900">
                      {selectedLabTest.patientId?.phoneNo}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tests List */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FlaskRound className="h-4 w-4" />
                  Ordered Tests ({selectedLabTest.tests?.length})
                </h4>
                <div className="space-y-3">
                  {selectedLabTest.tests?.map((test) => (
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
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="text-sm font-bold text-gray-900">
                            {test.testName}
                          </h5>
                          <h6 className="text-xs font-semibold text-gray-700">
                            Test ID: {test.id_no}
                          </h6>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(test.status)}`}
                        >
                          {test.status}
                        </span>
                      </div>

                      {test.status === "Completed" && (
                        // <div className="space-y-2 mt-3">
                        //   <div className="bg-white rounded-lg p-2">
                        //     <p className="text-xs text-gray-600 mb-1">
                        //       Result:
                        //     </p>
                        //     <p className="text-sm text-gray-900 font-medium">
                        //       {test.result}
                        //     </p>
                        //   </div>
                        //   {test.remarks && (
                        //     <div className="bg-white rounded-lg p-2">
                        //       <p className="text-xs text-gray-600 mb-1">
                        //         Remarks:
                        //       </p>
                        //       <p className="text-sm text-gray-900">
                        //         {test.remarks}
                        //       </p>
                        //     </div>
                        //   )}
                        //   {test.resultPDF && (
                        //     <div className="bg-white rounded-lg p-3 space-y-2">
                        //       <p className="text-xs text-gray-600">
                        //         Result in PDF:
                        //       </p>

                        //       <div className="flex gap-3">
                        //         {/* Download */}
                        //         <a
                        //           href={`${baseurl}/images/uploads/${test.resultPDF}`}
                        //           target="_blank"
                        //           download
                        //           className="px-3 py-1 text-sm bg-green-500 text-white rounded"
                        //         >
                        //           Download
                        //         </a>
                        //       </div>
                        //     </div>
                        //   )}
                        // </div>
                        <div className="space-y-2 my-2">
                          <a
                            href={`${baseurl}/images/pdfs/${test.resultPDF}`}
                            target="_blank"
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 duration-300 transition-colors text-sm font-medium cursor-pointer"
                          >
                            Download Result
                          </a>
                        </div>
                      )}

                      {test.status !== "Completed" && (
                        <div className="flex gap-2 mt-3">
                          {test.status === "Pending" && (
                            <button
                              onClick={() =>
                                handleUpdateTestStatus(
                                  selectedLabTest._id,
                                  test.testId._id,
                                  "In Progress",
                                )
                              }
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 duration-300 transition-colors text-sm font-medium cursor-pointer"
                            >
                              Start Test
                            </button>
                          )}
                          {test.status === "In Progress" && (
                            <button
                              onClick={() => {
                                setSelectedTestId(test.testId._id);
                                setModalType("submitResult");
                                openModal();
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                            >
                              Submit Result
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">
                  Ordered on{" "}
                  {new Date(selectedLabTest.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )}

          {modalType === "submitResult" && selectedLabTest && (
            <div className="space-y-4">
              {/* Test Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Test Information
                </h4>
                <p className="text-sm text-blue-800">
                  {
                    selectedLabTest.tests?.find(
                      (t) => t.testId._id === selectedTestId,
                    )?.testName
                  }
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Patient: {selectedLabTest.patientId?.fullName}
                </p>
              </div>

              {/* Dynamic Result Inputs */}
              {testResultData.results?.map((r, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-gray-700">
                      Parameter {index + 1}
                    </h5>
                    {testResultData.results.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeResultRow(index)}
                        className="text-red-500 text-sm cursor-pointer"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    ) : (
                      ""
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Parameter Name"
                      value={r.name}
                      onChange={(e) =>
                        handleResultChange(index, "name", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Value"
                      value={r.value}
                      onChange={(e) =>
                        handleResultChange(index, "value", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Normal Range"
                      value={r.range}
                      onChange={(e) =>
                        handleResultChange(index, "range", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Unit"
                      value={r.unit}
                      onChange={(e) =>
                        handleResultChange(index, "unit", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <select
                      value={r.status}
                      onChange={(e) =>
                        handleResultChange(index, "status", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Select Status</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
              ))}

              {/* Add Parameter Button */}
              <button
                type="button"
                onClick={addResultRow}
                className="flex items-center justify-center cursor-pointer px-4 py-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span>Add Parameter</span>
              </button>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  value={testResultData.remarks}
                  onChange={(e) =>
                    setTestResultData({
                      ...testResultData,
                      remarks: e.target.value,
                    })
                  }
                  placeholder="Any additional notes..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}
          {/* {modalType === "viewTestDetail" && testData && (
        //     <div className="space-y-6">
        //       <div className="grid grid-cols-2 gap-4 text-sm">
        //         <div>
        //           <p className="text-gray-500">Test ID</p>
        //           <p className="font-medium text-gray-800">
        //             {testData?.id_no || testData?.testId?._id}
        //           </p>
        //         </div>

        //         <div>
        //           <p className="text-gray-500">Test Name</p>
        //           <p className="font-medium text-gray-800">
        //             {testData?.testName}
        //           </p>
        //         </div>

        //         <div>
        //           <p className="text-gray-500">Status</p>
        //           <span
        //             className={`px-2 py-1 rounded text-xs font-medium
        //   ${
        //     testData?.status === "Completed"
        //       ? "bg-green-100 text-green-700"
        //       : testData?.status === "In Progress"
        //         ? "bg-yellow-100 text-yellow-700"
        //         : "bg-gray-100 text-gray-700"
        //   }
        // `}
        //           >
        //             {testData?.status}
        //           </span>
        //         </div>

        //         <div>
        //           <p className="text-gray-500">Completed At</p>
        //           <p className="font-medium text-gray-800">
        //             {testData?.completedAt
        //               ? new Date(testData.completedAt).toLocaleDateString(
        //                   "en-US",
        //                   {
        //                     year: "numeric",
        //                     month: "short",
        //                     day: "numeric",
        //                   },
        //                 ) +
        //                 " " +
        //                 new Date(testData.completedAt).toLocaleTimeString(
        //                   "en-US",
        //                   {
        //                     hour: "2-digit",
        //                     minute: "2-digit",
        //                   },
        //                 )
        //               : "Not Completed"}
        //           </p>
        //         </div>
        //       </div>

        //       <div>
        //         <p className="text-sm text-gray-500 mb-1">Remarks</p>
        //         <p className="text-gray-800">
        //           {testData?.remarks || "No remarks provided"}
        //         </p>
        //       </div>
        //     </div>
          )} */}
        </Modal>
      </div>
    </div>
  );
};

export default LabTests;
