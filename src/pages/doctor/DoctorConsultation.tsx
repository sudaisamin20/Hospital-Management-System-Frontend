import { useState } from "react";
import {
  User,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Stethoscope,
  Calendar,
  Clock,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import AsyncSelect from "react-select/async";
import type { IStateData, User as IUser } from "../../features";
import type { AppointmentData } from "../../api";

const DoctorConsultation = () => {
  const doctor: IUser = useSelector((state: IStateData) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const baseurl = import.meta.env.VITE_BASE_URL;

  // ── Appointment passed via navigate state ─────────────────────────────────
  const appointment: AppointmentData | undefined = location.state?.appointment;

  const [saving, setSaving] = useState(false);

  const [consultationData, setConsultationData] = useState({
    vitals: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      weight: "",
      height: "",
    },
    symptoms: "",
    diagnosis: "",
    medicines: [
      {
        id: 1,
        medicineId: "",
        medicineName: "",
        dosage: "",
        frequency: "",
        duration: "",
        timing: "",
        instructions: "",
      },
    ],
    labTests: [{ id: 1, testId: "", testName: "" }],
    followUp: {
      duration: "",
      notes: "",
    },
    additionalNotes: "",
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const calcAge = (dob: string) => {
    if (!dob) return "—";
    const age = Math.floor(
      (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    );
    return age;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setConsultationData((prev) => ({
        ...prev,
        [parent]: { ...(prev as any)[parent], [child]: value },
      }));
    } else {
      setConsultationData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ── Medicine handlers ─────────────────────────────────────────────────────
  const handlePrescriptionChange = (
    id: number,
    field: string,
    value: string,
  ) => {
    setConsultationData((prev) => ({
      ...prev,
      medicines: prev.medicines.map((med) =>
        med.id === id ? { ...med, [field]: value } : med,
      ),
    }));
  };

  const handleAddPrescription = () => {
    setConsultationData((prev) => {
      const newId = prev.medicines.length
        ? Math.max(...prev.medicines.map((m) => m.id)) + 1
        : 1;
      return {
        ...prev,
        medicines: [
          ...prev.medicines,
          {
            id: newId,
            medicineId: "",
            medicineName: "",
            dosage: "",
            frequency: "",
            duration: "",
            timing: "",
            instructions: "",
          },
        ],
      };
    });
  };

  const handleRemovePrescription = (id: number) => {
    setConsultationData((prev) => {
      if (prev.medicines.length <= 1) {
        toast.error("At least one prescription is required");
        return prev;
      }
      return { ...prev, medicines: prev.medicines.filter((m) => m.id !== id) };
    });
  };

  // ── Lab test handlers ─────────────────────────────────────────────────────
  const handleAddLabTest = () => {
    setConsultationData((prev) => {
      const newId = prev.labTests.length
        ? Math.max(...prev.labTests.map((t) => t.id)) + 1
        : 1;
      return {
        ...prev,
        labTests: [...prev.labTests, { id: newId, testId: "", testName: "" }],
      };
    });
  };

  const handleRemoveLabTest = (id: number) => {
    setConsultationData((prev) => {
      if (prev.labTests.length <= 1) {
        toast.error("At least one lab test is required");
        return prev;
      }
      return { ...prev, labTests: prev.labTests.filter((t) => t.id !== id) };
    });
  };

  // ── Async search options ──────────────────────────────────────────────────
  const loadMedicineOptions = async (inputValue: string) => {
    if (!inputValue) return [];
    const res = await axios.get(
      `${baseurl}/api/prescription/search?query=${inputValue}`,
    );
    return res.data.medicines.map((med: any) => ({
      value: med._id,
      label: med.name,
    }));
  };

  const loadLabTestOptions = async (inputValue: string) => {
    if (!inputValue) return [];
    const res = await axios.get(
      `${baseurl}/api/lab/search?query=${inputValue}`,
    );
    return res.data.labTests.map((test: any) => ({
      value: test._id,
      label: test.name,
    }));
  };

  // ── Save consultation ─────────────────────────────────────────────────────
  const handleSaveConsultation = async () => {
    if (!consultationData.diagnosis.trim()) {
      toast.error("Diagnosis is required");
      return;
    }

    const hasIncompleteMedicine = consultationData.medicines.some(
      (m) =>
        !m.medicineName ||
        !m.dosage ||
        !m.frequency ||
        !m.duration ||
        !m.timing,
    );
    if (hasIncompleteMedicine) {
      toast.error("Please complete all required medicine fields");
      return;
    }

    setSaving(true);
    try {
      const filteredLabTests = consultationData.labTests.filter((t) =>
        t.testName.trim(),
      );

      const patientId =
        typeof appointment?.patientId !== "string"
          ? appointment?.patientId?._id
          : "";
      const doctorId =
        typeof appointment?.doctorId !== "string"
          ? appointment?.doctorId?._id
          : "";

      const response = await axios.post(
        `${baseurl}/api/consultation/create-consultation`,
        {
          aptId: appointment?._id,
          patientId,
          doctorId,
          consultationData: { ...consultationData, labTests: filteredLabTests },
        },
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Consultation saved successfully",
        );
        navigate("/doctor/appointments");
      }
    } catch (error) {
      toast.error(
        (error as any)?.response?.data?.message ||
          "Failed to save consultation",
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Guard — if navigated directly without appointment data ────────────────
  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Stethoscope className="h-12 w-12 text-gray-300" />
        <p className="text-gray-500 text-sm">No appointment data found.</p>
        <button
          onClick={() => navigate("/doctor/appointments")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Appointments
        </button>
      </div>
    );
  }

  const patient =
    typeof appointment.patientId !== "string" ? appointment.patientId : null;

  const inputCls =
    "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent";

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="max-w-5xl mx-auto">
        {/* ── Page Header ── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => navigate("/doctor/appointments")}
              className="flex items-center gap-1 hover:text-blue-400 cursor-pointer font-semibold text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />{" "}
              <span className="text-sm">Back to Appointments</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                <Stethoscope className="h-6 w-6" />
                Start Consultation
              </h1>
              <p className="text-sm text-gray-500">
                Complete and save the consultation details below
              </p>
            </div>
          </div>
        </div>

        {/* ── Patient Info Banner ── */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-blue-600 font-medium text-xs uppercase">
                Patient ID
              </span>
              <p className="text-blue-900 font-semibold font-mono">
                {patient?.id_no || "—"}
              </p>
            </div>
            <div>
              <span className="text-blue-600 font-medium text-xs uppercase">
                Patient Name
              </span>
              <p className="text-blue-900 font-semibold">
                {patient?.fullName || "—"}
              </p>
            </div>
            <div>
              <span className="text-blue-600 font-medium text-xs uppercase">
                Age / Gender
              </span>
              <p className="text-blue-900 capitalize">
                {calcAge(patient?.dob || "")} y/o • {patient?.gender || "—"}
              </p>
            </div>
            <div>
              <span className="text-blue-600 font-medium text-xs uppercase">
                Contact
              </span>
              <p className="text-blue-900">{patient?.phoneNo || "—"}</p>
            </div>
          </div>

          {/* Appointment summary strip */}
          <div className="mt-3 pt-3 border-t border-blue-200 flex flex-wrap gap-4 text-xs text-blue-700">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(appointment.aptDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {appointment.appointmentTime}
            </span>
            <span className="capitalize font-medium">
              {appointment.shift} Shift
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* ── Reason For Visit ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason For Visit
            </label>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-800 leading-relaxed text-sm">
                {appointment.reasonForVisit || "No reason provided"}
              </p>
            </div>
          </div>

          {/* ── Vital Signs ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Vital Signs
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                {
                  label: "Blood Pressure (mmHg)",
                  name: "vitals.bloodPressure",
                  placeholder: "120/80",
                  type: "text",
                },
                {
                  label: "Heart Rate (bpm)",
                  name: "vitals.heartRate",
                  placeholder: "72",
                  type: "number",
                },
                {
                  label: "Temperature (°F)",
                  name: "vitals.temperature",
                  placeholder: "98.6",
                  type: "number",
                  step: "0.1",
                },
                {
                  label: "Weight (kg)",
                  name: "vitals.weight",
                  placeholder: "70",
                  type: "number",
                  step: "0.1",
                },
                {
                  label: "Height (cm)",
                  name: "vitals.height",
                  placeholder: "170",
                  type: "number",
                },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    step={(field as any).step}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Diagnosis & Symptoms ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Diagnosis <span className="text-red-500">*</span>
              </label>
              <textarea
                name="diagnosis"
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter diagnosis details..."
                className={`${inputCls} resize-none`}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Symptoms Observed
              </label>
              <textarea
                name="symptoms"
                onChange={handleInputChange}
                rows={2}
                placeholder="List observed symptoms..."
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>

          {/* ── Prescription ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Prescription <span className="text-red-500">*</span>
            </h3>
            <div className="space-y-3">
              {consultationData.medicines.map((med, index) => (
                <div
                  key={med.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Medicine {index + 1}
                    </h4>
                    {consultationData.medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          handleRemovePrescription(med.id);
                          toast.success(
                            `${med.medicineName || "Medicine"} removed`,
                          );
                        }}
                        className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Medicine Name <span className="text-red-500">*</span>
                      </label>
                      <AsyncSelect
                        cacheOptions
                        loadOptions={loadMedicineOptions}
                        defaultOptions
                        placeholder="Search Medicine e.g: Panadol"
                        onChange={(selected: any) => {
                          handlePrescriptionChange(
                            med.id,
                            "medicineId",
                            selected.value,
                          );
                          handlePrescriptionChange(
                            med.id,
                            "medicineName",
                            selected.label,
                          );
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Dosage <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={med.dosage}
                        onChange={(e) =>
                          handlePrescriptionChange(
                            med.id,
                            "dosage",
                            e.target.value,
                          )
                        }
                        placeholder="e.g., 500"
                        className={inputCls}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Frequency <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={med.frequency}
                        onChange={(e) =>
                          handlePrescriptionChange(
                            med.id,
                            "frequency",
                            e.target.value,
                          )
                        }
                        className={inputCls}
                        required
                      >
                        <option value="">Select</option>
                        <option value="1">Once daily</option>
                        <option value="2">Twice daily</option>
                        <option value="3">Three times daily</option>
                        <option value="4">Four times daily</option>
                        <option value="6">Every 4 hours</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Duration (days) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={med.duration}
                        onChange={(e) =>
                          handlePrescriptionChange(
                            med.id,
                            "duration",
                            e.target.value,
                          )
                        }
                        placeholder="e.g., 7"
                        className={inputCls}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        When to take <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={med.timing}
                        onChange={(e) =>
                          handlePrescriptionChange(
                            med.id,
                            "timing",
                            e.target.value,
                          )
                        }
                        className={inputCls}
                        required
                      >
                        <option value="">Select</option>
                        <option value="Before food">Before food</option>
                        <option value="After food">After food</option>
                        <option value="With food">With food</option>
                        <option value="Empty stomach">Empty stomach</option>
                        <option value="Bedtime">Bedtime</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Special Instructions
                      </label>
                      <input
                        type="text"
                        value={med.instructions}
                        onChange={(e) =>
                          handlePrescriptionChange(
                            med.id,
                            "instructions",
                            e.target.value,
                          )
                        }
                        placeholder="Any special notes"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddPrescription}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Another Medicine
              </button>
            </div>
          </div>

          {/* ── Lab Tests ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Lab Tests
            </h3>
            <div className="space-y-2">
              {consultationData.labTests.map((test, index) => (
                <div
                  key={test.id}
                  className="bg-white border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Test {index + 1}
                      </label>
                      <AsyncSelect
                        cacheOptions
                        loadOptions={loadLabTestOptions}
                        defaultOptions
                        placeholder="Search Lab Test e.g: Blood Sugar"
                        value={
                          test.testName
                            ? { label: test.testName, value: test.testId }
                            : null
                        }
                        onChange={(selected: any) => {
                          setConsultationData((prev) => ({
                            ...prev,
                            labTests: prev.labTests.map((t) =>
                              t.id === test.id
                                ? {
                                    ...t,
                                    testId: selected.value,
                                    testName: selected.label,
                                  }
                                : t,
                            ),
                          }));
                          toast.success(`${selected.label} added`);
                        }}
                      />
                    </div>
                    {consultationData.labTests.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          handleRemoveLabTest(test.id);
                          toast.success(`${test.testName || "Test"} removed`);
                        }}
                        className="mt-5 text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddLabTest}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Lab Test
              </button>
            </div>
          </div>

          {/* ── Follow Up ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Follow-up
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Follow-up After
                </label>
                <select
                  name="followUp.duration"
                  onChange={handleInputChange}
                  className={inputCls}
                >
                  <option value="">Select</option>
                  <option value="3 days">3 days</option>
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="1 month">1 month</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="No follow-up needed">
                    No follow-up needed
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Follow-up Notes
                </label>
                <input
                  type="text"
                  name="followUp.notes"
                  onChange={handleInputChange}
                  placeholder="Any specific instructions for follow-up"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* ── Additional Notes ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Additional Notes / Advice
            </label>
            <textarea
              name="additionalNotes"
              onChange={handleInputChange}
              rows={3}
              placeholder="Any additional instructions, lifestyle changes, dietary recommendations, precautions, etc."
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* ── Important Notice ── */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900 mb-1">
                  Important
                </h4>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>Please review all information carefully before saving</li>
                  <li>
                    Prescription will be sent to patient via SMS and email
                  </li>
                  <li>
                    Lab test orders will be forwarded to the lab department
                  </li>
                  <li>Patient can download prescription from their portal</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ── Bottom Save Button ── */}
          <button
            onClick={handleSaveConsultation}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            {saving ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
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
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Saving Consultation...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Consultation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorConsultation;
