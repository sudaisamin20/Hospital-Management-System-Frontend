import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../../features/auth/authSlice";

interface receptionistData {
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
  patient: receptionistData;
  token: string;
}
const ReceptionistForm = () => {
  const [formData, setFormData] = useState({
    id_no: " ",
    email: "",
    password: "",
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
        `${baseurl}/api/receptionist/auth/login`,
        formData,
      );
      console.log(response.data);
      if (response.data.success) {
        const receptionistData = {
          ...response.data.receptionist!,
          token: response.data.token,
        };
        dispatch(login(receptionistData));
        toast.success(response.data.message);
        setTimeout(() => {
          navigate("/receptionist/dashboard");
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
        Receptionist Login
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          name="id_no"
          type="text"
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Staff ID"
        />
        <input
          name="email"
          type="email"
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mt-3"
          placeholder="Email"
        />
        <input
          name="password"
          type="password"
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mt-3"
          placeholder="Password"
        />

        <button
          type="submit"
          className="btn-primary mt-4 w-full cursor-pointer"
        >
          Login
        </button>

        <p className="text-xs text-gray-500 mt-3 text-center">
          Access provided by admin only
        </p>
      </form>
    </div>
  );
};

export default ReceptionistForm;
