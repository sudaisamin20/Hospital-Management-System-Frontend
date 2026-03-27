import signupBg from "../assets/signup-page-bg.jpg";
import { FaLock } from "react-icons/fa";
import { Calendar, CheckCircle, Clock, FileText } from "lucide-react";
import Navbar from "../components/Navbar";
import { useSignup } from "../features/auth/auth.hooks";

const Signup = () => {
  const { formData, handleChange, handleSubmit, isLoading } = useSignup();

  return (
    <>
      <Navbar />
      <div className="min-h-screen relative overflow-hidden">
        <div
          style={{ backgroundImage: `url(${signupBg})` }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        ></div>

        <div className="absolute inset-0 bg-black/50 opacity-90"></div>

        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-8 items-center px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="hidden lg:flex flex-col justify-center space-y-8 text-white max-w-2xl mt-10 mb-4">
            <div className="space-y-2">
              <div className="inline-block">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/20">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-semibold">
                    Join 10,000+ Patients
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-xl font-bold leading-tight">
                  Start Your
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-purple-200">
                    Healthcare Journey
                  </span>
                </h1>

                <p className="text-sm text-blue-100 leading-relaxed max-w-xl">
                  Register now to access world-class healthcare services, book
                  appointments, and manage your medical records all in one
                  place.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    icon: <Clock className="w-5 h-5" />,
                    title: "Quick Registration",
                    desc: "Simple 2-minute signup process",
                  },
                  {
                    icon: <Calendar className="w-5 h-5" />,
                    title: "Easy Appointments",
                    desc: "Book with top doctors instantly",
                  },
                  {
                    icon: <FileText className="w-5 h-5" />,
                    title: "Digital Records",
                    desc: "Access your health history anytime",
                  },
                  {
                    icon: <FaLock className="w-5 h-5" />,
                    title: "Secure & Private",
                    desc: "Your data is encrypted and protected",
                  },
                ].map((benefit, idx) => (
                  <div
                    key={idx}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 hover:bg-white/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-blue-200 group-hover:scale-110 transition-transform">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-600 text-md">
                          {benefit.title}
                        </h3>
                        <p className="text-sm text-blue-100">{benefit.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-8 pt-3 border-t border-white/20">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">50K+</div>
                  <div className="text-xs text-blue-200">Active Patients</div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">500+</div>
                  <div className="text-xs text-blue-200">Expert Doctors</div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">4.9★</div>
                  <div className="text-xs text-blue-200">Patient Rating</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center max-w-xl mx-auto lg:mx-0 lg:ml-auto w-full mt-20 mb-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl px-6 py-4 border border-white/20">
              <div className="mb-1">
                <h2 className="text-xl font-bold text-blue-600">
                  Create Your Account
                </h2>
                <p className="text-gray-600 text-sm">
                  Join thousands of patients managing their health better
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="input pl-11"
                      placeholder="Sudais Amin"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="input"
                      required
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phoneNo"
                        value={formData.phoneNo}
                        onChange={handleChange}
                        className="input pl-11 placeholder:italic"
                        placeholder="03XXXXXXXXX"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input pl-11 placeholder:italic"
                        placeholder="example@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      className="input resize-none placeholder:italic"
                      placeholder="Street address, City, State, ZIP"
                    ></input>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Emergency Contact Number
                    </label>
                    <input
                      type="tel"
                      name="emergencyNo"
                      value={formData.emergencyNo}
                      onChange={handleChange}
                      className="input placeholder:italic"
                      placeholder="03XXXXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input pl-11 pr-12"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-1"
                    required
                  />
                  <label className="text-sm text-gray-600">
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-2">
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <a
                      href="/login"
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Sign in here
                    </a>
                  </p>
                </div>
              </form>
            </div>

            <div className="lg:hidden flex justify-center gap-6 mt-6 text-white">
              <div className="text-center">
                <div className="text-xl font-bold">50K+</div>
                <div className="text-xs text-blue-200">Patients</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">500+</div>
                <div className="text-xs text-blue-200">Doctors</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">4.9★</div>
                <div className="text-xs text-blue-200">Rating</div>
              </div>
            </div>
            <p className="text-center text-white/90 text-sm mt-2 drop-shadow-lg">
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

export default Signup;
