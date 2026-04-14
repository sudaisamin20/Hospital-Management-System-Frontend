import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Eye,
  Calendar,
  Activity,
  Pill,
  FlaskRound,
  FileText,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  TrendingUp,
  Clock,
  Plus,
  ChevronRight,
  Download,
  X,
  Heart,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";
import axiosInstance from "../../api/axiosInstance";
import StatsCard from "../../components/StatsCard";

interface IPatientRecordAPI {
  patients: [
    {
      appointments: [];
      status: string;
      lastVisit: string;
      totalAppointments: number;
      totalVisits: number;
      patientInfo: {
        _id: string;
        address: string;
        agreeTerms: boolean;
        allergies: [];
        bloodGroup: string;
        createdAt: string;
        dob: string;
        email: string;
        emergencyNo: string;
        fullName: string;
        gender: string;
        id_no: string;
        isActive: boolean;
        phoneNo: string;
        photo: string;
        role: string;
        updatedAt: string;
      };
    },
  ];
  totalActiveCases: number;
  totalFollowUpRequired: number;
  totalPatients: number;
}

interface PatientRecord {
  _id: string;
  id_no: string;
  fullName: string;
  email: string;
  phoneNo: string;
  dob: string;
  gender: string;
  bloodGroup?: string;
  photo?: string;
  address: {
    street: string;
    city: string;
    state: string;
  };
  emergencyContact: string;
  lastVisit?: string;
  totalVisits: number;
  lastCondition?: string;
  status: "Active" | "Follow-up" | "Inactive";
  allergies?: string[];
  chronicConditions?: string[];
}

interface PatientFullRecord {
  patientInfo: Patient;
  appointments: any[];
  consultations: any[];
  prescriptions: any[];
  labTests: any[];
  stats: {
    totalVisits: number;
    totalPrescriptions: number;
    totalLabTests: number;
    lastVisit: string;
  };
}

