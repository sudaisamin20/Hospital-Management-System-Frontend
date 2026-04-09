import React, { useState, useRef, useEffect } from "react";
import {
  User,
  Briefcase,
  GraduationCap,
  Edit3,
  Save,
  X,
  Camera,
  Clock,
  BadgeCheck,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";
import {
  getDoctorProfileApi,
  updateDoctorProfileApi,
  type DoctorProfileData,
} from "../../api";

const DoctorProfile = () => {
  const doctor = useSelector((state: any) => state.auth.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const [doctorProfile, setDoctorProfile] = useState<DoctorProfileData | null>(
    null,
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "personal" | "professional"
  >("personal");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNo: "",
    emergencyNo: "",
    address: "",
    specialization: "",
    qualification: "",
    yearsOfExperience: "",
    maritalStatus: "",
    dob: "",
    photo: "",
    doj: "",
  });

  const fetchDoctorProfile = async () => {
    try {
      const response = await getDoctorProfileApi();
      if (response.data.success) {
        console.log(response.data.doctor);
        setDoctorProfile(response.data.doctor);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
      console.log(error?.response?.data.message);
    }
  };

  useEffect(() => {
    if (doctor?.id) {
      const fetchData = async () => {
        await fetchDoctorProfile();
      };
      fetchData();
    }
  }, [doctor?.id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleOpenModal = (section: "personal" | "professional") => {
    setActiveSection(section);
    setFormData({
      fullName: doctorProfile?.fullName || "",
      email: doctorProfile?.email || "",
      phoneNo: doctorProfile?.phoneNo || "",
      emergencyNo: doctorProfile?.emergencyNo || "",
      address: doctorProfile?.address || "",
      specialization: doctorProfile?.specialization || "",
      qualification: doctorProfile?.qualification || "",
      yearsOfExperience: doctorProfile?.yearsOfExperience || "",
      maritalStatus: doctorProfile?.maritalStatus || "",
      dob: doctorProfile?.dob || "",
      photo: doctorProfile?.photo || "",
      doj: doctorProfile?.doj || "",
    });
    setPhotoPreview(null);
    setPhotoFile(null);
    openModal();
  };

  const handleCloseModal = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    closeModal();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, val));
      if (photoFile) data.append("photo", photoFile);

      const response = await updateDoctorProfileApi(data);
      if (response.data.success) {
        fetchDoctorProfile();
        toast.success(response.data.message);
        closeModal();
        setPhotoPreview(null);
        setPhotoFile(null);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const calcAge = (dob: string) => {
    if (!dob) return "—";
    const age = Math.floor(
      (new Date().getTime() - new Date(dob).getTime()) /
        (365.25 * 24 * 60 * 60 * 1000),
    );
    return `${age} years`;
  };

  const fmtDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const inputClass =
    "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white text-gray-800";

  const readonlyClass =
    "w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="max-w-7xl space-y-2">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            View and manage your personal and professional information
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 bg-blue-50">
                {doctorProfile?.photo ? (
                  <img
                    src={`${import.meta.env.VITE_BASE_URL}/images/uploads/${doctorProfile?.photo}`}
                    alt={doctorProfile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-600 text-2xl font-semibold">
                    {doctorProfile?.fullName
                      ?.split(" ")
                      .map((w: string) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleOpenModal("personal")}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer shadow"
                title="Change photo"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Basic info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  Dr. {doctorProfile?.fullName}
                </h2>
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 w-fit mx-auto sm:mx-0">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Active
                </span>
              </div>
              <p className="text-sm text-blue-600 font-medium mb-1">
                {doctorProfile?.specialistId.name || "Specialist"}
              </p>
              <p className="text-xs text-blue-600 font-medium mb-1">
                {doctorProfile?.specialization || "Specialist"}
              </p>
              <p className="text-xs text-gray-400 font-mono">
                {doctorProfile?.id_no}
              </p>
              <div className="flex flex-wrap gap-4 mt-3 justify-center sm:justify-start">
                {[
                  {
                    icon: Clock,
                    label: `${doctorProfile?.yearsOfExperience || "—"} yrs experience`,
                  },
                  {
                    icon: GraduationCap,
                    label: doctorProfile?.qualification || "—",
                  },
                  {
                    icon: Calendar,
                    label: `Joined ${fmtDate(doctorProfile?.doj)}`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-1.5 text-xs text-gray-500"
                  >
                    <item.icon className="h-3.5 w-3.5 text-gray-400" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </h3>
            <button
              onClick={() => handleOpenModal("personal")}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Full Name", value: doctorProfile?.fullName },
              { label: "Email Address", value: doctorProfile?.email },
              { label: "Phone Number", value: doctorProfile?.phoneNo },
              { label: "Emergency Contact", value: doctorProfile?.emergencyNo },
              {
                label: "Date of Birth",
                value: doctorProfile?.dob
                  ? `${fmtDate(doctorProfile.dob)} · ${calcAge(doctorProfile.dob)}`
                  : "—",
              },
              { label: "Marital Status", value: doctorProfile?.maritalStatus },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs font-medium text-gray-400 mb-1">
                  {item.label}
                </p>
                <p className={readonlyClass}>{item.value || "—"}</p>
              </div>
            ))}
            <div className="md:col-span-2">
              <p className="text-xs font-medium text-gray-400 mb-1">Address</p>
              <p className={readonlyClass}>{doctorProfile?.address || "—"}</p>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Professional Information
            </h3>
            <button
              onClick={() => handleOpenModal("professional")}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Specialization", value: doctorProfile?.specialization },
              { label: "Qualification", value: doctorProfile?.qualification },
              {
                label: "Years of Experience",
                value: doctorProfile?.yearsOfExperience
                  ? `${doctorProfile.yearsOfExperience} years`
                  : "—",
              },
              {
                label: "License Number",
                value: doctorProfile?.licenseNo,
                mono: true,
                readonly: true,
              },
              {
                label: "Date of Joining",
                value: fmtDate(doctorProfile?.doj || ""),
                readonly: true,
              },
              {
                label: "Salary",
                value: doctorProfile?.salary ? `${doctorProfile.salary}` : "—",
                readonly: true,
              },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs font-medium text-gray-400 mb-1 flex items-center gap-1">
                  {item.label}
                  {item.readonly && (
                    <span className="text-gray-300 font-normal">
                      (read only)
                    </span>
                  )}
                </p>
                <p
                  className={`${readonlyClass} ${item.mono ? "font-mono" : ""}`}
                >
                  {item.value || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Edit Modal ---- */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        title={
          activeSection === "personal"
            ? "Edit Personal Information"
            : "Edit Professional Information"
        }
        width="max-w-2/3"
        height="max-h-[450px]"
        cancelIcon={<X className="w-4 h-4 mr-2" />}
        cancelText="Cancel"
        onCancel={handleCloseModal}
        confirmIcon={<Save className="w-4 h-4 mr-2" />}
        confirmText={saving ? "Saving..." : "Save Changes"}
        confirmColor="bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        onConfirm={handleSave}
      >
        {/* Personal Section */}
        {activeSection === "personal" && (
          <div className="space-y-4">
            {/* Photo upload */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 bg-blue-50 flex-shrink-0">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : doctorProfile?.photo ? (
                  <img
                    src={`${import.meta.env.VITE_BASE_URL}/images/uploads/${doctorProfile?.photo}`}
                    alt={doctorProfile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-600 text-lg font-semibold">
                    {doctorProfile?.fullName
                      ?.split(" ")
                      .map((w: string) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Profile Photo
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <Camera className="h-3.5 w-3.5" />
                  {photoPreview ? "Change Photo" : "Upload Photo"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                {photoPreview && (
                  <p className="text-xs text-green-600 mt-1">
                    New photo selected
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Emergency Contact <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="emergencyNo"
                  value={formData.emergencyNo}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Date of Birth <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Marital Status */}
              <div>
                <label className="block text-xs font-medium capitalize text-gray-500 mb-1.5">
                  Marital Status <span className="text-red-400">*</span>
                </label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Address <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Professional Section */}
        {activeSection === "professional" && (
          <div className="space-y-4">
            {/* Read-only notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                License number, date of joining, and salary are managed by an
                administrator and cannot be edited here.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Specialization */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Specialization <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Qualification */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Qualification <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Years of Experience <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  min="0"
                  className={inputClass}
                />
              </div>

              {/* License No — read only */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  License Number
                </label>
                <p className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg text-gray-400 font-mono">
                  {doctorProfile?.licenseNo || "—"}
                </p>
              </div>

              {/* Date of Joining — read only */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Date of Joining
                </label>
                <p className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg text-gray-400">
                  {fmtDate(doctorProfile?.doj)}
                </p>
              </div>

              {/* Salary — read only */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Salary
                </label>
                <p className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg text-gray-400">
                  {doctorProfile?.salary ? `${doctorProfile.salary}` : "—"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorProfile;
