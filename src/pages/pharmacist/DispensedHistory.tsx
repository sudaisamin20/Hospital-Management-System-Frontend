import { useState, useEffect } from "react";
import {
  Package,
  Calendar,
  User,
  DollarSign,
  Eye,
  Search,
  Filter,
  X,
  Clock,
  Pill,
  FileText,
  Download,
  CreditCard,
} from "lucide-react";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import axios from "axios";
import { useSelector } from "react-redux";

interface DispensedRecord {
  _id: string;
  prescriptionId: {
    _id: string;
    appointmentId: {
      id_no: string;
      aptDate: string;
    };
    patientId: {
      _id: string;
      id_no: string;
      fullName: string;
      phoneNo: string;
    };
    doctorId: {
      _id: string;
      fullName: string;
      photo: string;
    };
  };
  pharmacistId: {
    _id: string;
    fullName: string;
  };
  medicines: Array<{
    medicineId: {
      _id: string;
      name: string;
      manufacturer: string;
    };
    quantity: number;
    priceAtTime: number;
    _id: string;
  }>;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

const DispensedHistory = () => {
  const pharmacist = useSelector((state: any) => state.auth.user);
  const { isOpen, openModal, closeModal } = useModal();
  const [modalType, setModalType] = useState("");
  const [dispensedRecords, setDispensedRecords] = useState<DispensedRecord[]>(
    [],
  );
  const [selectedRecord, setSelectedRecord] = useState<DispensedRecord | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const baseurl = import.meta.env.VITE_BASE_URL;

  const fetchDispensedHistory = async () => {
    try {
      const response = await axios.get(
        `${baseurl}/api/prescription/dispense-history/${pharmacist.id}`,
      );
      if (response.data.success) {
        setDispensedRecords(response.data.dispenseHistory);
        console.log(response.data.dispenseHistory);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching dispensed history:", error.message);
        toast.error(error.message);
      }
    }
  };

  const handleDownloadReceipt = (recordId: string) => {
    // Handle PDF receipt download
    window.open(`${baseurl}/api/dispensed/receipt/${recordId}`, "_blank");
    toast.success("Downloading receipt...");
  };

  useEffect(() => {
    if (pharmacist?.id) {
      const fetchData = async () => {
        await fetchDispensedHistory();
      };
      fetchData();
    }
  }, [pharmacist?.id]);

  // Filter records
  const filteredRecords = dispensedRecords.filter((record) => {
    const matchesSearch =
      record.prescriptionId?.patientId?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      record.prescriptionId?.patientId?.id_no
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      record.prescriptionId?.appointmentId?.id_no
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesDate =
      !dateFilter ||
      new Date(record.createdAt).toISOString().split("T")[0] === dateFilter;

    const matchesPayment =
      paymentFilter === "all" || record.paymentMethod === paymentFilter;

    return matchesSearch && matchesDate && matchesPayment;
  });

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "Cash":
        return "bg-green-100 text-green-800 border-green-200";
      case "Card":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Insurance":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Statistics
  const totalRevenue = dispensedRecords.reduce(
    (sum, record) => sum + record.totalAmount,
    0,
  );
  const totalTransactions = dispensedRecords.length;
  const totalMedicinesDispensed = dispensedRecords.reduce(
    (sum, record) => sum + record.medicines.reduce((s, m) => s + m.quantity, 0),
    0,
  );

  const stats = [
    {
      label: "Total Revenue",
      value: `PKR${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "green",
    },
    {
      label: "Transactions",
      value: totalTransactions,
      icon: FileText,
      color: "blue",
    },
    {
      label: "Medicines Dispensed",
      value: totalMedicinesDispensed,
      icon: Pill,
      color: "purple",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 p-3">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Dispensed History
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  View all dispensed prescriptions and transactions
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
                placeholder="Search by patient, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Payment Method Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Payment Methods</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || dateFilter || paymentFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setDateFilter("");
                setPaymentFilter("all");
              }}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredRecords.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {dispensedRecords.length}
            </span>{" "}
            records
          </p>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Medicines
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Total Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Dispensed By
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">
                          No records found
                        </p>
                        <p className="text-gray-400 mt-1">
                          {searchTerm || dateFilter || paymentFilter !== "all"
                            ? "Try adjusting your filters"
                            : "No dispensed records available"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr
                      key={record._id}
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
                              {record.prescriptionId?.patientId?.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {record.prescriptionId?.patientId?.id_no}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Medicines */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {record.medicines?.length} Item
                            {record.medicines?.length > 1 ? "s" : ""}
                          </span>
                          <span className="text-xs text-gray-600">
                            {record.medicines?.[0]?.medicineId?.name}
                            {record.medicines?.length > 1 &&
                              `, +${record.medicines.length - 1} more`}
                          </span>
                          <span className="text-xs text-gray-500">
                            Qty:{" "}
                            {record.medicines?.reduce(
                              (sum, m) => sum + m.quantity,
                              0,
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-green-600">
                            PKR{record.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPaymentMethodColor(record.paymentMethod)}`}
                        >
                          {record.paymentMethod}
                        </span>
                      </td>

                      {/* Dispensed By */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">
                          {record.pharmacistId?.fullName}
                        </p>
                      </td>

                      {/* Date & Time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {new Date(record.createdAt).toLocaleDateString(
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
                            {new Date(record.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedRecord(record);
                              setModalType("viewRecord");
                              openModal();
                            }}
                            className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium text-sm"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDownloadReceipt(record._id)}
                            className="text-green-600 cursor-pointer hover:text-green-800 font-medium text-sm"
                            title="Download Receipt"
                          >
                            <Download className="h-5 w-5" />
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
          title="Dispensed Record Details"
          onClose={closeModal}
          width="max-w-2/3"
          height="max-h-[450px]"
          cancelIcon={<X className="w-5 h-5 mr-2" />}
        >
          {modalType === "viewRecord" && selectedRecord && (
            <div className="space-y-3">
              {/* Header Info */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">Patient: </span>
                    <span className="text-gray-900 font-semibold">
                      {selectedRecord.prescriptionId?.patientId?.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">
                      Patient ID:{" "}
                    </span>
                    <span className="text-gray-900 font-mono">
                      {selectedRecord.prescriptionId?.patientId?.id_no}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">
                      Appointment:{" "}
                    </span>
                    <span className="text-gray-900 font-mono">
                      {selectedRecord.prescriptionId?.appointmentId?.id_no}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Doctor: </span>
                    <span className="text-gray-900">
                      {selectedRecord.prescriptionId?.doctorId?.fullName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medicines Dispensed */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Medicines Dispensed
                </h4>
                <div className="space-y-3">
                  {selectedRecord.medicines?.map((med, idx) => (
                    <div
                      key={med._id}
                      className="bg-green-50 border border-green-200 p-3 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="text-sm font-bold text-green-900">
                            {idx + 1}. {med.medicineId?.name}
                          </h5>
                          <p className="text-xs text-green-700 mt-1">
                            {med.medicineId?.manufacturer}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full font-semibold">
                          Qty: {med.quantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-700">
                          Price per unit: PKR{med.priceAtTime.toFixed(2)}
                        </span>
                        <span className="text-green-900 font-bold">
                          Subtotal: PKR
                          {(med.quantity * med.priceAtTime).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Details
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Payment Method:</span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPaymentMethodColor(selectedRecord.paymentMethod)}`}
                    >
                      {selectedRecord.paymentMethod}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold border-t border-gray-300 pt-2 mt-2">
                    <span className="text-gray-900">Total Amount:</span>
                    <span className="text-green-600">
                      PKR{selectedRecord.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dispensed Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  Dispensed Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">
                      Dispensed by:{" "}
                    </span>
                    <span className="text-blue-900">
                      {selectedRecord.pharmacistId?.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">
                      Date & Time:{" "}
                    </span>
                    <span className="text-blue-900">
                      {new Date(selectedRecord.createdAt).toLocaleString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default DispensedHistory;
