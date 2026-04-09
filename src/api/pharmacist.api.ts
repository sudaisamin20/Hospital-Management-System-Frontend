import axiosInstance from "./axiosInstance";

// Types
export interface PharmacistProfile {
  id: string;
  id_no: string;
  fullName: string;
  email: string;
  phoneNo: string;
  departmentId: string;
  photo?: string;
}

export interface Medicine {
  id: string;
  id_no: string;
  name: string;
  dosage: string;
  stock: number;
  price: number;
  description?: string;
}

export interface Prescription {
  id: string;
  id_no: string;
  patientName: string;
  doctorName: string;
  medicines: Medicine[];
  status: "Pending" | "Dispensed" | "Cancelled";
  createdAt: string;
  dispensedAt?: string;
}

// API Functions
export const getPharmacistProfileApi = () =>
  axiosInstance.get<{ success: boolean; pharmacist: PharmacistProfile }>(
    "/api/pharmacist/profile-details",
  );

export const getAllPrescriptionsApi = () =>
  axiosInstance.get<{ success: boolean; prescriptions: Prescription[] }>(
    "/api/pharmacist/fetch/all-prescriptions",
  );

export const dispensePrescriptionApi = (prescriptionId: string) =>
  axiosInstance.put<{ success: boolean; message: string }>(
    `/api/pharmacist/dispense-prescription/${prescriptionId}`,
    {},
  );

export const getAllMedicinesApi = () =>
  axiosInstance.get<{ success: boolean; medicines: Medicine[] }>(
    "/api/pharmacist/fetch/all-medicines",
  );

export const updateMedicineStockApi = (medicineId: string, stock: number) =>
  axiosInstance.put<{ success: boolean; message: string }>(
    `/api/pharmacist/update-medicine-stock/${medicineId}`,
    { stock },
  );