const Patients = () => {
  const doctor = useSelector((state: any) => state.auth.user);
  const navigate = useNavigate();
  const { patientId } = useParams();
  const baseurl = import.meta.env.VITE_BASE_URL;
  const { isOpen, openModal, closeModal } = useModal();

  const [view, setView] = useState<"list" | "detail">(
    patientId ? "detail" : "list",
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [patientRecords, setPatientsRecords] = useState<IPatientRecordAPI>({});
  const [selectedPatient, setSelectedPatient] =
    useState<PatientFullRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [visitFilter, setVisitFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPatients = async () => {
    try {
      const response = await axiosInstance.get(`/doctor/get-patients-data`);
      console.log(response.data.patientRecords);
      if (response.data.success) {
        setPatientsRecords(response.data.patientRecords);
        console.log(response.data.patientRecords);
      }
    } catch (error: any) {
      console.error("Error fetching patients:", error.message);
      toast.error(error.response?.data?.message || "Failed to load patients");
    }
  };
  console.log(patientRecords);
  //   const fetchPatientFullRecord = async (id: string) => {
  //     try {
  //       const response = await axios.get(
  //         `${baseurl}/api/doctor/patient/${id}/full-record`,
  //         {
  //           headers: {
  //             "auth-token": localStorage.getItem("authToken") || doctor?.token,
  //           },
  //         },
  //       );
  //       if (response.data.success) {
  //         // setSelectedPatient(response.data.record);
  //       }
  //     } catch (error: any) {
  //       console.error("Error fetching patient record:", error.message);
  //       toast.error(
  //         error.response?.data?.message || "Failed to load patient record",
  //       );
  //     }
  //   };

  useEffect(() => {
    if (doctor?.id) {
      const fetchData = async () => {
        await fetchPatients();
      };
      fetchData();
    }

    if (doctor?.id) {
      // Sample full record
      setSelectedPatient({
        patientInfo: {
          _id: "1",
          id_no: "PAT-001",
          fullName: "Ali Khan",
          email: "ali@email.com",
          phoneNo: "+92-300-1234567",
          dob: "1980-05-15",
          gender: "Male",
          bloodGroup: "A+",
          photo: "",
          address: {
            street: "123 Main St",
            city: "Rawalpindi",
            state: "Punjab",
          },
          emergencyContact: {
            name: "Sara Khan",
            phoneNo: "+92-300-7777777",
          },
          lastVisit: "2026-03-20",
          totalVisits: 5,
          lastCondition: "Hypertension",
          status: "Follow-up",
          allergies: ["Penicillin"],
          chronicConditions: ["Hypertension", "Diabetes"],
        },
        appointments: [
          {
            _id: "1",
            date: "2026-03-20",
            time: "10:00 AM",
            doctor: "Dr. Sarah Smith",
            status: "Completed",
            reason: "Regular checkup",
          },
          {
            _id: "2",
            date: "2026-03-15",
            time: "02:00 PM",
            doctor: "Dr. Sarah Smith",
            status: "Completed",
            reason: "Follow-up",
          },
        ],
        consultations: [
          {
            _id: "1",
            date: "2026-03-20",
            doctor: "Dr. Sarah Smith",
            diagnosis: "Hypertension - well controlled",
            symptoms: "No current symptoms",
            notes: "Continue current medication. Monitor BP regularly.",
            vitals: {
              bloodPressure: "130/85",
              heartRate: "75",
              temperature: "98.6",
              weight: "80",
            },
          },
        ],
        prescriptions: [
          {
            _id: "1",
            date: "2026-03-20",
            doctor: "Dr. Sarah Smith",
            medicines: [
              {
                name: "Amlodipine",
                dosage: "5mg",
                frequency: "1x daily",
                duration: "30 days",
              },
            ],
            status: "Dispensed",
          },
        ],
        labTests: [
          {
            _id: "1",
            testName: "Lipid Profile",
            date: "2026-03-15",
            status: "Completed",
            result: "Normal",
          },
        ],
        stats: {
          totalVisits: 5,
          totalPrescriptions: 3,
          totalLabTests: 2,
          lastVisit: "2026-03-20",
        },
      });
    }
  }, [doctor?.id]);
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

  const filteredPatients = patientRecords?.patients?.filter((data) => {
    const matchesSearch =
      data.patientInfo.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      data.patientInfo.id_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.patientInfo.phoneNo.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || data.status === statusFilter;

    const matchesVisit =
      visitFilter === "all" ||
      (visitFilter === "today" &&
        data.lastVisit === new Date().toISOString().split("T")[0]) ||
      (visitFilter === "week" &&
        new Date(data.lastVisit!) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (visitFilter === "month" &&
        new Date(patient.lastVisit!) >
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesStatus && matchesVisit;
  });

  const handleViewPatient = (patient: Patient) => {
    navigate(`/doctor/patients/patient-profile/${patient}`);
    // fetchPatientFullRecord(patient._id);
  };
  //   const handleViewPatient = (patient: Patient) => {
  //     setSelectedPatient({
  //       patientInfo: patient,
  //       appointments: [],
  //       consultations: [],
  //       prescriptions: [],
  //       labTests: [],
  //       stats: {
  //         totalVisits: patient.totalVisits,
  //         totalPrescriptions: 0,
  //         totalLabTests: 0,
  //         lastVisit: patient.lastVisit || "",
  //       },
  //     });

  //     setView("detail");
  //   };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Follow-up":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Timeline data
  const timelineData = selectedPatient
    ? [
        ...selectedPatient.appointments.map((apt) => ({
          date: apt.date,
          type: "appointment",
          data: apt,
        })),
        ...selectedPatient.consultations.map((cons) => ({
          date: cons.date,
          type: "consultation",
          data: cons,
        })),
        ...selectedPatient.prescriptions.map((pres) => ({
          date: pres.date,
          type: "prescription",
          data: pres,
        })),
        ...selectedPatient.labTests.map((lab) => ({
          date: lab.date,
          type: "labTest",
          data: lab,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  // Group timeline by date
  const groupedTimeline = timelineData.reduce((acc: any, item) => {
    const date = new Date(item.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "timeline", label: "Medical Timeline", icon: Clock },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "prescriptions", label: "Prescriptions", icon: Pill },
    { id: "labTests", label: "Lab Tests", icon: FlaskRound },
    { id: "notes", label: "Notes", icon: FileText },
  ];

  const stats = [
    {
      label: "Total Patients",
      value: patientRecords?.totalPatients,
      icon: Users,
      color: "blue",
    },
    {
      label: "New This Week",
      value: patientRecords?.patients?.filter(
        (p) =>
          new Date(p.lastVisit!) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      ).length,
      icon: TrendingUp,
      color: "green",
    },
    {
      label: "Follow-up Required",
      value: patientRecords?.totalFollowUpRequired,
      icon: AlertCircle,
      color: "yellow",
    },
    {
      label: "Active Cases",
      value: patientRecords?.totalActiveCases,
      icon: Activity,
      color: "purple",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 p-3">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Patients</h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage and view patient records
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {stats.map((stat, index) => {
            return (
              <StatsCard
                key={index}
                index={index}
                label={stat.label}
                value={stat.value}
                color={stat.color}
                icon={stat.icon}
              />
            );
          })}
        </div>

        {/* Filters */}
        <div className="mb-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm w-full pl-8 pr-2 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
              />
            </div>

            {/* Visit Filter */}
            <select
              value={visitFilter}
              onChange={(e) => setVisitFilter(e.target.value)}
              className="text-sm p-2 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
            >
              <option value="all">All Visits</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm p-2 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Inactive">Inactive</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || visitFilter !== "all" || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setVisitFilter("all");
                setStatusFilter("all");
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
              {filteredPatients?.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {patientRecords?.totalPatients}
            </span>{" "}
            patients
          </p>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Patient ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Age
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Gender
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Last Visit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Total Visits
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
                {filteredPatients?.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">
                          No patients found
                        </p>
                        <p className="text-gray-400 mt-1">
                          Try adjusting your filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPatients?.map((patient) => (
                    <tr
                      key={patient.patientInfo._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono font-semibold text-gray-900">
                          {patient.patientInfo.id_no}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {patient.patientInfo.photo ? (
                              <img
                                src={`${baseurl}/images/uploads/${patient.patientInfo.photo}`}
                                alt={patient.patientInfo.fullName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {patient.patientInfo.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {patient.patientInfo.phoneNo}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateAge(patient.patientInfo.dob)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.patientInfo.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.lastVisit
                          ? new Date(patient.lastVisit).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {patient.totalVisits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(patient.status)}`}
                        >
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() =>
                            handleViewPatient(patient.patientInfo._id)
                          }
                          className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Patients;
