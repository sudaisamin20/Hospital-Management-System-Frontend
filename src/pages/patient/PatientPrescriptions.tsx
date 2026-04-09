import { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  User,
  Stethoscope,
  Pill,
  Download,
  Eye,
  Search,
  Filter,
  X,
  Clock,
  CheckCircle,
  Package,
  Phone,
  Mail,
} from "lucide-react";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import axios from "axios";
import { useSelector } from "react-redux";
import { useAppSelector, useSocket, useSocketEvent } from "../../hooks";
import { useLogin } from "../../features";

interface Prescription {
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
  };
  medicines: Array<{
    medicineName: string;
    dosage: number;
    frequency: number;
    duration: number;
    timing: string;
    instructions: string;
    _id: string;
    medicineId: string;
    quantity: number;
  }>;
  status: string;
  dispensedAt?: string;
  dispensedBy?: {
    _id: string;
    fullName: string;
  };
  resultPDF: string;
  createdAt: string;
  updatedAt: string;
}

const PatientPrescriptions = () => {
  const patient = useAppSelector((state: any) => state.auth.user);
  const { isOpen, openModal, closeModal } = useModal();
  const [modalType, setModalType] = useState("");
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const baseurl = import.meta.env.VITE_BASE_URL;

  const fetchPrescriptions = async () => {
    try {
      const response = await axios.get(
        `${baseurl}/api/prescription/patient/fetch-all`,
        {
          headers: {
            "auth-token": localStorage.getItem("authToken") || patient?.token,
          },
        },
      );
      if (response.data.success) {
        setPrescriptions(response.data.prescriptions);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching prescriptions:", error.message);
        toast.error(error.message);
      }
    }
  };

  const handleDownloadPrescription = (prescriptionId: string) => {
    window.open(`${baseurl}/images/pdfs/${prescriptionId}`, "_blank");
    toast.success("Downloading prescription...");
  };

  useSocket(patient);
  useSocketEvent("prescriptionDispensed", (data: any) => {
    if (data.prescription) {
      setPrescriptions((prev) => {
        const updated = [data.prescription, ...prev];
        return updated.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      });
      toast.success(
        `Your prescription is dispensed! Prescription ID is ${data.prescription.id_no}`,
      );
    }
  });

  useEffect(() => {
    if (patient?.id) {
      const fetchData = async () => {
        await fetchPrescriptions();
      };
      fetchData();
    }
  }, [patient?.id]);

  // Filter prescriptions
  const filteredPrescriptions = prescriptions.filter((presc) => {
    const matchesSearch =
      presc.doctorId?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      presc.medicines?.some((med) =>
        med.medicineName.toLowerCase().includes(searchTerm.toLowerCase()),
      ) ||
      presc.appointmentId?.id_no
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      presc.id_no?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || presc.status === statusFilter;

    const matchesDate =
      !dateFilter || presc.appointmentId?.aptDate === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Dispensed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Statistics
  const totalPrescriptions = prescriptions.length;
  const dispensedCount = prescriptions.filter(
    (p) => p.status === "Dispensed",
  ).length;
  const pendingCount = prescriptions.filter(
    (p) => p.status === "Pending",
  ).length;

  const stats = [
    {
      label: "Total Prescriptions",
      value: totalPrescriptions,
      icon: FileText,
      color: "blue",
    },
    {
      label: "Dispensed",
      value: dispensedCount,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "Pending",
      value: pendingCount,
      icon: Clock,
      color: "yellow",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 p-3">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  My Prescriptions
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  View and download your medical prescriptions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`bg-${item.color}-100 rounded-xl shadow-sm px-4 py-3 flex items-center justify-between`}
              >
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {item.label}
                  </p>
                  <p
                    className={`text-xl font-semibold text-${item.color}-600 mt-1`}
                  >
                    {item.value}
                  </p>
                </div>
                <div>
                  <Icon className={`h-5 w-5 text-${item.color}-600`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="mb-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/3 transform -translate-y-1/4 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by doctor, medicine, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm w-full pl-8 pr-2 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm p-2 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
            >
              <option value="all">All Status</option>
              <option value="Dispensed">Dispensed</option>
              <option value="Pending">Pending</option>
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-sm p-2 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
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
              {filteredPrescriptions.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {prescriptions.length}
            </span>{" "}
            prescriptions
          </p>
        </div>

        {/* Prescriptions Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Prescription ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Medicines
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
                {filteredPrescriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">
                          No prescriptions found
                        </p>
                        <p className="text-gray-400 mt-1">
                          {searchTerm || statusFilter !== "all" || dateFilter
                            ? "Try adjusting your filters"
                            : "Your prescriptions will appear here"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPrescriptions.map((prescription) => (
                    <tr
                      key={prescription._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Prescription ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-mono font-semibold text-gray-900">
                            {prescription.id_no || "N/A"}
                          </span>
                          <span className="text-xs text-gray-500">
                            Apt: {prescription.appointmentId?.id_no}
                          </span>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-green-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {prescription.doctorId?.photo ? (
                              <img
                                src={`${baseurl}/images/uploads/${prescription.doctorId.photo}`}
                                alt={prescription.doctorId.fullName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Stethoscope className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {prescription.doctorId?.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {prescription.doctorId?.specialization}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Medicines */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {prescription.medicines?.length} Medicine
                            {prescription.medicines?.length > 1 ? "s" : ""}
                          </span>
                          <span className="text-xs text-gray-600">
                            {prescription.medicines?.[0]?.medicineName}
                            {prescription.medicines?.length > 1 &&
                              `, +${prescription.medicines.length - 1} more`}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {new Date(
                              prescription.createdAt,
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {new Date(
                              prescription.createdAt,
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(prescription.status)}`}
                        >
                          {prescription.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedPrescription(prescription);
                              setModalType("viewPrescription");
                              openModal();
                            }}
                            className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDownloadPrescription(prescription.resultPDF)
                            }
                            className="text-green-600 cursor-pointer hover:text-green-800 font-medium text-sm flex items-center gap-1"
                          >
                            <Download className="h-4 w-4" />
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
          title="Prescription Details"
          onClose={closeModal}
          width="max-w-2/3"
          height="max-h-[450px]"
          cancelIcon={<X className="w-5 h-5 mr-2" />}
          onConfirm={
            modalType === "viewPrescription"
              ? () =>
                  handleDownloadPrescription(selectedPrescription?.resultPDF)
              : undefined
          }
          confirmText={modalType === "viewPrescription" ? "Download PDF" : ""}
          confirmColor={
            modalType === "viewPrescription"
              ? "bg-green-600 text-white rounded-lg hover:bg-green-700"
              : ""
          }
          onCancel={modalType === "viewPrescription" ? closeModal : ""}
        >
          {modalType === "viewPrescription" && selectedPrescription && (
            <div className="space-y-2">
              {/* Header Info */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">
                      Prescription ID:{" "}
                    </span>
                    <span className="text-gray-900 font-mono font-semibold">
                      {selectedPrescription.id_no || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">
                      Appointment:{" "}
                    </span>
                    <span className="text-gray-900 font-mono">
                      {selectedPrescription.appointmentId?.id_no}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Doctor: </span>
                    <span className="text-gray-900 font-semibold">
                      {selectedPrescription.doctorId?.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Date: </span>
                    <span className="text-gray-900">
                      {new Date(
                        selectedPrescription.createdAt,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
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
                      {selectedPrescription.patientId?.fullName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700 font-medium">ID: </span>
                    <span className="text-blue-900 font-mono">
                      {selectedPrescription.patientId?.id_no}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700 font-medium">Phone: </span>
                    <span className="text-blue-900">
                      {selectedPrescription.patientId?.phoneNo}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700 font-medium">Email: </span>
                    <span className="text-blue-900">
                      {selectedPrescription.patientId?.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medicines */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Prescribed Medicines ({selectedPrescription.medicines?.length}
                  )
                </h4>
                <div className="space-y-2">
                  {selectedPrescription.medicines?.map((med, idx) => (
                    <div
                      key={med._id}
                      className="bg-green-50 border border-green-200 p-3 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h5 className="text-sm font-bold text-green-900">
                          {idx + 1}. {med.medicineName}
                        </h5>
                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full font-semibold">
                          {med.dosage}mg
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-green-700 font-medium">
                            Frequency:{" "}
                          </span>
                          <span className="text-green-900">
                            {med.frequency}x daily
                          </span>
                        </div>
                        <div>
                          <span className="text-green-700 font-medium">
                            Duration:{" "}
                          </span>
                          <span className="text-green-900">
                            {med.duration} days
                          </span>
                        </div>
                        <div>
                          <span className="text-green-700 font-medium">
                            Quantity:{" "}
                          </span>
                          <span className="text-green-900">
                            {med.quantity} tablets
                          </span>
                        </div>
                        <div>
                          <span className="text-green-700 font-medium">
                            When:{" "}
                          </span>
                          <span className="text-green-900">{med.timing}</span>
                        </div>
                      </div>
                      {med.instructions && (
                        <p className="text-xs text-green-700 mt-2 italic bg-green-100 p-2 rounded">
                          Note: {med.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status & Dispensed Info */}
              <div className="bg-gray-50 rounded-lg py-2 px-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Status
                  </h4>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedPrescription.status)}`}
                  >
                    {selectedPrescription.status}
                  </span>
                </div>
                {selectedPrescription.status === "Dispensed" &&
                  selectedPrescription.dispensedBy && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Dispensed by: </span>
                        {selectedPrescription.dispensedBy.fullName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(
                          selectedPrescription.dispensedAt,
                        ).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default PatientPrescriptions;
