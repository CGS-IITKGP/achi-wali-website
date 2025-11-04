"use client";

import { useState, useEffect } from "react";
import { Righteous, Roboto } from "next/font/google";
import Link from "next/link";
import Navbar from "../../components/navbar";
import api from "@/app/axiosApi";
import toast from "react-hot-toast";
import OTPInputComponent from "@/app/components/OTPInput";
import { useRouter } from "next/navigation";
import ResendOTPTimerComponent from "@/app/components/ResendOTPTimerComponent";

const heading_font = Righteous({
  subsets: ["latin"],
  weight: "400",
});

const paragraph_font = Roboto({
  subsets: ["latin"],
});

export default function Register() {
  const [state, setState] = useState<"REQUEST" | "OTP_VERIFY">("REQUEST");

  const [isButtonEngaged, setIsButtonEngaged] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [otp, setOtp] = useState<string>("");

  const router = useRouter();

  // Floating particles animation
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement("div");
      particle.className = "particle absolute opacity-30";
      particle.style.left = Math.random() * 100 + "vw";
      particle.style.animationDuration = Math.random() * 3 + 2 + "s";
      particle.style.animationDelay = Math.random() * 2 + "s";
      document.querySelector(".particles-container")?.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 5000);
    };

    const interval = setInterval(createParticle, 500);
    return () => clearInterval(interval);
  }, []);

  // Password strength calculator
  useEffect(() => {
    const calculateStrength = (password: string) => {
      let strength = 0;
      if (password.length >= 8) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[a-z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;
      return strength;
    };

    setPasswordStrength(calculateStrength(formData.password));
  }, [formData.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords don't match";

    if (!agreeToTerms)
      newErrors.terms = "You must agree to the terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUpRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsButtonEngaged(true);

    const apiResponse = await api("POST", "/auth/sign-up", {
      body: {
        target: "request",
        name: formData.firstName.trim() + " " + formData.lastName.trim(),
        email: formData.email,
        password: formData.password,
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      setState("OTP_VERIFY");
      setOtp("");
      setIsButtonEngaged(false);
    }

    setIsButtonEngaged(false);
  };

  const handleSignUpResendOTP = async () => {
    const apiResponse = await api("POST", "/auth/sign-up", {
      body: {
        target: "resend_otp",
        email: formData.email,
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      toast.success("Resent OTP");
    }
  };

  const handleSignUpVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.trim().length !== 6) return;

    setIsButtonEngaged(true);

    const apiResponse = await api("POST", "/auth/sign-up", {
      body: {
        target: "verify",
        email: formData.email,
        otp,
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      toast.success("Account created.");
      router.push("/auth/sign-in");
    }

    setIsButtonEngaged(false);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-500";
      case 5:
        return "bg-emerald-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      case 5:
        return "Very Strong";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-neutral-900 via-gray-950 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="particles-container absolute inset-0 overflow-hidden pointer-events-none"></div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen pt-20 lg:pt-35 px-4 pb-8">
        <div className="w-full max-w-lg relative">
          {/* Register Card */}
          <div className="glass rounded-3xl p-8 shadow-2xl relative overflow-hidden group transition-all duration-500">
            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-black/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl"></div>

            {/* Card Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                {/* User Icon with Animation */}
                {/* <div className="mx-auto w-20 h-20 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse-pink">
                  <svg
                    className="w-10 h-10 text-pink-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </div> */}

                <h1
                  className={`text-4xl md:text-5xl ${heading_font.className} bg-gradient-to-r from-white via-pink-200 to-pink-400 bg-clip-text text-transparent mb-4 animate-gradient`}
                >
                  Sign up
                </h1>
                <p
                  className={`text-gray-400 ${paragraph_font.className} text-lg`}
                >
                  {state === "REQUEST"
                    ? "Create your account and start your journey"
                    : "Verify your email"}
                </p>
              </div>

              {/* State based forms */}
              {state === "REQUEST" ? (
                <form onSubmit={handleSignUpRequest} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* First Name */}
                    <div className="group">
                      <label
                        className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                      >
                        First Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 group-hover:bg-white/10 ${
                            errors.firstName
                              ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                              : "border-white/10 focus:border-pink-400 focus:ring-pink-400/20"
                          }`}
                          placeholder="John"
                          required
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-400/0 via-pink-400/5 to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                      {errors.firstName && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="group">
                      <label
                        className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                      >
                        Last Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 group-hover:bg-white/10 ${
                            errors.lastName
                              ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                              : "border-white/10 focus:border-pink-400 focus:ring-pink-400/20"
                          }`}
                          placeholder="Doe"
                          required
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-400/0 via-pink-400/5 to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                      {errors.lastName && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="group">
                    <label
                      className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400 group-hover:text-pink-400 transition-colors duration-200"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 group-hover:bg-white/10 ${
                          errors.email
                            ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                            : "border-white/10 focus:border-pink-400 focus:ring-pink-400/20"
                        }`}
                        placeholder="john.doe@example.com"
                        required
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-400/0 via-pink-400/5 to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="group">
                    <label
                      className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 pr-12 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 group-hover:bg-white/10 ${
                          errors.password
                            ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                            : "border-white/10 focus:border-pink-400 focus:ring-pink-400/20"
                        }`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-400 transition-colors duration-200"
                      >
                        {showPassword ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-400/0 via-pink-400/5 to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs text-gray-400 ${paragraph_font.className}`}
                          >
                            Password Strength
                          </span>
                          <span
                            className={`text-xs ${getPasswordStrengthColor().replace(
                              "bg-",
                              "text-"
                            )} font-semibold`}
                          >
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{
                              width: `${(passwordStrength / 5) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                    {errors.password && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="group">
                    <label
                      className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 pr-12 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 group-hover:bg-white/10 ${
                          errors.confirmPassword
                            ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                            : formData.confirmPassword &&
                              formData.password === formData.confirmPassword
                            ? "border-green-400 focus:border-green-400 focus:ring-green-400/20"
                            : "border-white/10 focus:border-pink-400 focus:ring-pink-400/20"
                        }`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-400 transition-colors duration-200"
                      >
                        {showConfirmPassword ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>

                      {/* Match Indicator */}
                      {formData.confirmPassword && (
                        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                          {formData.password === formData.confirmPassword ? (
                            <svg
                              className="w-5 h-5 text-green-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5 text-red-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                          )}
                        </div>
                      )}

                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-400/0 via-pink-400/5 to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Terms Agreement */}
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        onClick={() => setAgreeToTerms(!agreeToTerms)}
                        className={`w-5 h-5 rounded border-2 transition-all duration-200 cursor-pointer ${
                          agreeToTerms
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 border-pink-500"
                            : errors.terms
                            ? "border-red-400 hover:border-red-300"
                            : "border-white/20 hover:border-pink-400"
                        }`}
                      >
                        {agreeToTerms && (
                          <svg
                            className="w-3 h-3 text-white absolute top-0.5 left-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div
                      className={`text-sm text-gray-300 ${paragraph_font.className} leading-relaxed`}
                    >
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-pink-400 hover:text-pink-300 transition-colors duration-200 underline"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-pink-400 hover:text-pink-300 transition-colors duration-200 underline"
                      >
                        Privacy Policy
                      </Link>
                    </div>
                  </div>
                  {errors.terms && (
                    <p className="text-red-400 text-sm">{errors.terms}</p>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isButtonEngaged}
                    className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 cursor-pointer text-white font-semibold rounded-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
                  >
                    {/* Button Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                    <span className="relative z-10 flex items-center justify-center">
                      {isButtonEngaged ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                          </svg>
                          Create Account
                        </>
                      )}
                    </span>
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={handleSignUpVerify}
                  className="space-y-6 max-w-md w-full mx-auto"
                >
                  <div className="group">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Enter the 6-digit OTP sent to your email
                    </label>
                    <OTPInputComponent
                      length={6}
                      onComplete={(pin) => setOtp(pin)}
                    />
                  </div>

                  <ResendOTPTimerComponent
                    initialTime={60}
                    onResend={handleSignUpResendOTP}
                  />

                  <button
                    type="submit"
                    disabled={isButtonEngaged}
                    className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 cursor-pointer text-white font-semibold rounded-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
                  >
                    {/* Button Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                    <span className="relative z-10 flex items-center justify-center">
                      {isButtonEngaged ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                          </svg>
                          Verify
                        </>
                      )}
                    </span>
                  </button>
                </form>
              )}

              {/* Login Link */}
              <div className="text-center mt-8">
                <p className={`text-gray-400 ${paragraph_font.className}`}>
                  Already have an account?{" "}
                  <Link
                    href="/auth/sign-in"
                    className="text-pink-400 hover:text-pink-300 transition-colors duration-200 font-semibold hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
