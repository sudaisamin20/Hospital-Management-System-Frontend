import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

import { loginApi, registerPatientApi } from '../../api/auth.api';
import type { LoginPayload, RegisterPatientPayload } from '../../api/auth.api';
import { login, logout } from './authSlice';
import type { Role, User } from './authTypes';
import { AUTH_RESPONSE_KEYS, DASHBOARD_ROUTES } from '../../constants/apiRoutes';
import { useAppDispatch } from '../../hooks/useAppDispatch';

// ─── useLogin ─────────────────────────────────────────────────────────────────

export const useLogin = (role: Role) => {
  const [formData, setFormData] = useState<LoginPayload>({
    id_no: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await loginApi(role, formData);
      if (response.data.success) {
        const responseKey = AUTH_RESPONSE_KEYS[role];
        const userData = {
          ...(response.data[responseKey] as Record<string, unknown>),
          token: response.data.token,
        };
        dispatch(login(userData as User));
        toast.success(response.data.message);
        navigate(DASHBOARD_ROUTES[role]);
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message ?? 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, handleChange, handleSubmit, isLoading };
};

// ─── useSignup ────────────────────────────────────────────────────────────────

const SIGNUP_INITIAL_STATE: RegisterPatientPayload = {
  fullName: '',
  dob: '',
  gender: '',
  phoneNo: '',
  email: '',
  address: '',
  emergencyNo: '',
  password: '',
  agreeTerms: false,
};

export const useSignup = () => {
  const [formData, setFormData] = useState<RegisterPatientPayload>(SIGNUP_INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // Enforce numeric-only and max 11 digits for phone fields
    if (name === 'phoneNo' || name === 'emergencyNo') {
      const numeric = value.replace(/\D/g, '');
      if (numeric.length > 11) return;
      setFormData((prev) => ({ ...prev, [name]: numeric }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await registerPatientApi(formData);
      if (response.data.success) {
        const userData: User = {
          ...response.data.patient,
          role: 'patient',
          token: response.data.token ?? null,
        };
        dispatch(login(userData));
        toast.success('Account created successfully!');
        navigate('/patient/dashboard');
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, handleChange, handleSubmit, isLoading };
};

// ─── useLogout ────────────────────────────────────────────────────────────────

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return { handleLogout };
};
