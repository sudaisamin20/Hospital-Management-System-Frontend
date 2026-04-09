import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { login, logout, loadUser, updateUserProfile } from "./authSlice";
import { type Role, type User } from "./authTypes";
import {
  loginApi,
  signupApi,
  verifyOtpApi,
  logoutApi,
  type LoginPayload,
  type SignupPayload,
  type VerifyOtpPayload,
} from "../../api/auth.api";

/**
 * useAuth Hook - Get current auth state
 * Returns: user, isAuthenticated, role
 */
export const useAuth = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const role = useAppSelector((state) => state.auth.role);

  return { user, isAuthenticated, role };
};

/**
 * useLogin Hook - Handle user login
 */
export const useLogin = () => {
  const dispatch = useAppDispatch();

  return useCallback(
    async (endpoint: string, payload: LoginPayload) => {
      try {
        const response = await loginApi(endpoint || "/auth/login", payload);
        if (response.data.success && response.data.user) {
          const userData: User = {
            id: response.data.user.id,
            fullName: response.data.user.fullName,
            email: response.data.user.email,
            role: (response.data.user.role as Role) || "patient",
            token: response.data.token || null,
          };
          dispatch(login(userData));
          return response.data;
        }
      } catch (error) {
        throw error;
      }
    },
    [dispatch],
  );
};

/**
 * useSignup Hook - Handle user registration
 */
export const useSignup = () => {
  const dispatch = useAppDispatch();

  return useCallback(
    async (payload: SignupPayload) => {
      try {
        const response = await signupApi(payload);
        if (response.data.success && response.data.user) {
          const userData: User = {
            id: response.data.user.id,
            fullName: response.data.user.fullName,
            email: response.data.user.email,
            role: (response.data.user.role as Role) || "patient",
            token: response.data.token || null,
          };
          dispatch(login(userData));
          return response.data;
        }
      } catch (error) {
        throw error;
      }
    },
    [dispatch],
  );
};

/**
 * useVerifyOtp Hook - Verify OTP during auth flow
 */
export const useVerifyOtp = () => {
  const dispatch = useAppDispatch();

  return useCallback(
    async (payload: VerifyOtpPayload) => {
      try {
        const response = await verifyOtpApi(payload);
        if (response.data.success && response.data.user) {
          const userData: User = {
            id: response.data.user.id,
            fullName: response.data.user.fullName,
            email: response.data.user.email,
            role: (response.data.user.role as Role) || "patient",
            token: response.data.token || null,
          };
          dispatch(login(userData));
          return response.data;
        }
      } catch (error) {
        throw error;
      }
    },
    [dispatch],
  );
};

/**
 * useLogout Hook - Handle user logout
 */
export const useLogout = () => {
  const dispatch = useAppDispatch();

  return useCallback(async () => {
    try {
      await logoutApi();
      dispatch(logout());
    } catch (error) {
      // Even if logout API fails, clear local state
      dispatch(logout());
      throw error;
    }
  }, [dispatch]);
};

/**
 * useUpdateProfile Hook - Update user profile
 */
export const useUpdateProfile = () => {
  const dispatch = useAppDispatch();

  return useCallback(
    (updates: Partial<User>) => {
      dispatch(updateUserProfile(updates));
    },
    [dispatch],
  );
};

/**
 * useRestoreAuth Hook - Restore auth state from localStorage on app load
 */
export const useRestoreAuth = () => {
  const dispatch = useAppDispatch();

  return useCallback(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser) as User;
        dispatch(loadUser(user));
      }
    } catch (error) {
      console.error("Failed to restore auth state:", error);
      dispatch(logout());
    }
  }, [dispatch]);
};
