"use client";

import { useState, useEffect } from "react";
import { Righteous, Roboto } from "next/font/google";
import Link from "next/link";
import Navbar from "../components/navbar";

const heading_font = Righteous({
  subsets: ["latin"],
  weight: "400",
});

const paragraph_font = Roboto({
  subsets: ["latin"],
});

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

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

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsLoading(false);
    setIsEmailSent(true);
    setCountdown(60);
    console.log("Password reset requested for:", email);
  };

  const handleResendEmail = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setCountdown(60);
    console.log("Password reset email resent to:", email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-neutral-900 via-gray-950 to-black relative overflow-hidden">
      <div className="particles-container absolute inset-0 overflow-hidden pointer-events-none"></div>

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
          {/* Forgot Password Card */}
          <div className="glass rounded-3xl p-8 shadow-2xl relative overflow-hidden group transition-all duration-500">
            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-black/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl"></div>

            {/* Card Content */}
            <div className="relative z-10">
              {!isEmailSent ? (
                <>
                  {/* Header */}
                  <div className="text-center mb-8">
                    {/* Lock Icon with Animation */}
                    <div className="mx-auto w-20 h-20 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse-pink">
                      <svg
                        className="w-10 h-10 text-pink-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                      </svg>
                    </div>

                    <h1
                      className={`text-4xl md:text-5xl ${heading_font.className} bg-gradient-to-r from-white via-pink-200 to-pink-400 bg-clip-text text-transparent mb-4 animate-gradient`}
                    >
                      Forgot Password?
                    </h1>
                    <p
                      className={`text-gray-400 ${paragraph_font.className} text-lg`}
                    >
                      Don&apos;t worry, we&apos;ll send you reset instructions.
                    </p>
                  </div>

                  {/* Reset Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
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
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 group-hover:bg-white/10"
                          placeholder="Enter your email address"
                          required
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-400/0 via-pink-400/5 to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 cursor-pointer text-white font-semibold rounded-xl transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-105 relative overflow-hidden group"
                    >
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
                            Sending Reset Link...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                            Send Reset Link
                          </>
                        )}
                      </span>
                    </button>
                  </form>
                </>
              ) : (
                <>
                  {/* Success State */}
                  <div className="text-center">
                    {/* Success Icon with Animation */}
                    <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse-pink">
                      <svg
                        className="w-10 h-10 text-green-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>

                    <h1
                      className={`text-4xl md:text-5xl ${heading_font.className} bg-gradient-to-r from-white via-green-200 to-green-400 bg-clip-text text-transparent mb-4 animate-gradient`}
                    >
                      Check Your Email
                    </h1>
                    <p
                      className={`text-gray-400 ${paragraph_font.className} text-lg mb-6`}
                    >
                      We&apos;ve sent a password reset link to
                    </p>
                    <p
                      className={`text-pink-400 ${paragraph_font.className} text-lg font-semibold mb-8 break-all`}
                    >
                      {email}
                    </p>

                    {/* Resend Button */}
                    <button
                      onClick={handleResendEmail}
                      disabled={countdown > 0 || isLoading}
                      className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group ${
                        countdown > 0
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-pink-400 hover:text-pink-400"
                      }`}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {isLoading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5"
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
                            Sending...
                          </>
                        ) : countdown > 0 ? (
                          `Resend in ${countdown}s`
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                            </svg>
                            Resend Email
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </>
              )}

              {/* Back to Login Link */}
              <div className="text-center mt-8">
                <Link
                  href="/login"
                  className={`inline-flex items-center text-gray-400 hover:text-pink-400 transition-colors duration-200 ${paragraph_font.className} group`}
                >
                  <svg
                    className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                  </svg>
                  Back to Login
                </Link>
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
