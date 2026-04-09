import { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  User,
  Stethoscope,
  Pill,
  Eye,
  Search,
  Filter,
  X,
  Clock,
  CheckCircle,
  Package,
  AlertCircle,
  Download,
} from "lucide-react";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import axios from "axios";
import { useSelector } from "react-redux";
import { useSocket, useSocketEvent } from "../../hooks";

interface Prescription {
  _id: string;
  consultationId: string;
  appointmentId: {
    _id: string;
    id_no: string;
    aptDate: string;
    appointmentTime: string;
  };
  patientId: {
    _id: string;
    id_no: string;
    fullName: string;
    phoneNo: string;
    email: string;
  };
  doctorId: {
    _id: string;
    id_no: string;
    fullName: string;
    photo: string;
  };
  medicines: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    timing: string;
    instructions: string;
  }>;
  status: "Pending" | "Dispensed";
  dispensedBy?: {
    _id: string;
    fullName: string;
  };
  resultPDF: string;
  dispensedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const Prescriptions = () => {
  const pharmacist = useSelector((state: any) => state.auth.user);
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
      const response = await axios.get(`${baseurl}/api/prescription/fetch-all`);
      if (response.data.success) {
        setPrescriptions(response.data.prescriptions);
        console.log(response.data.prescriptions);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching prescriptions:", error.message);
        toast.error(error.message);
      }
    }
  };

  const handleDispensePrescription = async (prescriptionId: string) => {
    try {
      const response = await axios.put(
        `${baseurl}/api/prescription/dispense`,
        {
          pharmacistId: pharmacist.id,
          prescriptionId,
        },
        {
          headers: {
            "auth-token": localStorage.getItem("authToken") || pharmacist.token,
          },
        },
      );
      if (response.data.success) {
        toast.success("Prescription dispensed successfully!");
        closeModal();
        fetchPrescriptions();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error dispensing prescription:", error.message);
        toast.error(error.response.data.message);
      }
    }
  };

  const handleDownloadReport = (resultPDF: string) => {
    window.open(`${baseurl}/images/pdfs/${resultPDF}`, "_blank");
    toast.success("Downloading lab report...");
  };

  useSocket(pharmacist);
  // useSocketEvent("notification", (data: any) => {
  //   if(data.pres)
  // })

  useEffect(() => {
    const fetchData = async () => {
      if (pharmacist?.id) {
        await fetchPrescriptions();
      }
    };
    fetchData();
  }, [pharmacist?.id]);

  // Filter prescriptions
  const filteredPrescriptions = prescriptions.filter((presc) => {
    const matchesSearch =
      presc.patientId?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      presc.doctorId?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      presc.patientId?.id_no
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      presc.appointmentId?.id_no
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

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
  const stats = [
    {
      label: "Total",
      count: prescriptions.length,
      icon: FileText,
      color: "blue",
    },
    {
      label: "Pending",
      count: prescriptions.filter((p) => p.status === "Pending").length,
      icon: Clock,
      color: "yellow",
    },
    {
      label: "Dispensed",
      count: prescriptions.filter((p) => p.status === "Dispensed").length,
      icon: CheckCircle,
      color: "green",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 p-3">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Prescription Management
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Manage and dispense patient prescriptions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
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
                    {item.count}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/3 -translate-y-1/6 transform h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient, doctor, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Dispensed">Dispensed</option>
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
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
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Medicines
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Date
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
                        <Package className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">
                          No prescriptions found
                        </p>
                        <p className="text-gray-400 mt-1">
                          {searchTerm || statusFilter !== "all" || dateFilter
                            ? "Try adjusting your filters"
                            : "No prescriptions available"}
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
                      {/* Patient */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {prescription.patientId?.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {prescription.patientId?.id_no}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {prescription.doctorId?.photo ? (
                              <img
                                src={`${baseurl}/images/uploads/${prescription.doctorId.photo}`}
                                alt={prescription.doctorId.fullName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Stethoscope className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {prescription.doctorId?.fullName}
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
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {new Date(
                              prescription.appointmentId?.aptDate,
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
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
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedPrescription(prescription);
                              setModalType("viewPrescription");
                              openModal();
                            }}
                            className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium text-sm"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {prescription.status === "Pending" && (
                            <button
                              onClick={() => {
                                setSelectedPrescription(prescription);
                                setModalType("dispensePrescription");
                                openModal();
                              }}
                              className="text-green-600 cursor-pointer hover:text-green-800 font-medium text-sm"
                              title="Dispense"
                            >
                              <Package className="h-5 w-5" />
                            </button>
                          )}
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
            modalType === "viewPrescription"
              ? "Prescription Details"
              : "Dispense Prescription"
          }
          onClose={closeModal}
          width="max-w-2/3"
          height="max-h-[450px]"
          cancelText={
            modalType === "dispensePrescription" ||
            modalType === "viewPrescription"
              ? "Cancel"
              : ""
          }
          onCancel={
            modalType === "dispensePrescription" ||
            modalType === "viewPrescription"
              ? closeModal
              : undefined
          }
          onConfirm={
            modalType === "dispensePrescription"
              ? () => handleDispensePrescription(selectedPrescription?._id)
              : modalType === "viewPrescription"
                ? () => handleDownloadReport(selectedPrescription.resultPDF)
                : undefined
          }
          confirmText={
            modalType === "dispensePrescription"
              ? "Confirm Dispense"
              : modalType === "viewPrescription"
                ? "Download PDF"
                : ""
          }
          confirmIcon={
            modalType === "dispensePrescription" ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : modalType === "viewPrescription" ? (
              <Download className="w-5 h-5 mr-2" />
            ) : (
              ""
            )
          }
          confirmColor="bg-green-600 hover:bg-green-700 text-white"
          cancelIcon={<X className="w-5 h-5 mr-2" />}
        >
          {modalType === "viewPrescription" && selectedPrescription && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">Patient: </span>
                    <span className="text-gray-900 font-semibold">
                      {selectedPrescription.patientId?.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Doctor: </span>
                    <span className="text-gray-900">
                      {selectedPrescription.doctorId?.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Date: </span>
                    <span className="text-gray-900">
                      {new Date(
                        selectedPrescription.appointmentId?.aptDate,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">
                      Appointment ID:{" "}
                    </span>
                    <span className="text-gray-900 font-mono">
                      {selectedPrescription.appointmentId?.id_no}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medicines */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Prescribed Medicines
                </h4>
                <div className="space-y-3">
                  {selectedPrescription.medicines?.map((med, idx) => (
                    <div
                      key={idx}
                      className="bg-green-50 border border-green-200 p-2 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="text-sm font-bold text-green-900">
                          {idx + 1}. {med.medicineName}
                        </h5>
                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full font-semibold">
                          {med.dosage}mg
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-green-700 font-medium">
                            Frequency:{" "}
                          </span>
                          <span className="text-green-900">
                            {med.frequency}/day
                          </span>
                        </div>
                        <div>
                          <span className="text-green-700 font-medium">
                            Duration:{" "}
                          </span>
                          <span className="text-green-900">
                            {med.duration} Days
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
                        <p className="text-xs text-green-700 mt-2 italic">
                          Note: {med.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                      Status
                    </h4>
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(selectedPrescription.status)}`}
                    >
                      {selectedPrescription.status}
                    </span>
                  </div>
                  {selectedPrescription.status === "Dispensed" && (
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Dispensed by:</p>
                      <p className="text-sm text-gray-900 font-semibold">
                        {selectedPrescription.dispensedBy?.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(
                          selectedPrescription.dispensedAt,
                        ).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {modalType === "dispensePrescription" && selectedPrescription && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                      Important
                    </h4>
                    <p className="text-sm text-yellow-800">
                      Please verify all medicine details before dispensing this
                      prescription.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Patient Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Name: </span>
                    <span className="text-gray-900 font-medium">
                      {selectedPrescription.patientId?.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">ID: </span>
                    <span className="text-gray-900 font-mono">
                      {selectedPrescription.patientId?.id_no}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Contact: </span>
                    <span className="text-gray-900">
                      {selectedPrescription.patientId?.phoneNo}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Medicines to Dispense (
                  {selectedPrescription.medicines?.length})
                </h4>
                <div className="space-y-2">
                  {selectedPrescription.medicines?.map((med, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 p-3 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">
                          {idx + 1}. {med.medicineName} - {med.dosage}
                        </span>
                        <span className="text-xs text-gray-600">
                          {med.duration} days
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-sm text-gray-700">
                Are you sure you want to mark this prescription as dispensed?
              </p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Prescriptions;
