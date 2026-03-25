import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo / About */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-white">HMS</h1>
          <p className="text-gray-400">
            Smart Hospital Management System to streamline appointments, patient
            records, billing, and operations.
          </p>
          <div className="flex space-x-4 mt-2">
            <a href="#" className="hover:text-white transition">
              <FaFacebookF />
            </a>
            <a href="#" className="hover:text-white transition">
              <FaTwitter />
            </a>
            <a href="#" className="hover:text-white transition">
              <FaLinkedinIn />
            </a>
            <a href="#" className="hover:text-white transition">
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-white transition">
                Home
              </a>
            </li>
            <li>
              <a href="#appointments" className="hover:text-white transition">
                Appointments
              </a>
            </li>
            <li>
              <a href="#patients" className="hover:text-white transition">
                Patients
              </a>
            </li>
            <li>
              <a href="#doctors" className="hover:text-white transition">
                Doctors
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-white transition">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Contact</h3>
          <p>
            Email:{" "}
            <a
              href="mailto:support@hms.com"
              className="hover:text-white transition"
            >
              support@hms.com
            </a>
          </p>
          <p>
            Phone:{" "}
            <a href="tel:+1234567890" className="hover:text-white transition">
              +1 234 567 890
            </a>
          </p>
          <p className="mt-4 text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} HMS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
