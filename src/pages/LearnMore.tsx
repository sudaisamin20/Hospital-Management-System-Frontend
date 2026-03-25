import React from "react";
import {
  ShieldCheck,
  Users,
  CalendarCheck,
  Stethoscope,
  ClipboardList,
} from "lucide-react";
import Navbar from "../components/Navbar";

const LearnMore = () => {
  return (
    <>
      <Navbar />
      <div className="w-full">
        {/* HERO SECTION */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 pt-4">
              Smart Hospital Management System
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
              A modern role-based platform to manage appointments, doctors,
              receptionists, and patients efficiently — all in one place.
            </p>
          </div>
        </section>

        {/* WHAT IS THIS SYSTEM */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">
              What Is This System?
            </h2>

            <p className="text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
              This Hospital Management System is designed to simplify hospital
              operations by providing a secure, role-based platform where
              patients, doctors, and receptionists can work seamlessly.
              Everything — from appointment booking to approval and patient
              management — is digitized and optimized.
            </p>
          </div>
        </section>

        {/* ROLES SECTION */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              User Roles & Responsibilities
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* PATIENT */}
              <div className="bg-white rounded-xl shadow p-6 text-center">
                <Users className="w-10 h-10 mx-auto text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Patient</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Create account & login</li>
                  <li>• Book appointments</li>
                  <li>• View appointment status</li>
                  <li>• Access medical history</li>
                </ul>
              </div>

              {/* DOCTOR */}
              <div className="bg-white rounded-xl shadow p-6 text-center">
                <Stethoscope className="w-10 h-10 mx-auto text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Doctor</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• View assigned appointments</li>
                  <li>• Approve or reject appointments</li>
                  <li>• Manage patient records</li>
                  <li>• Update consultation status</li>
                </ul>
              </div>

              {/* RECEPTIONIST */}
              <div className="bg-white rounded-xl shadow p-6 text-center">
                <ClipboardList className="w-10 h-10 mx-auto text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Receptionist</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Manage hospital appointments</li>
                  <li>• Assign doctors</li>
                  <li>• View daily schedules</li>
                  <li>• Assist patients</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Key Features
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <Feature
                icon={<CalendarCheck />}
                title="Appointment Management"
                text="Book, approve, reschedule, and track appointments in real time."
              />
              <Feature
                icon={<ShieldCheck />}
                title="Role-Based Access"
                text="Secure authentication and authorization for every role."
              />
              <Feature
                icon={<Users />}
                title="Centralized Records"
                text="All patient and doctor data managed in one secure system."
              />
              <Feature
                icon={<ClipboardList />}
                title="Admin Controlled System"
                text="Doctors and receptionists are created and managed by Super Admin."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-blue-700 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="mb-8 opacity-90">
            Experience a smarter way to manage hospital operations.
          </p>
          <button className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition">
            Get Started
          </button>
        </section>
      </div>
    </>
  );
};

const Feature = ({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) => (
  <div className="bg-white rounded-xl shadow p-6 flex gap-4 items-start">
    <div className="text-blue-600">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-gray-600">{text}</p>
    </div>
  </div>
);

export default LearnMore;
