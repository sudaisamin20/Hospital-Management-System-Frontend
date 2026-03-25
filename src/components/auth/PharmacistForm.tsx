import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../../features/auth/authSlice";
import toast from "react-hot-toast";

interface pharmacistData {
  id: string;
  id_no: string;
  fullName: string;
  email: string;
  phoneNo: string;
  role: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  pharmacist: pharmacistData;
  token: string;
}

interface propsType {
  role: string;
}

const PharmacistForm = (props: propsType) => {
  const [formData, setFormData] = useState({
    id_no: " ",
    email: "",
    password: "",
    role: props.role,
  });
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseurl: string = import.meta.env.VITE_BASE_URL;
      const response = await axios.post<ApiResponse>(
        `${baseurl}/api/pharmacist/auth/login`,
        formData,
      );
      console.log(response.data);
      if (response.data.success) {
        const userData = {
          ...response.data.pharmacist!,
          token: response.data.token,
        };
        dispatch(login(userData));
        toast.success(response.data.message);
        setTimeout(() => {
          navigate("/pharmacist/dashboard");
        }, 1000);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during pharmacist login:", error.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Unexpected error during pharmacist login:", error);
      }
    }
  };
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-blue-600">
        Pharmacist Login
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          name="id_no"
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Pharmacist ID"
          onChange={handleChange}
        />
        <input
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />
        <input
          className="w-full px-4 py-2 border border-gray-300 rounded mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <button
          type="submit"
          className="btn-primary mt-4 w-full cursor-pointer"
        >
          Login
        </button>

        <p className="text-xs text-gray-500 mt-3 text-center">
          Account created by hospital admin
        </p>
      </form>
    </div>
  );
};

export default PharmacistForm;
