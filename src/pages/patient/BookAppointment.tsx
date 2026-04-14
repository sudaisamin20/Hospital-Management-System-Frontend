import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  Stethoscope,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  User,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

interface Department {
  _id: string;
  name: string;
}

interface Specialist {
  _id: string;
  name: string;
}

interface Doctor {
  _id: string;
  fullName: string;
  photo?: string;
  specialization?: string;
}

const BookAppointment = () => {
  const patient = useSelector(
    (state: { auth?: { user?: any } }) => state.auth?.user,
  );
  const baseurl = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [relatedDoctors, setRelatedDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    aptDate: "",
    departmentId: "",
    specialist: "",
    doctorId: "",
    shift: "",
    appointmentTime: "",
    reasonForVisit: "",
  });

  const inputClass =
    "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white text-gray-800 placeholder-gray-400";

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "aptDate") {
      const now = new Date();
      const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      if (value === todayDate) {
        return toast.error("You can't book appointment today!");
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/superadmin/fetch/departments`);
      if (response.data.success) setDepartments(response.data.departments);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchSpecialists = useCallback(async (deptId: string) => {
    try {
      const response = await axiosInstance.get(
        `/superadmin/fetch/specialists/${deptId}`,
      );
      if (response.data.success) setSpecialists(response.data.specialists);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchRelatedDoctors = useCallback(
    async (specialistId: string) => {
      try {
        const res = await axiosInstance.get(
          `/patient/fetch/related-doctors/${formData.departmentId}/${specialistId}`,
        );
        if (res.data.success) setRelatedDoctors(res.data.doctors);
      } catch (err) {
        console.error(err);
      }
    },
    [formData.departmentId],
  );

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    if (formData.departmentId) {
      fetchSpecialists(formData.departmentId);
      setFormData((prev) => ({
        ...prev,
        specialist: "",
        doctorId: "",
      }));
    }
  }, [formData.departmentId, fetchSpecialists]);

  useEffect(() => {
    if (formData.specialist) {
      fetchRelatedDoctors(formData.specialist);
      setFormData((prev) => ({
        ...prev,
        doctorId: "",
      }));
    }
  }, [formData.specialist, fetchRelatedDoctors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.aptDate ||
      !formData.departmentId ||
      !formData.specialist ||
      !formData.doctorId ||
      !formData.shift ||
      !formData.appointmentTime ||
      !formData.reasonForVisit
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.reasonForVisit.trim().length < 10) {
      toast.error("Please provide at least 10 characters for reason for visit");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${baseurl}/api/appointment/add-appointment`,
        {
          patientId: patient?.id,
          aptDate: formData.aptDate,
          departmentId: formData.departmentId,
          specialistId: formData.specialist,
          doctorId: formData.doctorId,
          shift: formData.shift,
          appointmentTime: formData.appointmentTime,
          reasonForVisit: formData.reasonForVisit,
        },
        {
          headers: {
            "auth-token": localStorage.getItem("authToken") || patient?.token,
          },
        },
      );

      if (response.data.success) {
        toast.success(
          "Appointment booked successfully! You will receive a confirmation.",
          {
            duration: 4000,
          },
        );
        setFormData({
          aptDate: "",
          departmentId: "",
          specialist: "",
          doctorId: "",
          shift: "",
          appointmentTime: "",
          reasonForVisit: "",
        });
        setSpecialists([]);
        setRelatedDoctors([]);
        setTimeout(() => {
          navigate("/patient/my-appointments");
        }, 1500);
      }
    } catch (error) {
      const errorMsg =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "Failed to book appointment";
      toast.error(errorMsg);
      console.error("Booking error:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctor = relatedDoctors.find(
    (d) => d._id === formData.doctorId,
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-3">
        <div className="max-w-7xl">
          {/* Page Header */}
          <div className="mb-3 text-center md:text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Book Your Appointment
                </h1>
                <p className="text-gray-600 text-sm">
                  Select your preferred doctor and time slot to schedule your
                  consultation
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Step 1 — Schedule */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Appointment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="aptDate"
                    value={formData.aptDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>

                {/* Shift */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Shift <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="shift"
                    value={formData.shift}
                    onChange={(e) => {
                      handleInputChange(e);
                      setFormData((prev) => ({
                        ...prev,
                        shift: e.target.value,
                        appointmentTime: "",
                      }));
                    }}
                    className={inputClass}
                    required
                  >
                    <option value="">Select shift</option>
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>

                {/* Time */}
                <div className="md:col-span-2 mb-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Appointment Time <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center flex-wrap gap-2">
                    {!formData.shift ? (
                      <div className="w-full p-4 bg-gray-50 rounded-xl text-center text-gray-500 text-sm border-2 border-dashed border-gray-200">
                        <Clock className="h-5 w-5 inline mr-2 opacity-50" />
                        Select a shift to view available times
                      </div>
                    ) : (
                      (formData.shift === "morning"
                        ? [
                            "09:00 AM",
                            "09:30 AM",
                            "10:00 AM",
                            "10:30 AM",
                            "11:00 AM",
                            "11:30 AM",
                            "12:00 PM",
                          ]
                        : [
                            "04:00 PM",
                            "04:30 PM",
                            "05:00 PM",
                            "05:30 PM",
                            "06:00 PM",
                            "06:30 PM",
                            "07:00 PM",
                          ]
                      ).map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              appointmentTime: time,
                            }))
                          }
                          className={`px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                            formData.appointmentTime === time
                              ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-105"
                              : "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                          }`}
                        >
                          <Clock className="h-4 w-4 inline mr-1.5" />
                          {time}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Department */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.departmentId}
                    onChange={(e) => {
                      handleInputChange(e);
                      fetchSpecialists(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        departmentId: e.target.value,
                        specialist: "",
                        doctorId: "",
                      }));
                      setSpecialists([]);
                      setRelatedDoctors([]);
                    }}
                    className={inputClass}
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specialist */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Specialist <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="specialist"
                    value={formData.specialist}
                    onChange={(e) => {
                      handleInputChange(e);
                      fetchRelatedDoctors(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        specialist: e.target.value,
                        doctorId: "",
                      }));
                      setRelatedDoctors([]);
                    }}
                    className={inputClass}
                    required
                    disabled={!formData.department}
                  >
                    <option value="">
                      {formData.department
                        ? "Select specialist"
                        : "Select department first"}
                    </option>
                    {specialists.map((spec) => (
                      <option key={spec._id} value={spec._id}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Doctor — full width cards */}
                <div className="md:col-span-2 mb-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Available Doctors <span className="text-red-500">*</span>
                  </label>
                  {!formData.specialist ? (
                    <div className="p-6 bg-gray-50 rounded-xl text-center text-gray-500 border-2 border-dashed border-gray-200">
                      <Stethoscope className="h-8 w-8 inline mb-2 opacity-30" />
                      <p className="text-sm">
                        Select a specialist to view available doctors
                      </p>
                    </div>
                  ) : relatedDoctors.length === 0 ? (
                    <div className="p-6 bg-yellow-50 rounded-xl text-center text-yellow-700 border-2 border-yellow-200">
                      <AlertCircle className="h-6 w-6 inline mr-2 mb-2" />
                      <p className="text-sm">
                        No doctors available for the selected specialist
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {relatedDoctors.map((doc) => (
                        <button
                          key={doc._id}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              doctorId: doc._id,
                            }))
                          }
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                            formData.doctorId === doc._id
                              ? "border-blue-500 bg-blue-50 shadow-lg"
                              : "border-gray-200 bg-gray-50 hover:bg-white hover:border-blue-300"
                          }`}
                        >
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 text-white font-bold text-lg shadow-md">
                            {doc.photo ? (
                              <img
                                src={`${baseurl}/images/uploads/${doc.photo}`}
                                alt={doc.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>
                                {doc.fullName
                                  .split(" ")
                                  .map((w) => w[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                              Dr. {doc.fullName}
                            </p>
                            {doc.specialization && (
                              <p className="text-xs text-gray-600 truncate">
                                {doc.specialization}
                              </p>
                            )}
                          </div>
                          {formData.doctorId === doc._id && (
                            <div className="shrink-0 p-1.5 bg-blue-600 rounded-full">
                              <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Please describe your symptoms or reason{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reasonForVisit"
                  value={formData.reasonForVisit}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Example: I've been experiencing persistent headaches for the past week, and I would like to discuss treatment options..."
                  className={`${inputClass} resize-none focus:ring-purple-100 focus:border-purple-300`}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  {formData.reasonForVisit.length}/500 characters
                </p>
              </div>
            </div>

            {/* Booking Summary */}
            {(formData.aptDate ||
              formData.appointmentTime ||
              selectedDoctor) && (
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-md">
                <h3 className="text-base font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Booking Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    {
                      icon: (
                        <Calendar className="h-4 w-4 inline mr-1.5 text-blue-600" />
                      ),
                      label: " Date",
                      value: formData.aptDate
                        ? new Date(formData.aptDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "—",
                    },
                    {
                      icon: (
                        <Clock className="h-4 w-4 inline mr-1.5 text-blue-600" />
                      ),
                      label: "Time",
                      value: formData.appointmentTime || "—",
                    },
                    {
                      icon: (
                        <Clock className="h-4 w-4 inline mr-1.5 text-blue-600" />
                      ),
                      label: "Shift",
                      value: formData.shift
                        ? formData.shift.charAt(0).toUpperCase() +
                          formData.shift.slice(1)
                        : "—",
                    },
                    {
                      icon: (
                        <User className="h-4 w-4 inline mr-1.5 text-blue-600" />
                      ),
                      label: "Doctor",
                      value: selectedDoctor
                        ? `Dr. ${selectedDoctor.fullName}`
                        : "—",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-white rounded-xl p-3 border border-blue-100"
                    >
                      <div className="flex items-center">
                        <span>{item.icon}</span>
                        <p className="text-xs text-blue-600 font-bold mt-1">
                          {item.label}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-blue-900 truncate">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notice */}
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-5 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 font-bold" />
              <div>
                <p className="font-semibold text-amber-900 mb-1">
                  Important Information
                </p>
                <ul className="text-sm text-amber-800 space-y-1.5 list-disc list-inside">
                  <li>Please arrive 15 minutes before your appointment</li>
                  <li>
                    Bring your insurance card and relevant medical documents
                  </li>
                  <li>Confirmation will be sent via email</li>
                  <li>You can reschedule or cancel up to 24 hours before</li>
                </ul>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white text-base font-semibold rounded-xl hover:shadow-xl hover:bg-blue-700 transition-all duration-300 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="inline-block animate-spin">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                  Booking Your Appointment...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Book Appointment
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default BookAppointment;
