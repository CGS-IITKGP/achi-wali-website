"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/authContext";
import { useRouter } from "next/navigation";
import Navbar from "../components/navbar";
import Footer from "../footer";
import api from "../axiosApi";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isLinked, setIsLinked] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Require authentication
  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast.error("Authentication required.");
      router.push("/auth/sign-in");
    }
  }, [user, isAuthLoading, router]);

  // Initial Load (GET)
  useEffect(() => {
    const fetchGameProfile = async () => {
      if (!user) return;
      setIsLoading(true);

      const apiResponse = await api("GET", "/game/profile");

      if (apiResponse.action === true) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = apiResponse.data as any;
        setIsLinked(data.linked);
        if (data.linked && data.username) {
          setUsername(data.username);
        }
      } else if (apiResponse.action === false) {
        toast.error(apiResponse.message);
      } else {
        toast.error("Something went wrong loading your game profile.");
      }

      setIsLoading(false);
    };

    fetchGameProfile();
  }, [user]);

  // Submission (POST)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError(null);

    if (!username.trim() || !password) {
      toast.error("Both username and password are required.");
      return;
    }

    setIsSubmitting(true);

    const apiResponse = await api("POST", "/game/profile", {
      body: { username: username.trim(), password },
    });

    if (apiResponse.action === true) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseMessage = (apiResponse.data as any)?.message;
      toast.success(responseMessage || (isLinked ? "Game profile updated successfully." : "Game profile created successfully."));
      setIsLinked(true);
      setPassword(""); // Clear password field for security
    } else if (apiResponse.action === false) {
      let hasInlineError = false;

      // Handle Zod validation errors targeting the username field
      if (apiResponse.errors && Array.isArray(apiResponse.errors)) {
        const userErr = apiResponse.errors.find((err: string) => err.startsWith("username$"));
        if (userErr) {
          setUsernameError(userErr.split("$")[1].trim());
          hasInlineError = true;
        }
      }

      // Handle 409 Conflict logic (username taken)
      if (!hasInlineError && (apiResponse.message === "That username is already taken." || apiResponse.message.toLowerCase().includes("taken"))) {
        setUsernameError(apiResponse.message);
        hasInlineError = true;
      }

      // Fallback for other errors
      if (!hasInlineError) {
        toast.error(apiResponse.message);
      }
    } else {
      // Action: null (Server error)
      toast.error("Something went wrong, please try again.");
    }

    setIsSubmitting(false);
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  // Prevent rendering if unauthenticated (handled by useEffect redirect)
  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-foreground">
      <Navbar />

      {/* Background styling matching the aesthetic */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,hsl(320_60%_20%_/_0.2),transparent_70%)] pointer-events-none" />

      <main className="relative pt-32 pb-16 px-4 sm:px-6 z-10 min-h-[calc(100vh-100px)] flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent mb-4">
              Game Credentials
            </h1>
            <p className="text-gray-400 text-lg">
              {isLinked ? "Update your game profile" : "Set up your game profile"}
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gray-900/50 border border-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.15)] backdrop-blur-xl">
            <div className="mb-6 p-4 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-300 text-sm leading-relaxed">
              Create a unique username and password specifically for logging into games.
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (usernameError) setUsernameError(null);
                  }}
                  className={`w-full bg-black/50 border rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 transition-all ${usernameError
                      ? "border-red-500/50 focus:ring-red-500/50"
                      : "border-gray-700 focus:border-pink-500/50 focus:ring-pink-500/20"
                    }`}
                  placeholder="Enter a unique game username"
                  maxLength={255}
                  required
                />
                {usernameError && (
                  <p className="mt-2 text-sm text-red-400 font-medium">
                    {usernameError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Game Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  placeholder="Enter a new password for games"
                  maxLength={255}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-lg shadow-pink-500/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  isLinked ? "Update Credentials" : "Create Profile"
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
