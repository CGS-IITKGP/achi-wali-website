"use client";

import { useState, useEffect } from "react";
import { Righteous, Roboto } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/navbar";
import { useAuth } from "@/app/context/authContext";
import api from "@/app/axiosApi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const heading_font = Righteous({
  subsets: ["latin"],
  weight: "400",
});

const paragraph_font = Roboto({
  subsets: ["latin"],
});

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { refreshUser } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const apiResponse = await api("POST", "/auth/sign-in", {
      body: {
        email,
        password,
      },
    });

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.statusCode + ": " + apiResponse.message);
    } else {
      toast.success("Signed in successfully!");
      refreshUser();
      router.push("/dashboard");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-neutral-900 via-gray-950 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="particles-container absolute inset-0 overflow-hidden pointer-events-none"></div>

      {/* Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse-pink"></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse-pink"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-black/20 rounded-full blur-3xl animate-pulse-pink"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen pt-20 px-4">
        <div className="w-full max-w-md relative">
          {/* Glowing Circle Asset */}
          {/* <div className="absolute -top-20 -right-20 opacity-30 animate-float">
            <Image
              src={GlowingCircle}
              alt="Glowing Circle"
              width={200}
              height={200}
              className="animate-spin-slow"
            />
          </div> */}

          {/* Login Card */}
          <div className="glass rounded-3xl p-8 shadow-2xl relative overflow-hidden group transition-all duration-500">
            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-black/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl"></div>

            {/* Card Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <h1
                  className={`text-4xl md:text-5xl ${heading_font.className} bg-gradient-to-r from-white via-pink-200 to-pink-400 bg-clip-text text-transparent mb-4 animate-gradient`}
                >
                  Welcome Back
                </h1>
                <p
                  className={`text-gray-400 ${paragraph_font.className} text-lg`}
                >
                  Sign in to your CGS account
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="group">
                  <label
                    className={`block text-gray-300 text-sm font-medium mb-2 ${paragraph_font.className}`}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 group-hover:bg-white/10"
                      placeholder="your.email@example.com"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-400/0 via-pink-400/5 to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 group-hover:bg-white/10"
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
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 border-white/20 transition-all duration-200 ${
                          rememberMe
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 border-pink-500"
                            : "group-hover:border-pink-400"
                        }`}
                      >
                        {rememberMe && (
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
                    <span
                      className={`text-gray-300 text-sm ${paragraph_font.className} group-hover:text-pink-400 transition-colors duration-200`}
                    >
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className={`text-sm text-pink-400 hover:text-pink-300 transition-colors duration-200 ${paragraph_font.className} hover:underline`}
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 cursor-pointer text-white font-semibold rounded-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
                >
                  {/* Button Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
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
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </span>
                </button>
              </form>

              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-white/10"></div>
                <span
                  className={`flex-shrink mx-4 text-gray-500 text-sm ${paragraph_font.className}`}
                >
                  OR
                </span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <Link
                href="/api/auth/google"
                className="w-full py-3 px-6 border border-white/20 text-white font-semibold rounded-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group flex items-center justify-center space-x-3 bg-white/5 hover:bg-white/10"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-400/0 via-pink-400/5 to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <Image
                  src="/icons/google_logo.svg"
                  alt="Google Icon"
                  width={24}
                  height={24}
                />
                <span className={`relative z-10 ${paragraph_font.className}`}>
                  Sign in with Google
                </span>
              </Link>

              {/* Sign Up Link */}
              <div className="text-center mt-8">
                <p className={`text-gray-400 ${paragraph_font.className}`}>
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/sign-up"
                    className="text-pink-400 hover:text-pink-300 transition-colors duration-200 font-semibold hover:underline"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Additional Decorative Elements */}
          <div
            className="absolute -bottom-10 -left-10 w-20 h-20 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse-pink"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute -top-5 -left-5 w-16 h-16 bg-gradient-to-r from-black/20 to-pink-500/20 rounded-full blur-lg animate-pulse-pink"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
