import React, { useState } from "react";
import RoleSelector from "../components/auth/RoleSelector";
import PatientForm from "../components/auth/PatientForm";
import DoctorForm from "../components/auth/DoctorForm";
import ReceptionistForm from "../components/auth/ReceptionistForm";
import backgroundImage from "../assets/login-page-bg.jpg";
import Navbar from "../components/Navbar";
import PharmacistForm from "../components/auth/PharmacistForm";
import LabAssistantForm from "../components/auth/LabAssistantForm";
import SuperAdminForm from "../components/auth/SuperAdminForm";
import { Lock } from "lucide-react";
import { BsLightning } from "react-icons/bs";
import { RiAdminLine } from "react-icons/ri";
import { IoAnalytics } from "react-icons/io5";

type Role =
  | "superadmin"
  | "patient"
  | "doctor"
  | "receptionist"
  | "labAssistant"
  | "pharmacist";

const Login = () => {
  const [role, setRole] = useState<Role>("patient");

  return (
    <>
      <Navbar />
      <div className="min-h-screen relative overflow-hidden">
        <div
          style={{ backgroundImage: `url(${backgroundImage})` }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        ></div>

        <div className="absolute inset-0 bg-black/50 opacity-90"></div>

        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-8 items-center px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="hidden lg:flex flex-col justify-center space-y-8 text-white max-w-2xl">
            <div className="bg-blue-600 rounded-3xl py-8 p-12 mt-16 shadow-2xl">
              <div className="space-y-3">
                <div className="inline-block">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">
                      Trusted by 500+ Healthcare Facilities
                    </span>
                  </div>
                </div>

                <h1 className="text-2xl font-bold leading-tight">
                  Smart Hospital
                  <span className="block">Management System</span>
                </h1>

                <p className="text-md text-blue-100 leading-relaxed">
                  Manage patients, doctors, appointments, and billing — all in
                  one secure platform with real-time updates.
                </p>

                <ul className="space-y-2 text-blue-50">
                  {[
                    {
                      icon: <Lock className="h-5 w-5" />,
                      text: "Secure Role-Based Access Control",
                    },
                    {
                      icon: <BsLightning className="h-5 w-5" />,
                      text: "Faster Patient Handling & Processing",
                    },
                    {
                      icon: <RiAdminLine className="h-5 w-5" />,
                      text: "Centralized Admin Control System",
                    },
                    {
                      icon: <IoAnalytics className="h-5 w-5" />,
                      text: "Real-Time Medical Records & Analytics",
                    },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 group">
                      <span className="text-lg group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      <span className="text-md font-medium">{item.text}</span>
                    </li>
                  ))}
                </ul>

                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">99.9%</div>
                    <div className="text-sm text-blue-200 mt-1">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">24/7</div>
                    <div className="text-sm text-blue-200 mt-1">Support</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">HIPAA</div>
                    <div className="text-sm text-blue-200 mt-1">Compliant</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center max-w-md mx-auto lg:mx-0 lg:ml-auto w-full mt-20 shadow-lg">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl px-8 py-6 border border-white/20">
              <div className="mb-4 text-center lg:text-left">
                <h2 className="text-2xl font-bold text-blue-600 mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-600">
                  Select your role to continue to dashboard
                </p>
              </div>

              <RoleSelector role={role} setRole={setRole} />

              <div className="">
                {role === "superadmin" && <SuperAdminForm role={role} />}
                {role === "patient" && <PatientForm role={role} />}
                {role === "doctor" && <DoctorForm role={role} />}
                {role === "receptionist" && <ReceptionistForm role={role} />}
                {role === "pharmacist" && <PharmacistForm role={role} />}
                {role === "labAssistant" && <LabAssistantForm role={role} />}
              </div>
            </div>

            <p className="text-center text-white/90 text-sm mt-3 drop-shadow-lg">
              © 2024 Smart Hospital Management. All rights reserved.
            </p>
          </div>
        </div>

        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>
    </>
  );
};

export default Login;
