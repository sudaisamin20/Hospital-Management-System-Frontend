import axiosInstance from "./axiosInstance";

// Types
export interface LoginPayload {
  id_no?: string;
  email: string;
  password: string;
}

export interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phoneNo?: string;
  role: string;
  id_no?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    id_no: string;
    fullName: string;
    email: string;
    phoneNo: string;
    role: string;
  };
  token?: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

// API Functions
export const loginApi = (API_ENDPOINT: string, payload: LoginPayload) => {
  const response = axiosInstance.post<AuthResponse>(API_ENDPOINT, payload);
  return response;
};

export const signupApi = (payload: SignupPayload) =>
  axiosInstance.post<AuthResponse>("/auth/signup", payload);

export const verifyOtpApi = (payload: VerifyOtpPayload) =>
  axiosInstance.post<AuthResponse>("/auth/verify-otp", payload);

export const resendOtpApi = (payload: ResendOtpPayload) =>
  axiosInstance.post<{ success: boolean; message: string }>(
    "/auth/resend-otp",
    payload,
  );

export const logoutApi = () =>
  axiosInstance.post<{ success: boolean; message: string }>("/auth/logout", {});

export const refreshTokenApi = () =>
  axiosInstance.post<AuthResponse>("/auth/refresh-token", {});

export const forgotPasswordApi = (payload: ForgotPasswordPayload) =>
  axiosInstance.post<{ success: boolean; message: string }>(
    "/auth/forgot-password",
    payload,
  );

export const resetPasswordApi = (payload: ResetPasswordPayload) =>
  axiosInstance.post<AuthResponse>("/auth/reset-password", payload);

export const verifyTokenApi = () =>
  axiosInstance.get<{
    success: boolean;
    user?: {
      id: string;
      email: string;
      fullName: string;
      role: string;
    };
  }>("/auth/verify-token");
