import {
  FaUserInjured,
  FaCalendarCheck,
  FaFileInvoiceDollar,
  FaUserShield,
  FaCheckCircle,
} from "react-icons/fa";
import { GiFootprint } from "react-icons/gi";
import image from "../assets/home-hero-image.jpg";
import type { JSX } from "react";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

interface Feature {
  icon: JSX.Element;
  title: string;
  description: string;
}

interface WorkflowStep {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <FaUserInjured className="text-blue-600 text-5xl mb-4" />,
    title: "Patient Management",
    description:
      "Track patient records, medical history, and health information securely.",
  },
  {
    icon: <FaCalendarCheck className="text-blue-600 text-5xl mb-4" />,
    title: "Appointment Scheduling",
    description:
      "Easy booking and management of appointments for patients and doctors.",
  },
  {
    icon: <FaFileInvoiceDollar className="text-blue-600 text-5xl mb-4" />,
    title: "Billing & Payments",
    description:
      "Generate invoices, track payments, and manage hospital billing efficiently.",
  },
  {
    icon: <FaUserShield className="text-blue-600 text-5xl mb-4" />,
    title: "Role-Based Access",
    description:
      "Secure login for Admin, Doctor, Receptionist, and Patient with controlled access.",
  },
];

const workflow: WorkflowStep[] = [
  {
    icon: <GiFootprint className="text-green-600 text-4xl mb-2" />,
    title: "Patient Registration",
    description: "Patients register and create a secure account in the system.",
  },
  {
    icon: <FaCalendarCheck className="text-green-600 text-4xl mb-2" />,
    title: "Book Appointment",
    description: "Patients book appointments with available doctors.",
  },
  {
    icon: <FaCheckCircle className="text-green-600 text-4xl mb-2" />,
    title: "Doctor Approval",
    description: "Doctors approve, reject, or reschedule appointments.",
  },
  {
    icon: <FaFileInvoiceDollar className="text-green-600 text-4xl mb-2" />,
    title: "Receive Treatment & Billing",
    description: "Patients receive treatment and generate bills efficiently.",
  },
];

const Home = () => {
  return (
    <>
      <Navbar />
      <div className="pt-16">
        <div
          style={{ backgroundImage: `url(${image})` }}
          className="bg-no-repeat bg-center bg-cover w-full min-h-screen relative"
        >
          <div className="absolute inset-0 bg-black/50 opacity-95 z-0"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between min-h-screen px-4 md:px-16 text-white">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold">
                Smart Hospital Management for Efficient Care
              </h1>
              <p className="text-lg md:text-xl text-gray-200">
                Manage appointments, patient records, and hospital
                operations—all in one secure platform.
              </p>
              <div className="flex space-x-4">
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition duration-300 cursor-pointer"
                >
                  Get Started
                </Link>
                <Link
                  to="/learn-more"
                  className="bg-transparent border border-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition duration-300 cursor-pointer"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-10">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition duration-300"
                >
                  {feature.icon}
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works / Workflow Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {workflow.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300"
                >
                  {step.icon}
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call To Action Section */}
        <section className="py-20 bg-blue-600 text-white text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to streamline your hospital operations?
          </h2>
          <p className="mb-6 text-lg md:text-xl">
            Get started today and manage your hospital efficiently and securely.
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition duration-300">
            Get Started
          </button>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default Home;
