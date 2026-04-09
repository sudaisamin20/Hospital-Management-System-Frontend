import axiosInstance from "./axiosInstance";

// Types
export interface LabAssistantProfile {
  id: string;
  id_no: string;
  fullName: string;
  email: string;
  phoneNo: string;
  departmentId: string;
  photo?: string;
}

export interface LabTest {
  id: string;
  id_no: string;
  patientName: string;
  testName: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  orderedAt: string;
  completedAt?: string;
  results?: any[];
}

export interface LabTestResult {
  parameterName: string;
  value: number;
  unit: string;
  normalRange: string;
  status: "Normal" | "High" | "Low" | "Critical";
  notes?: string;
}

// API Functions
export const getLabAssistantProfileApi = () =>
  axiosInstance.get<{ success: boolean; labAssistant: LabAssistantProfile }>(
    "/api/lab-assistant/profile-details",
  );

export const getAllLabTestOrdersApi = () =>
  axiosInstance.get<{ success: boolean; labTests: LabTest[] }>(
    "/api/lab-assistant/fetch/all-lab-tests",
  );

export const updateLabTestStatusApi = (testId: string, status: string) =>
  axiosInstance.put<{ success: boolean; message: string }>(
    `/api/lab-assistant/update-test-status/${testId}`,
    { status },
  );

export const submitLabTestResultsApi = (
  testId: string,
  results: LabTestResult[],
) =>
  axiosInstance.put<{ success: boolean; message: string }>(
    `/api/lab-assistant/submit-test-results/${testId}`,
    { results },
  );

export const generateLabReportApi = (testId: string) =>
  axiosInstance.get<{ success: boolean; reportUrl: string }>(
    `/api/lab-assistant/generate-report/${testId}`,
  );
