import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../../features/auth/authSlice";
import axios from "axios";
import { useState } from "react";

interface superAdminData {
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
  patient: superAdminData;
  token: string;
}

interface propsType {
  role: string;
}

const SuperAdminForm = (props: propsType) => {
  const [formData, setFormData] = useState({
    id_no: " ",
    email: "",
    password: "",
    role: props.role,
  });
  console.log(formData);
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

  console.log("formdata: ", formData);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("inside submit function");
    try {
      const baseurl: string = import.meta.env.VITE_BASE_URL;
      const response = await axios.post<ApiResponse>(
        `${baseurl}/api/superadmin/auth/login`,
        formData,
      );
      console.log(response.data);
      if (response.data.success) {
        const superAdminData = {
          ...response.data.superAdmin!,
          token: response.data.token,
        };
        dispatch(login(superAdminData));
        toast.success(response.data.message);
        setTimeout(() => {
          navigate("/superadmin/dashboard");
        }, 1000);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during patient registration:", error.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Unexpected error during patient registration:", error);
      }
    }
  };
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-blue-600">
        Super Admin Login
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          name="id_no"
          type="text"
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Super Admin ID"
        />
        <input
          name="email"
          type="email"
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"
        />
        <input
          name="password"
          type="password"
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Password"
        />

        <button className="btn-primary mt-4 w-full cursor-pointer">
          Login
        </button>

        <p className="text-xs text-gray-500 mt-3 text-center">
          Account created by Developers
        </p>
      </form>
    </div>
  );
};

export default SuperAdminForm;
