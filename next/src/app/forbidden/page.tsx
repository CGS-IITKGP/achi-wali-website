"use client";

import React from "react";
import Footer from "../footer";
import Navbar from "../components/navbar";
import Link from "next/link";
import { Roboto } from "next/font/google";
import api from "../axiosApi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";

const paragraph_font = Roboto({
  subsets: ["latin"],
});

export default function ForbiddenPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const handleSignOut = async () => {
    const apiResponse = await api("POST", "/auth/sign-out");

    if (apiResponse.action === null) {
      toast.error("Server Error");
    } else if (apiResponse.action === false) {
      toast.error(apiResponse.message);
      console.log(apiResponse);
    } else {
      toast.success("Signed out");
      refreshUser();
      router.push("/auth/sign-in");
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-neutral-900 via-gray-950 to-black relative overflow-hidden">
      <div className="particles-container absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-pink-400 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}vw`,
              top: `${Math.random() * 100}vh`,
              animationDuration: `${Math.random() * 5 + 3}s`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse-pink"></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse-pink"
        style={{ animationDelay: "1s" }}
      ></div>

      <style jsx global>{`
        @keyframes pulse-pink {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.2;
          }
        }
        .animate-pulse-pink {
          animation: pulse-pink 8s infinite ease-in-out;
        }
      `}</style>

      <Navbar />

      <main className="flex flex-col items-center justify-center flex-grow p-4 relative z-10">
        <div className="w-full max-w-lg text-center">
          <div className="glass rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-lg border border-white/10 transition-all duration-500">
            <h1
              className={`text-7xl md:text-8xl font-bold font-mono bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-3`}
            >
              403
            </h1>
            <h2
              className={`text-2xl md:text-3xl font-semibold text-white mb-3 font-sans`}
            >
              Access Denied
            </h2>
            <p
              className={`text-base text-gray-400 mb-6 max-w-sm mx-auto font-sans`}
            >
              You do not have the necessary permissions to view this page.
              Please ask ADMIN to grant you access.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center py-2.5 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-105 group relative overflow-hidden font-sans text-sm"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <span className="relative z-10">Go to Home Page</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="mx-2 inline-flex items-center justify-center py-2.5 px-8 bg-gray-600 hover:bg-gradient-to-r from-red-500 to-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-red-500/40 transition-all duration-300 transform hover:scale-105 group relative overflow-hidden font-sans text-sm"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <span className={`relative z-10 ${paragraph_font.className}`}>
                Logout
              </span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
