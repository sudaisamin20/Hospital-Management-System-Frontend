import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Lock,
  Shield,
  Clock,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../../features/auth/authSlice";
import Modal from "../../components/Modal";
import useModal from "../../hooks/useModal";
import { useUpdateProfile } from "../../features";

interface PatientData {
  _id: string;
  id_no: string;
  fullName: string;
  email: string;
  phoneNo: string;
  dob: string;
  gender: string;
  address: string;
  bloodGroup?: string;
  emergencyNo: string;
  medicalHistory?: {
    allergies: string[];
    chronicConditions: string[];
    currentMedications: string[];
  };
  photo?: string;
  createdAt: string;
}

const EditableField = ({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  type = "text",
  fullWidth = false,
  options = [],
}: any) => (
  <div className={`${fullWidth ? "col-span-2" : ""}`}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-blue-600" />
        {label}
      </div>
    </label>

    {type === "select" ? (
      <select
        value={value || ""}
        name={name}
        onChange={onChange}
        className="w-full capitalize px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <option value="">Select {label}</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    ) : type === "textarea" ? (
      <textarea
        value={value || ""}
        name={name}
        onChange={onChange}
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none focus:outline-none"
      />
    ) : (
      <input
        type={type}
        value={value || ""}
        name={name}
        onChange={onChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    )}
  </div>
);

const PatientProfile = () => {
  const patient = useSelector((state: any) => state.auth.user);
  const dispatch = useDispatch();
  const updateProfile = useUpdateProfile();
  const baseurl = import.meta.env.VITE_BASE_URL;
  const { isOpen, openModal, closeModal } = useModal();

  const [modalType, setModalType] = useState("");
  const [profileData, setProfileData] = useState<PatientData>({
    _id: "",
    id_no: "",
    fullName: "",
    email: "",
    phoneNo: "",
    dob: "",
    gender: "",
    address: "",
    bloodGroup: "",
    emergencyNo: "",
    medicalHistory: {
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
    },
    photo: "",
    createdAt: "",
  });

  const [editedData, setEditedData] = useState<PatientData>(profileData);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `${baseurl}/api/patient/profile-details`,
        {
          headers: {
            "auth-token": localStorage.getItem("authToken") || patient?.token,
          },
        },
      );
      if (response.data.success) {
        setProfileData(response.data.patient);
        setEditedData(response.data.patient);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
      toast.error(error.response?.data?.message || "Failed to load profile");
    }
  };

  useEffect(() => {
    if (patient?.id) {
      const fetchData = async () => {
        await fetchProfile();
      };
      fetchData();
    }
  }, [patient?.id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangeProfilePhoto = async () => {
    try {
      const formData = new FormData();
      if (selectedImage) {
        formData.append("photo", selectedImage);
      }
      const response = await axios.put(
        `${baseurl}/api/patient/change-photo`,
        formData,
        {
          headers: {
            "auth-token": localStorage.getItem("authToken") || patient?.token,
          },
        },
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchProfile();
        closeModal();
      }
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.put(
        `${baseurl}/api/patient/update-profile`,
        editedData,
        {
          headers: {
            "auth-token": localStorage.getItem("authToken") || patient?.token,
          },
        },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchProfile();
        updateProfile({
          id: response.data.patient._id,
          id_no: response.data.id_no,
          fullName: response.data.patient.fullName,
          email: response.data.patient.email,
          role: response.data.patient.role,
          token: localStorage.getItem("authToken") || patient.token,
        });
        closeModal();
      }
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const response = await axios.put(
        `${baseurl}/api/patient/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
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
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error: any) {
      console.error("Error changing password:", error.message);
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const InfoCard = ({ icon: Icon, label, value, fullWidth = false }: any) => (
    <div className={`${fullWidth ? "col-span-2" : ""}`}>
      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="mt-1">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {label}
          </p>
          <p
            className={`text-sm font-semibold text-gray-900 break-words ${label === "Email" ? "" : "capitalize"}`}
          >
            {value || "Not provided"}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gray-50 p-3">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Manage your personal information and settings
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Left Column - Profile Picture & Quick Stats */}
          <div className="lg:col-span-1 space-y-2">
            {/* Profile Picture Card */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center border-4 border-white shadow-lg">
                    {profileData?.photo ? (
                      <img
                        src={`${baseurl}/images/uploads/${profileData?.photo}`}
                        alt={profileData.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-blue-600" />
                    )}
                  </div>
                  <label
                    onClick={() => {
                      setModalType("changePhoto");
                      openModal();
                    }}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mt-4 text-center">
                  {profileData.fullName}
                </h2>
                <p className="text-sm text-gray-500 font-mono">
                  {profileData.id_no}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 capitalize text-xs font-semibold rounded-full">
                    {profileData.gender}
                  </span>
                  {profileData.bloodGroup && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                      {profileData.bloodGroup}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Age</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {profileData.dob
                      ? `${calculateAge(profileData.dob)} years`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">Blood Group</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {profileData.bloodGroup || "Not set"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Member Since</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {profileData.createdAt
                      ? new Date(profileData.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          },
                        )
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Security
              </h3>
              <button
                onClick={() => {
                  setModalType("changePassword");
                  openModal();
                }}
                className="w-full px-4 py-2 cursor-pointer bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Lock className="h-4 w-4" />
                Change Password
              </button>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-2">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Personal Information
                </h3>
                <button
                  onClick={() => {
                    setEditedData(profileData);
                    setModalType("editPersonal");
                    openModal();
                  }}
                  className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <InfoCard
                  icon={User}
                  label="Full Name"
                  value={profileData.fullName}
                />
                <InfoCard icon={Mail} label="Email" value={profileData.email} />
                <InfoCard
                  icon={Phone}
                  label="Phone"
                  value={profileData.phoneNo}
                />
                <InfoCard
                  icon={Calendar}
                  label="Date of Birth"
                  value={
                    profileData.dob
                      ? new Date(profileData.dob).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"
                  }
                />
                <InfoCard
                  icon={User}
                  label="Gender"
                  value={profileData.gender}
                />
                <InfoCard
                  icon={Activity}
                  label="Blood Group"
                  value={profileData.bloodGroup}
                />
                <InfoCard
                  icon={Phone}
                  label="Emergency Contact"
                  value={profileData.emergencyNo}
                />
                <InfoCard
                  icon={Calendar}
                  label="Age"
                  value={`${calculateAge(profileData.dob)} Years Old`}
                />
                <InfoCard
                  icon={MapPin}
                  label="Street Address"
                  value={profileData.address}
                  fullWidth
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <Modal
          isOpen={isOpen}
          title={
            modalType === "editPersonal"
              ? "Edit Personal Information"
              : modalType === "editAddress"
                ? "Edit Address Information"
                : modalType === "editEmergency"
                  ? "Edit Emergency Contact"
                  : modalType === "changePassword"
                    ? "Change Password"
                    : "Change Profile Photo"
          }
          onClose={() => {
            closeModal();
            setSelectedImage(null);
            setImagePreview("");
          }}
          width="max-w-2/3"
          height="max-h-[450px]"
          cancelIcon={<X className="w-5 h-5 mr-2" />}
          confirmText={
            modalType === "changePassword"
              ? "Change Password"
              : modalType === "changePhoto"
                ? "Change Photo"
                : "Save Changes"
          }
          confirmIcon={<Save className="w-5 h-5 mr-2" />}
          onConfirm={
            modalType === "changePassword"
              ? handleChangePassword
              : modalType === "changePhoto"
                ? handleChangeProfilePhoto
                : handleUpdateProfile
          }
          onCancel={
            modalType === "editPersonal" ||
            modalType === "changePassword" ||
            modalType === "changePhoto"
              ? closeModal
              : ""
          }
        >
          {modalType === "editPersonal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <EditableField
                icon={User}
                label="Full Name"
                name="fullName"
                value={editedData.fullName}
                onChange={handleInputChange}
              />
              <EditableField
                icon={Mail}
                label="Email"
                name="email"
                type="email"
                value={editedData.email}
                onChange={handleInputChange}
              />
              <EditableField
                icon={Phone}
                label="Phone Number"
                name="phoneNo"
                type="tel"
                value={editedData.phoneNo}
                onChange={handleInputChange}
              />
              <EditableField
                icon={Calendar}
                label="Date of Birth"
                name="dob"
                type="date"
                value={editedData.dob?.split("T")[0]}
                onChange={handleInputChange}
              />
              <EditableField
                icon={User}
                label="Gender"
                name="gender"
                type="select"
                value={editedData.gender}
                options={["male", "female", "other"]}
                onChange={handleInputChange}
              />
              <EditableField
                icon={Activity}
                label="Blood Group"
                name="bloodGroup"
                type="select"
                value={editedData.bloodGroup}
                options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
                onChange={handleInputChange}
              />
              <EditableField
                icon={Phone}
                label="Emergency No"
                name="emergencyNo"
                value={editedData.emergencyNo}
                options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
                onChange={handleInputChange}
              />
              <EditableField
                icon={MapPin}
                label="Address"
                name="address"
                fullWidth
                value={editedData.address}
                onChange={handleInputChange}
              />
            </div>
          )}

          {modalType === "changePassword" && (
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          )}

          {modalType === "changePhoto" && (
            <div className="space-y-2">
              <div className="flex flex-col items-center">
                <div className="h-40 w-40 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center border-4 border-white shadow-lg mb-2">
                  {imagePreview || profileData?.photo ? (
                    <img
                      src={
                        imagePreview ||
                        `${baseurl}/images/uploads/${profileData?.photo}`
                      }
                      alt={profileData?.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-20 w-20 text-blue-600" />
                  )}
                </div>
                <label className="text-blue-500 hover:text-blue-700 text-sm cursor-pointer ease-in-out duration-300 hover:underline transition-colors">
                  Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    name="photo"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: Square image, at least 400x400px
                </p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default PatientProfile;
