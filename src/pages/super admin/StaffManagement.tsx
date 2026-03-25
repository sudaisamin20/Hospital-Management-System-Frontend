import React, { useEffect, useRef, useState } from "react";
import {
  UserPlus,
  Search,
  Edit,
  Eye,
  MoreVertical,
  Check,
  Mail,
  Phone,
  Calendar,
  Upload,
  Users,
  ChevronDown,
  Trash,
  User,
  X,
  Camera,
  LayoutGrid,
  List,
} from "lucide-react";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import Dropdown from "../../components/dropdown/Dropdown";
import DropdownItem from "../../components/dropdown/DropdownItem";

interface ApiResponse {
  success: boolean;
  message: string;
  patient?: {
    id_no: string;
    _id: string;
    fullName: string;
    role: string;
    email: string;
    phoneNo: string;
    departmentId: string;
    specialistId: string;
    licenseNo: string;
    specialization: string;
    doj: string;
    salary: string;
    qualification: string;
    emergencyNo: string;
    address: string;
    photo: File | null;
    yearsOfExperience: string;
    isActive: boolean;
  };
  token?: string;
}

export interface IStaff {
  _id: string;
  id_no: string;
  fullName: string;
  email: string;
  phoneNo: string;
  role: string;
  dob: string;
  maritalStatus: string;
  qualification: string;
  yearsOfExperience: string;
  specialization: string;
  specialistId: string;
  departmentId: string;
  licenseNo: string;
  doj: string;
  emergencyNo: string;
  salary: string;
  address: string;
  photo: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const StaffManagement = () => {
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const superadmin = useSelector((state: any) => state.auth.user);
  const { isOpen, closeModal, openModal } = useModal();
  const [modalType, setModalType] = useState("");
  const [memberProfile, setMemberProfile] = useState<IStaff>({});
  const [departments, setDepartments] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [staffMemberData, setStaffMemberData] = useState<IStaff>({});
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNo: "",
    role: "",
    departmentId: "",
    licenseNo: "",
    specialization: "",
    yearsOfExperience: "",
    doj: "",
    dob: "",
    maritalStatus: "",
    specialistId: "",
    salary: "",
    address: "",
    emergencyNo: "",
    qualification: "",
    password: "sudais123",
    photo: null,
  });
  const [staffData, setStaffData] = useState<IStaff[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const baseurl = import.meta.env.VITE_BASE_URL;
  const [labAssDepts, setLabAssDepts] = useState([]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        `${baseurl}/api/superadmin/fetch/departments`,
      );
      if (response.data.success) {
        setDepartments(response.data.departments);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during registration:", error.message);
        toast.error(error.message);
      } else {
        console.error("Unexpected error during registration:", error);
      }
    }
  };

  const fetchSpecialists = async (departmentId: string) => {
    try {
      const response = await axios.get(
        `${baseurl}/api/superadmin/fetch/specialists/${departmentId}`,
      );
      if (response.data.success) {
        setSpecialists(response.data.specialists);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during registration:", error.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Unexpected error during registration:", error);
      }
    }
  };

  useEffect(() => {
    const fetchSpecData = async () => {
      if (
        superadmin?.id &&
        modalType === "editProfile" &&
        memberProfile.departmentId
      ) {
        await fetchSpecialists(memberProfile.departmentId);
      }
    };
    fetchSpecData();
  }, [superadmin?.id, modalType, memberProfile.departmentId]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "photo" && e.target instanceof HTMLInputElement) {
      const file = e.target.files?.[0];

      if (file) {
        setFormData({
          ...formData,
          photo: file || null,
        });
      }
      return;
    }

    if (name === "role") {
      setFormData({
        ...formData,
        role: value,
        departmentId: "",
        specialistId: "",
      });
      return;
    }

    if (name === "departmentId" && formData.role === "doctor") {
      setFormData({
        ...formData,
        departmentId: value,
        specialistId: "",
      });
      fetchSpecialists(value);
      return;
    } else {
      setFormData({
        ...formData,
        departmentId: value,
      });
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const fetchSuperAdminDashboardData = async (): Promise<void> => {
    try {
      const response = await axios.get(
        `${baseurl}/api/superadmin/fetch/staff-data`,
      );
      if (response.data.success) {
        setStaffData(response.data.staffData);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during registration:", error.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Unexpected error during registration:", error);
      }
    }
  };

  const fetchLabAssDepts = async () => {
    try {
      const response = await axios.get(
        `${baseurl}/api/superadmin/fetch/lab/departments`,
        {
          headers: {
            "auth-token":
              localStorage.getItem("authToken") || superadmin?.token,
          },
        },
      );
      if (response.data.success) {
        setLabAssDepts(response.data.labAssDepts);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during registration:", error.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Unexpected error during registration:", error);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchSuperAdminDashboardData();
    };
    fetchData();

    const fetchDepartmentsData = async () => {
      await fetchDepartments();
    };
    fetchDepartmentsData();
  }, []);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("fullName", formData.fullName);
      data.append("email", formData.email);
      data.append("address", formData.address);
      data.append("departmentId", formData.departmentId);
      data.append("dob", formData.dob);
      data.append("emergencyNo", formData.emergencyNo);
      data.append("licenseNo", formData.licenseNo);
      data.append("maritalStatus", formData.maritalStatus);
      data.append("phoneNo", formData.phoneNo);
      data.append("photo", formData.photo);
      data.append("qualification", formData.qualification);
      data.append("role", formData.role);
      data.append("salary", formData.salary);
      data.append("specialistId", formData.specialistId);
      data.append("specialization", formData.specialization);
      data.append("yearsOfExperience", formData.yearsOfExperience);
      data.append("doj", formData.doj);
      data.append("password", formData.password);
      if (formData.role === "doctor") {
        const response = await axios.post<ApiResponse>(
          `${baseurl}/api/doctor/auth/register`,
          data,
        );
        console.log(response.data);
        if (response.data.success) {
          setFormData({
            fullName: "",
            email: "",
            phoneNo: "",
            role: "",
            departmentId: "",
            licenseNo: "",
            specialization: "",
            yearsOfExperience: "",
            doj: "",
            dob: "",
            maritalStatus: "",
            specialistId: "",
            salary: "",
            address: "",
            emergencyNo: "",
            qualification: "",
            password: "sudais123",
            photo: null,
          });
          toast.success(response.data.message);
          fetchSuperAdminDashboardData();
          closeModal();
        }
      } else if (formData.role === "receptionist") {
        const response = await axios.post<ApiResponse>(
          `${baseurl}/api/receptionist/auth/register`,
          data,
        );
        if (response.data.success) {
          setFormData({
            fullName: "",
            email: "",
            phoneNo: "",
            role: "",
            departmentId: "",
            licenseNo: "",
            specialization: "",
            yearsOfExperience: "",
            doj: "",
            dob: "",
            maritalStatus: "",
            specialistId: "",
            salary: "",
            address: "",
            emergencyNo: "",
            qualification: "",
            password: "sudais123",
            photo: null,
          });
          toast.success(response.data.message);
          fetchSuperAdminDashboardData();
          closeModal();
        }
      } else if (formData.role === "pharmacist") {
        console.log(formData);
        const response = await axios.post<ApiResponse>(
          `${baseurl}/api/pharmacist/auth/register`,
          data,
        );
        if (response.data.success) {
          setFormData({
            fullName: "",
            email: "",
            phoneNo: "",
            role: "",
            departmentId: "",
            licenseNo: "",
            specialization: "",
            yearsOfExperience: "",
            doj: "",
            dob: "",
            maritalStatus: "",
            specialistId: "",
            salary: "",
            address: "",
            emergencyNo: "",
            qualification: "",
            password: "sudais123",
            photo: null,
          });
          toast.success(response.data.message);
          fetchSuperAdminDashboardData();
          closeModal();
        }
      } else if (formData.role === "labAssistant") {
        console.log(formData);
        const response = await axios.post<ApiResponse>(
          `${baseurl}/api/lab/auth/register/lab-assistant`,
          data,
        );
        if (response.data.success) {
          setFormData({
            fullName: "",
            email: "",
            phoneNo: "",
            role: "",
            departmentId: "",
            licenseNo: "",
            specialization: "",
            yearsOfExperience: "",
            doj: "",
            dob: "",
            maritalStatus: "",
            specialistId: "",
            salary: "",
            address: "",
            emergencyNo: "",
            qualification: "",
            password: "sudais123",
            photo: null,
          });
          toast.success(response.data.message);
          fetchSuperAdminDashboardData();
          closeModal();
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during registration:", error);
        toast.error(error.response.data.message);
      } else {
        console.error("Unexpected error during registration:", error);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: "",
      email: "",
      phoneNo: "",
      role: "",
      departmentId: "",
      licenseNo: "",
      specialization: "",
      yearsOfExperience: "",
      doj: "",
      dob: "",
      maritalStatus: "",
      specialistId: "",
      salary: "",
      address: "",
      emergencyNo: "",
      qualification: "",
      password: "sudais123",
      photo: null,
    });
    setSpecialists([]);
    closeModal();
  };
  const filteredStaff = staffData.filter((staff) => {
    const matchesRole =
      selectedRole === "all" ||
      staff.role.toLowerCase() === selectedRole.toLowerCase();
    const matchesSearch =
      staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.id_no.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const roles = Array.from(new Set(staffData.map((data) => data.role)));

  const stats = [
    { label: "Total Staff", value: staffData.length, color: "blue" },
    {
      label: "Doctors",
      value: staffData.filter((s) => s.role === "doctor").length,
      color: "green",
    },
    {
      label: "Receptionists",
      value: staffData.filter((s) => s.role === "receptionist").length,
      color: "purple",
    },
    {
      label: "Patients",
      value: staffData.filter((s) => s.role === "patient").length,
      color: "teal",
    },
    {
      label: "Pharmacists",
      value: staffData.filter((s) => s.role === "pharmacist").length,
      color: "green",
    },
    {
      label: "Lab Assistants",
      value: staffData.filter((s) => s.role === "labAssistant").length,
      color: "orange",
    },
    {
      label: "On Leave",
      value: staffData.filter((s) => !s.isActive).length,
      color: "red",
    },
  ];

  // const getDepartments = () => {
  //   return doctorDepartments.map((dept) => dept.department);
  // };

  // const getSpecialists = () => {
  //   const selectedDept = doctorDepartments.find(
  //     (dept) => dept.department === formData.department,
  //   );

  //   return selectedDept ? selectedDept.specialists : [];
  // };

  const handleFileChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name } = e.target;
    if (name === "photo" && e.target instanceof HTMLInputElement) {
      const file = e.target.files?.[0];
      if (file) {
        setMemberProfile({
          ...memberProfile,
          photo: file || null,
        });
      }
      return;
    }
  };

  const handleEditProfile = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("fullName", memberProfile.fullName);
      data.append("email", memberProfile.email);
      data.append("id_no", memberProfile.id_no);
      // data.append("password", memberProfile.password);
      data.append("address", memberProfile.address);
      data.append("maritalStatus", memberProfile.maritalStatus);
      data.append("role", memberProfile.role);
      data.append("qualification", memberProfile.qualification);
      if (memberProfile.role === "doctor") {
        data.append("specialization", memberProfile.specialization);
        data.append("specialistId", memberProfile.specialistId);
      }
      data.append("departmentId", memberProfile.departmentId);
      data.append("dob", memberProfile.dob);
      data.append("doj", memberProfile.doj);
      data.append("yearsOfExperience", memberProfile.yearsOfExperience);
      data.append("phoneNo", memberProfile.phoneNo);
      data.append("emergencyNo", memberProfile.emergencyNo);
      data.append("salary", memberProfile.salary);
      data.append("licenseNo", memberProfile.licenseNo);
      data.append("photo", memberProfile.photo);

      const response = await axios.put(
        `${baseurl}/api/superadmin/update/staff-member-profile/${memberProfile._id}`,
        data,
      );
      if (response.data.success) {
        toast.success(response.data.message);
        closeModal();
        await fetchSuperAdminDashboardData();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during registration:", error.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Unexpected error during registration:", error);
      }
    }
  };

  const RoleBadge = ({ role }: { role: string }) => {
    const styles: Record<string, string> = {
      doctor: "bg-blue-100 text-blue-700",
      receptionist: "bg-purple-100 text-purple-700",
      pharmacist: "bg-green-100 text-green-700",
      labAssistant: "bg-orange-100 text-orange-700",
      admin: "bg-red-100 text-red-700",
      patient: "bg-teal-100 text-teal-700",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${styles[role] || "bg-gray-100 text-gray-700"}`}
      >
        {role === "labAssistant" ? "Lab Assistant" : role}
      </span>
    );
  };

  const handleDeleteProfile = () => {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 shadow-lg">
        <div className="max-w-7xl">
          <div className="flex flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold mb-2 flex items-center gap-3">
                <Users className="w-6 h-6" />
                Staff Management
              </h1>
              <p className="text-blue-100 text-sm">
                Manage all hospital staff members, doctors, and receptionists
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalType("addStaff");
                  openModal();
                }}
                className="bg-white cursor-pointer text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-2 font-medium shadow-lg"
              >
                <UserPlus className="w-5 h-5" />
                Add Staff Member
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl p-3">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 lg:grid-cols-5 gap-3 mb-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white flex gap-2 justify-between items-center rounded-md shadow-sm border border-gray-200 px-3 py-2 hover:shadow-md transition-all"
            >
              <h3 className="text-gray-600 text-sm font-medium">
                {stat.label}
              </h3>
              <p className="text-lg font-bold text-blue-600">{stat?.value}</p>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-3">
          <div className="flex gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/3 -translate-y-1/6 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="appearance-none capitalize p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
              >
                <option value="all">All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role} className="capitalize">
                    {role === "labAssistant"
                      ? "Lab Assistant Only"
                      : role + " Only"}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 transition-colors ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-500 cursor-pointer hover:bg-gray-50"
                }`}
                title="Table View"
              >
                <List className="w-6 h-6" />
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`p-2 transition-colors ${
                  viewMode === "card"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-500 cursor-pointer hover:bg-gray-50"
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Card View */}
        {viewMode === "card" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((staff) => (
              <div
                key={staff._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-lg shadow-md">
                        {staff.photo ? (
                          <img
                            className="rounded-full w-12 h-12 object-cover"
                            src={`${baseurl}/images/uploads/${staff.photo}`}
                            alt=""
                          />
                        ) : (
                          <User className="w-8 h-8" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-bold">
                          {staff.fullName}
                        </h3>
                        <p className="text-blue-100 text-sm">{staff.id_no}</p>
                      </div>
                    </div>
                    <button className="text-white flex items-center relative cursor-pointer hover:bg-white/20 p-2 rounded-lg transition-colors">
                      <Dropdown
                        buttonText={<MoreVertical className="w-5 h-5" />}
                        content={
                          <>
                            <DropdownItem
                              onClick={() => {
                                setModalType("editProfile");
                                openModal();
                                setMemberProfile(staff);
                                setStaffMemberData(staff);
                                fetchLabAssDepts();
                              }}
                            >
                              <button className="flex items-center gap-2 text-sm cursor-pointer">
                                <Edit size={14} /> Edit
                              </button>
                            </DropdownItem>
                            <DropdownItem onClick={handleDeleteProfile}>
                              <button className="flex items-center gap-2 text-sm cursor-pointer">
                                <Trash size={14} /> Delete
                              </button>
                            </DropdownItem>
                          </>
                        }
                      />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                        staff.role === "doctor"
                          ? "bg-blue-100 text-blue-700"
                          : staff.role === "receptionist"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {staff.role}
                    </span>
                    {staff.role !== "patient" && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          staff.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {staff.isActive ? "Available" : "Leave"}
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{staff.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{staff.phoneNo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        {staff.role === "patient"
                          ? `Created At: ${staff.createdAt.slice(0, 10)}`
                          : `Joined: ${staff.doj}`}
                      </span>
                    </div>
                  </div>
                  <button
                    className="w-full cursor-pointer flex items-center justify-center gap-2 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      setModalType("viewProfile");
                      openModal();
                      setMemberProfile(staff);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">
                      Staff
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">
                      Role
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">
                      Email
                    </th>
                    {/* <th className="text-left px-4 py-3 font-semibold text-gray-600">
                      Phone
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">
                      Joined
                    </th> */}
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStaff.map((staff) => (
                    <tr
                      key={staff._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Staff */}
                      <td className="px-4 py-3 max-w-[180px] truncate">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center ">
                            {staff.photo ? (
                              <img
                                src={`${baseurl}/images/uploads/${staff.photo}`}
                                alt=""
                                className="w-9 h-9 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {staff.fullName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {staff.id_no}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Role */}
                      <td className="px-4 py-3 max-w-[180px] truncate">
                        <RoleBadge role={staff.role} />
                      </td>
                      {/* Email */}
                      <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                        {staff.email}
                      </td>
                      {/* Phone */}
                      {/* <td className="px-4 py-3 text-gray-600">
                        {staff.phoneNo}
                      </td> */}
                      {/* Joined */}
                      {/* <td className="px-4 py-3 text-gray-600">
                        {staff.role === "patient"
                          ? staff.createdAt.slice(0, 10)
                          : staff.doj}
                      </td> */}
                      {/* Status */}
                      <td className="px-4 py-3">
                        {staff.role !== "patient" && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              staff.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {staff.isActive ? "Available" : "Leave"}
                          </span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setModalType("viewProfile");
                              openModal();
                              setMemberProfile(staff);
                            }}
                            className="p-1 text-blue-600 cursor-pointer"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setModalType("editProfile");
                              openModal();
                              setMemberProfile(staff);
                              setStaffMemberData(staff);
                              fetchLabAssDepts();
                            }}
                            className="p-1 text-yellow-600 cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleDeleteProfile}
                            className="p-1 text-red-600 cursor-pointer"
                            title="Delete"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredStaff.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No staff members found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isOpen}
        title={
          modalType === "addStaff"
            ? "Add Staff Member"
            : modalType === "viewProfile"
              ? `${memberProfile?.fullName}'s Profile`
              : modalType === "editProfile"
                ? `Edit ${staffMemberData?.fullName}'s Profile`
                : ""
        }
        onClose={handleCancel}
        width="w-2/3"
        height={modalType === "deleteUser" ? "h-[150px]" : "h-[500px]"}
        onConfirm={
          modalType === "addStaff"
            ? handleSubmit
            : modalType === "editProfile"
              ? handleEditProfile
              : ""
        }
        confirmText={
          modalType === "addStaff"
            ? "Add Staff Member"
            : modalType === "editProfile"
              ? "Save Changes"
              : ""
        }
        confirmColor={
          modalType === "deleteProfile"
            ? "bg-red-400 text-white rounded-lg hover:bg-red-700"
            : "bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        }
        confirmIcon={
          modalType === "addStaff" ? <Check className="w-5 h-5 mr-2" /> : ""
        }
        onCancel={modalType === "viewProfile" ? "" : handleCancel}
        cancelText="Cancel"
        cancelColor="border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
      >
        {modalType === "addStaff" ? (
          <div className="">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Role - First Field */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={(e) => {
                      handleInputChange(e);
                      console.log(e.target.value);
                      if (e.target.value === "labAssistant") {
                        fetchLabAssDepts();
                      }
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="" disabled>
                      Select Role
                    </option>
                    <option value="doctor">Doctor</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="labAssistant">Lab Assistant</option>
                  </select>
                </div>

                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 placeholder:italic border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={
                      formData.role === "doctor" ? "Dr. John Doe" : "John Doe"
                    }
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 placeholder:italic border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="staff@hospital.com"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 placeholder:italic border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="03XXXXXXXXX"
                    required
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Marital Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marital Status *
                  </label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="" disabled>
                      Select Status
                    </option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>

                {/* Department - Dynamic based on role */}
                {formData.role === "doctor" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <select
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="" disabled>
                        Select Department
                      </option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.role === "labAssistant" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <select
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="" disabled>
                        Select Department
                      </option>
                      {labAssDepts.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Specialist - Dynamic based on role */}
                {formData.role === "doctor" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialist *
                    </label>
                    <select
                      name="specialistId"
                      value={formData.specialistId}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="" disabled>
                        Select Specialist
                      </option>
                      {specialists?.map((spec) => (
                        <option key={spec._id} value={spec._id}>
                          {spec.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Specialization - Dynamic based on role and department */}
                {formData.role === "doctor" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialization
                    </label>
                    <input
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:italic"
                      placeholder="Orthopedist, Neurologis, etc."
                      required
                    />
                  </div>
                )}

                {/* Doctor-specific fields */}
                {(formData.role === "doctor" ||
                  formData.role === "pharmacist" ||
                  formData.role === "labAssistant") && (
                  <>
                    {/* License Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medical License Number *
                      </label>
                      <input
                        type="text"
                        name="licenseNo"
                        value={formData.licenseNo}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 placeholder:italic border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="MED-12345"
                        required
                      />
                    </div>

                    {/* Qualification */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qualification *
                      </label>
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 placeholder:italic border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={
                          formData.role === "doctor"
                            ? "MBBS, MD, MS, etc."
                            : "Pharm B, Pharm D etc."
                        }
                        required
                      />
                    </div>

                    {/* Years of Experience */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Experience *
                      </label>
                      <input
                        type="number"
                        name="yearsOfExperience"
                        value={formData.yearsOfExperience}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 placeholder:italic border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="5"
                        min="0"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Receptionist-specific fields */}
                {formData.role === "receptionist" && (
                  <>
                    {/* Employee ID for Receptionist */}
                    {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      name="licenseNo"
                      value={formData.licenseNo}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 placeholder:italic border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="REC-001"
                    />
                  </div> */}
                    {/* Qualification for Receptionist */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qualification
                      </label>
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 placeholder:italic border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Bachelor's, Diploma, etc."
                      />
                    </div>
                    {/* Years of Experience for Receptionist */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        name="yearsOfExperience"
                        value={formData.yearsOfExperience}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 placeholder:italic border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="2"
                        min="0"
                      />
                    </div>
                  </>
                )}

                {/* Salary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary (Monthly) *
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 placeholder:italic border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Rs. 50,000"
                    required
                  />
                </div>

                {/* Date of Joining */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Joining *
                  </label>
                  <input
                    type="date"
                    name="doj"
                    value={formData.doj}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                {/* Emergency Contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact *
                  </label>
                  <input
                    type="tel"
                    name="emergencyNo"
                    value={formData.emergencyNo}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 placeholder:italic border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="03XXXXXXXXX"
                    required
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 placeholder:italic border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Full address..."
                    required
                  />
                </div>

                {/* Profile Photo Upload */}
                <div className="md:col-span-2 flex flex-col items-center justify-center py-4">
                  <div className="relative group">
                    {formData.photo ? (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(formData.photo)}
                          alt="Preview"
                          className="w-28 h-28 rounded-full object-cover border-4 border-blue-100 shadow-md"
                        />
                        <div
                          className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-28 h-28 rounded-full border-4 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500 text-center px-2">
                          Upload Photo
                        </span>
                      </div>
                    )}

                    {formData.photo && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, photo: null }))
                        }
                        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <input
                    type="file"
                    hidden
                    name="photo"
                    ref={fileInputRef}
                    id="photo"
                    accept="image/png, image/jpg, image/jpeg"
                    onChange={handleInputChange}
                  />

                  <p className="text-xs text-gray-400 mt-3">
                    PNG, JPG or JPEG · Max 2MB
                  </p>
                </div>
              </div>
            </form>
          </div>
        ) : modalType === "viewProfile" ? (
          <div className="space-y-6">
            {/* Photo */}
            <div className="flex justify-center">
              {memberProfile.photo ? (
                <img
                  src={`${baseurl}/images/uploads/${memberProfile.photo}`}
                  alt={memberProfile.fullName}
                  className="w-32 h-32 rounded-full object-cover object-center border-4 border-gray-200"
                />
              ) : (
                <User className="w-32 h-32 border border-blue-600 text-blue-600 rounded-full" />
              )}
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 mx-auto gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Full Name
                </label>
                <p className="text-gray-900">{memberProfile.fullName}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Employee ID
                </label>
                <p className="text-gray-900">{memberProfile.id_no}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Email
                </label>
                <p className="text-gray-900">{memberProfile.email}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Phone Number
                </label>
                <p className="text-gray-900">{memberProfile.phoneNo}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Role
                </label>
                <p className="text-gray-900 capitalize">{memberProfile.role}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Date of Birth
                </label>
                <p className="text-gray-900">
                  {new Date(memberProfile.dob).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Marital Status
                </label>
                <p className="text-gray-900 capitalize">
                  {memberProfile.maritalStatus}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Qualification
                </label>
                <p className="text-gray-900">{memberProfile.qualification}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Years of Experience
                </label>
                <p className="text-gray-900">
                  {memberProfile.yearsOfExperience} years
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Date of Joining
                </label>
                <p className="text-gray-900">
                  {new Date(memberProfile.doj).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Emergency Contact
                </label>
                <p className="text-gray-900">{memberProfile.emergencyNo}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Salary
                </label>
                <p className="text-gray-900">{memberProfile.salary}</p>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-600">
                  Address
                </label>
                <p className="text-gray-900">{memberProfile.address}</p>
              </div>
            </div>
          </div>
        ) : modalType === "editProfile" ? (
          <div className="space-y-6">
            <form className="space-y-2">
              {/* Photo Upload */}
              <div className="flex flex-col items-center space-y-2">
                {memberProfile.photo ? (
                  memberProfile.photo && (
                    <img
                      src={
                        memberProfile.photo === staffMemberData.photo
                          ? `${baseurl}/images/uploads/${memberProfile.photo}`
                          : URL.createObjectURL(memberProfile.photo)
                      }
                      alt={memberProfile.fullName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    />
                  )
                ) : (
                  <User className="w-32 h-32 border border-blue-600 text-blue-600 rounded-full" />
                )}
                <div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                    className="block text-sm cursor-pointer font-semibold text-blue-600 hover:text-blue-400 transition-all ease-in-out mb-2"
                  >
                    {memberProfile.photo ? "Change Photo" : "Upload Photo"}
                  </button>
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    defaultValue={memberProfile.fullName}
                    onChange={(e) =>
                      setMemberProfile((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    ID Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="id_no"
                    defaultValue={memberProfile.id_no}
                    onChange={(e) =>
                      setMemberProfile((prev) => ({
                        ...prev,
                        id_no: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    defaultValue={memberProfile.email}
                    onChange={(e) =>
                      setMemberProfile((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phoneNo"
                    defaultValue={memberProfile.phoneNo}
                    onChange={(e) =>
                      setMemberProfile((prev) => ({
                        ...prev,
                        phoneNo: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    defaultValue={memberProfile.role}
                    name="role"
                    onChange={(e) =>
                      setMemberProfile((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Role</option>
                    {/* <option value="admin">Admin</option> */}
                    <option value="patient">Patient</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="doctor">Doctor</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="labAssistant">Lab Assistant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    defaultValue={memberProfile.dob}
                    onChange={(e) =>
                      setMemberProfile((prev) => ({
                        ...prev,
                        dob: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                {memberProfile.role !== "patient" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        Marital Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        defaultValue={memberProfile.maritalStatus}
                        name="maritalStatus"
                        onChange={(e) =>
                          setMemberProfile((prev) => ({
                            ...prev,
                            maritalStatus: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                      </select>
                    </div>

                    {(memberProfile.role === "doctor" ||
                      memberProfile.role === "labAssistant") && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                          Department <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={memberProfile.departmentId}
                          name="departmentId"
                          onChange={(e) => {
                            setMemberProfile((prev) => ({
                              ...prev,
                              departmentId: e.target.value,
                            }));
                            fetchSpecialists(e.target.value);
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {memberProfile.role === "doctor" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                          Specialist <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={memberProfile.specialistId}
                          name="specialistId"
                          onChange={(e) =>
                            setMemberProfile((prev) => ({
                              ...prev,
                              specialistId: e.target.value,
                            }))
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select Specialist</option>
                          {specialists?.map((spec) => (
                            <option key={spec._id} value={spec._id}>
                              {spec.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        Qualification <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="qualification"
                        defaultValue={memberProfile.qualification}
                        onChange={(e) =>
                          setMemberProfile((prev) => ({
                            ...prev,
                            qualification: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Bachelor's in Computer Science"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        License No <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="licenseNo"
                        defaultValue={memberProfile.licenseNo}
                        onChange={(e) =>
                          setMemberProfile((prev) => ({
                            ...prev,
                            licenseNo: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., LIC-12345"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        Years of Experience{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="yearsOfExperience"
                        defaultValue={memberProfile.yearsOfExperience}
                        onChange={(e) =>
                          setMemberProfile((prev) => ({
                            ...prev,
                            yearsOfExperience: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        Date of Joining <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="doj"
                        defaultValue={memberProfile.doj}
                        onChange={(e) =>
                          setMemberProfile((prev) => ({
                            ...prev,
                            doj: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        Salary <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="salary"
                        defaultValue={memberProfile.salary}
                        onChange={(e) =>
                          setMemberProfile((prev) => ({
                            ...prev,
                            salary: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Emergency Contact <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="emergencyNo"
                    defaultValue={memberProfile.emergencyNo}
                    onChange={(e) =>
                      setMemberProfile((prev) => ({
                        ...prev,
                        emergencyNo: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    defaultValue={memberProfile.address}
                    onChange={(e) =>
                      setMemberProfile((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    name="address"
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>
              </div>
            </form>
          </div>
        ) : (
          ""
        )}
      </Modal>
    </div>
  );
};

export default StaffManagement;
