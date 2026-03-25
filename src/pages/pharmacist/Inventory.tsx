import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Calendar,
  DollarSign,
  Pill,
  X,
  Save,
} from "lucide-react";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import axios from "axios";
import { useSelector } from "react-redux";

interface Medicine {
  _id: string;
  name: string;
  genericName: string;
  brand: string;
  batchNumber: string;
  expiryDate: string;
  price: number;
  stockQuantity: number;
  description: string;
  tabletStrengthMg: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const Inventory = () => {
  const pharmacist = useSelector((state: any) => state.auth.user);
  const { isOpen, openModal, closeModal } = useModal();
  const [modalType, setModalType] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [medicineFormData, setMedicineFormData] = useState({
    name: "",
    genericName: "",
    brand: "",
    batchNumber: "",
    expiryDate: "",
    price: "",
    stockQuantity: "",
    description: "",
    tabletStrengthMg: "",
  });
  const baseurl = import.meta.env.VITE_BASE_URL;

  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/inventory/fetch-all`, {
        headers: {
          "auth-token": localStorage.getItem("token") || pharmacist?.token,
        },
      });
      if (response.data.success) {
        setMedicines(response.data.inventory);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching inventory:", error.message);
        toast.error(error.message);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    console.log(name, value);
    setMedicineFormData({
      ...medicineFormData,
      [name]: value,
    });
  };

  const handleAddMedicine = async () => {
    try {
      const response = await axios.post(
        `${baseurl}/api/inventory/add-medicine`,
        {
          ...medicineFormData,
          createdBy: pharmacist.id,
        },
        {
          headers: {
            "auth-token": localStorage.getItem("token") || pharmacist?.token,
          },
        },
      );
      if (response.data.success) {
        toast.success("Medicine added successfully!");
        closeModal();
        fetchInventory();
        resetForm();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error adding medicine:", error.message);
        toast.error(error.response.data.message);
      }
    }
  };

  const handleUpdateMedicine = async () => {
    try {
      const response = await axios.put(
        `${baseurl}/api/inventory/update-medicine/${selectedMedicine?._id}`,
        medicineFormData,
        {
          headers: {
            "auth-token": localStorage.getItem("token") || pharmacist?.token,
          },
        },
      );
      if (response.data.success) {
        toast.success("Medicine updated successfully!");
        closeModal();
        fetchInventory();
        resetForm();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error updating medicine:", error.message);
        toast.error(error.message);
      }
    }
  };

  const handleDeleteMedicine = async (medicineId: string) => {
    try {
      const response = await axios.delete(
        `${baseurl}/api/inventory/delete-medicine/${medicineId}`,
        {
          headers: {
            "auth-token": localStorage.getItem("token") || pharmacist?.token,
          },
        },
      );
      if (response.data.success) {
        toast.success("Medicine deleted successfully!");
        fetchInventory();
        closeModal();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error deleting medicine:", error.message);
        toast.error(error.message);
      }
    }
  };

  const resetForm = () => {
    setMedicineFormData({
      name: "",
      genericName: "",
      brand: "",
      batchNumber: "",
      expiryDate: "",
      price: "",
      stockQuantity: "",
      description: "",
      tabletStrengthMg: "",
    });
    setSelectedMedicine(null);
  };

  useEffect(() => {
    if (pharmacist?.id) {
      const fetchData = async () => {
        await fetchInventory();
      };
      fetchData();
    }
  }, [pharmacist?.id]);

  // Filter medicines
  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && med.stockQuantity < 50) ||
      (stockFilter === "out" && med.stockQuantity === 0) ||
      (stockFilter === "available" && med.stockQuantity > 0);

    return matchesSearch && matchesStock;
  });

  const getStockStatusColor = (quantity: number) => {
    if (quantity === 0) return "bg-red-100 text-red-800 border-red-200";
    if (quantity < 50) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return "Out of Stock";
    if (quantity < 50) return "Low Stock";
    return "In Stock";
  };

  const isExpiringSoon = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 90 && diffDays > 0;
  };

  const isExpired = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  // Statistics
  const totalMedicines = medicines.length;
  const lowStockCount = medicines.filter((m) => m.stockQuantity < 50).length;
  const outOfStockCount = medicines.filter((m) => m.stockQuantity === 0).length;
  const totalValue = medicines.reduce(
    (sum, m) => sum + m.price * m.stockQuantity,
    0,
  );

  const stats = [
    {
      label: "Total Medicines",
      value: totalMedicines,
      icon: Pill,
      color: "blue",
    },
    {
      label: "Low Stock",
      value: lowStockCount,
      icon: AlertTriangle,
      color: "yellow",
    },
    {
      label: "Out of Stock",
      value: outOfStockCount,
      icon: AlertTriangle,
      color: "red",
    },
    {
      label: "Total Value",
      value: `PKR${totalValue.toFixed(2)}`,
      icon: DollarSign,
      color: "green",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 p-3">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Medicine Inventory
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Manage medicines stock and information
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setModalType("addMedicine");
                openModal();
              }}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              Add Medicine
            </button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/3 -translate-y-1/6 transform h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, generic, brand, batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Stock Levels</option>
              <option value="available">In Stock</option>
              <option value="low">Low Stock (&lt; 50)</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || stockFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStockFilter("all");
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
              {filteredMedicines.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {medicines.length}
            </span>{" "}
            medicines
          </p>
        </div>

        {/* Medicines Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Medicine
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Brand & Batch
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Strength
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Expiry Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMedicines.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">
                          No medicines found
                        </p>
                        <p className="text-gray-400 mt-1">
                          {searchTerm || stockFilter !== "all"
                            ? "Try adjusting your filters"
                            : "Add your first medicine to get started"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMedicines.map((medicine) => (
                    <tr
                      key={medicine._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Medicine */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {medicine.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {medicine.genericName}
                          </p>
                        </div>
                      </td>

                      {/* Brand & Batch */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-gray-900">
                            {medicine.brand}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            #{medicine.batchNumber}
                          </p>
                        </div>
                      </td>

                      {/* Strength */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {medicine.tabletStrengthMg}mg
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold text-green-600">
                            PKR{medicine.price.toFixed(2)}
                          </span>
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-gray-900">
                            {medicine.stockQuantity}
                          </span>
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border w-fit ${getStockStatusColor(medicine.stockQuantity)}`}
                          >
                            {getStockStatus(medicine.stockQuantity)}
                          </span>
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isExpired(medicine.expiryDate) ? (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-semibold">
                              Expired
                            </span>
                          ) : isExpiringSoon(medicine.expiryDate) ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <Calendar className="h-4 w-4 text-gray-400" />
                          )}
                          <span
                            className={`text-sm ${
                              isExpired(medicine.expiryDate)
                                ? "text-red-600 font-semibold"
                                : isExpiringSoon(medicine.expiryDate)
                                  ? "text-yellow-600"
                                  : "text-gray-900"
                            }`}
                          >
                            {new Date(medicine.expiryDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedMedicine(medicine);
                              setModalType("viewMedicine");
                              openModal();
                            }}
                            className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium text-sm"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMedicine(medicine);
                              setMedicineFormData({
                                name: medicine.name,
                                genericName: medicine.genericName,
                                brand: medicine.brand,
                                batchNumber: medicine.batchNumber,
                                expiryDate: medicine.expiryDate.split("T")[0],
                                price: medicine.price.toString(),
                                stockQuantity:
                                  medicine.stockQuantity.toString(),
                                description: medicine.description,
                                tabletStrengthMg:
                                  medicine.tabletStrengthMg.toString(),
                              });
                              setModalType("editMedicine");
                              openModal();
                            }}
                            className="text-green-600 cursor-pointer hover:text-green-800 font-medium text-sm"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMedicine(medicine);
                              setModalType("deleteMedicine");
                              openModal();
                            }}
                            className="text-red-600 cursor-pointer hover:text-red-800 font-medium text-sm"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
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
            modalType === "addMedicine"
              ? "Add New Medicine"
              : modalType === "editMedicine"
                ? "Edit Medicine"
                : modalType === "deleteMedicine"
                  ? "Delete Medicine"
                  : "Medicine Details"
          }
          onClose={() => {
            closeModal();
            resetForm();
          }}
          width="max-w-2/3"
          height="max-h-[450px]"
          onCancel={
            modalType === "addMedicine" ||
            modalType === "editMedicine" ||
            modalType === "deleteMedicine"
              ? closeModal
              : undefined
          }
          onConfirm={
            modalType === "addMedicine"
              ? handleAddMedicine
              : modalType === "editMedicine"
                ? handleUpdateMedicine
                : modalType === "deleteMedicine"
                  ? () => handleDeleteMedicine(selectedMedicine._id)
                  : undefined
          }
          confirmText={
            modalType === "addMedicine"
              ? "Add Medicine"
              : modalType === "editMedicine"
                ? "Update Medicine"
                : modalType === "deleteMedicine"
                  ? "Delete"
                  : "Close"
          }
          confirmIcon={
            modalType === "addMedicine" || modalType === "editMedicine" ? (
              <Save className="w-5 h-5 mr-2" />
            ) : modalType === "deleteMedicine" ? (
              <Trash2 className="w-5 h-5 mr-2" />
            ) : (
              ""
            )
          }
          confirmColor={
            modalType === "deleteMedicine"
              ? "bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              : modalType === "addMedicine" || modalType === "editMedicine"
                ? "bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                : "bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
          }
          cancelIcon={<X className="w-5 h-5 mr-2" />}
        >
          {(modalType === "addMedicine" || modalType === "editMedicine") && (
            <div className="space-y-2">
              <form className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Medicine Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={medicineFormData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Panadol"
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Generic Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="genericName"
                      value={medicineFormData.genericName}
                      onChange={handleInputChange}
                      placeholder="e.g., Paracetamol"
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={medicineFormData.brand}
                      onChange={handleInputChange}
                      placeholder="e.g., GSK"
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Batch Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="batchNumber"
                      value={medicineFormData.batchNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., B1234"
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Strength (mg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="tabletStrengthMg"
                      value={medicineFormData.tabletStrengthMg}
                      onChange={handleInputChange}
                      placeholder="e.g., 500"
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Price (PKR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={medicineFormData.price}
                      onChange={handleInputChange}
                      placeholder="e.g., 20.00"
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="stockQuantity"
                      value={medicineFormData.stockQuantity}
                      onChange={handleInputChange}
                      placeholder="e.g., 100"
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={medicineFormData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={medicineFormData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="e.g., Pain relief and fever reducer"
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </form>
            </div>
          )}

          {modalType === "viewMedicine" && selectedMedicine && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-2">
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  {selectedMedicine.name}
                </h3>
                <p className="text-sm text-blue-700">
                  {selectedMedicine.genericName} • {selectedMedicine.brand}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Batch Number
                  </label>
                  <p className="text-sm text-gray-900 font-mono">
                    {selectedMedicine.batchNumber}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Strength
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedMedicine.tabletStrengthMg}mg
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Price
                  </label>
                  <p className="text-sm text-green-600 font-bold">
                    PKR{selectedMedicine.price.toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Stock Quantity
                  </label>
                  <p className="text-sm text-gray-900 font-bold">
                    {selectedMedicine.stockQuantity}
                  </p>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border mt-1 ${getStockStatusColor(selectedMedicine.stockQuantity)}`}
                  >
                    {getStockStatus(selectedMedicine.stockQuantity)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Expiry Date
                  </label>
                  <p
                    className={`text-sm ${
                      isExpired(selectedMedicine.expiryDate)
                        ? "text-red-600 font-semibold"
                        : isExpiringSoon(selectedMedicine.expiryDate)
                          ? "text-yellow-600"
                          : "text-gray-900"
                    }`}
                  >
                    {new Date(selectedMedicine.expiryDate).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                  {isExpiringSoon(selectedMedicine.expiryDate) && (
                    <p className="text-xs text-yellow-600 mt-1">
                      ⚠️ Expiring soon
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Total Value
                  </label>
                  <p className="text-sm text-green-600 font-bold">
                    PKR
                    {(
                      selectedMedicine.price * selectedMedicine.stockQuantity
                    ).toFixed(2)}
                  </p>
                </div>
              </div>

              {selectedMedicine.description && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <p className="bg-gray-50 rounded py-2 px-3 text-xs text-gray-500">
                    {selectedMedicine.description}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 rounded py-2 px-3">
                <p className="text-xs text-gray-500">
                  Added on{" "}
                  {new Date(selectedMedicine.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
            </div>
          )}
          {modalType === "deleteMedicine" && selectedMedicine && (
            <div>
              <p className="font-semibold text-gray-900 mb-1">
                Are you sure you want to delete{" "}
                <span className="text-red-600">{selectedMedicine.name}</span>?
              </p>
              <p className="text-sm text-gray-500">
                This action cannot be undone.
              </p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Inventory;
