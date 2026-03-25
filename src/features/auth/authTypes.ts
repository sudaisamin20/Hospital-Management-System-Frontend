export type Role =
  | "patient"
  | "doctor"
  | "receptionist"
  | "superadmin"
  | "pharmacist"
  | "labAssistant";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  token: string | null;
}

export interface PatientUser extends User {
  dob: string;
  gender: string;
  phoneNo: string;
  address: string;
  emergencyNo: string;
}

export interface DoctorUser extends User {
  licenseNo: string;
  specialization: string;
  departmentId: string;
  yearsOfExperience: string;
  qualification: string;
  salary: string;
  photo: string;
  doj: string;
  dob: string;
  maritalStatus: string;
  specialistId: string;
  emergencyNo: string;
  address: string;
}

export interface ReceptionistUser extends User {
  id_no: string;
  dob: string;
  maritalStatus: string;
  qualification: string;
  yearsOfExperience: string;
  doj: string;
  emergencyNo: string;
  salary: string;
  photo: string;
  address: string;
}

export interface PharmacistUser extends User {
  id_no: string;
  licenseNo: string;
  branch: string;
  yearsOfExperience: string;
  qualification: string;
  emergencyNo: string;
  salary: string;
  maritalStatus: string;
  doj: string;
  dob: string;
  address: string;
  photo: string;
}

export interface LabAssistantUser extends User {
  id_no: string;
  departmentId?: string;
  qualification: string;
  yearsOfExperience: string;
  licenseNo?: string;
  emergencyNo: string;
  salary: string;
  maritalStatus: string;
  photo: string;
  doj: string;
  dob: string;
  address: string;
}

export interface AdminUser extends User {
  department: string;
  role: "admin";
}

export type AnyUser =
  | PatientUser
  | DoctorUser
  | ReceptionistUser
  | AdminUser
  | PharmacistUser
  | LabAssistantUser;

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  role: Role | null;
}
