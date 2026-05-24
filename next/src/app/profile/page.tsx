"use client";

import { motion } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "../components/navbar";
import Footer from "../footer";
import { useEffect, useState } from "react";
import api from "../axiosApi";
import { IPaginatedUsers } from "../types/domain.types";
import { APIControl } from "@/lib/types/api.types";
import UserCard from "./components/UserCard";

const ProfileDirectory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [paginatedUsers, setPaginatedUsers] = useState<IPaginatedUsers>({
    users: [],
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async (page: number) => {
    setIsLoading(true);
    // Note: Search is client-side filtered on the current page for now as API doesn't support query yet.
    // In a real app with many users, we'd pass searchTerm to the API.
    const apiResponse = await api("GET", "/user", {
      query: {
        target: APIControl.User.Get.Target.PUBLIC_ALL,
        page: page,
        limit: 12,
      },
    });

    if (apiResponse.action === true) {
      setPaginatedUsers(apiResponse.data as IPaginatedUsers);
    } else {
      console.error("Failed to fetch users:", apiResponse.action === false ? apiResponse.message : "Server Error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginatedUsers.totalPages) {
      fetchUsers(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const filteredUsers = paginatedUsers.users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.designation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      className="min-h-screen bg-black text-foreground"
      initial={{ opacity: 0, backgroundColor: "rgba(0,0,0,0)" }}
      animate={{ opacity: 1, backgroundColor: "rgba(0,0,0,1)" }}
      transition={{ duration: 0.8 }}
    >
      <Navbar />
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,hsl(320_60%_20%_/_0.2),transparent_70%)] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 z-10">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent mb-6">
              Our Community
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Meet the creative minds and technical wizards behind our projects.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative flex items-center bg-card/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-xl">
                <Search className="w-5 h-5 text-pink-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search members by name or role..."
                  className="bg-transparent border-none outline-none w-full text-foreground placeholder:text-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Users Grid */}
      <section className="relative container mx-auto px-4 sm:px-6 pb-24 z-10 max-w-7xl">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user, index) => (
              <UserCard key={user._id} user={user} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No members found.</p>
          </div>
        )}

        {/* Pagination */}
        {paginatedUsers.totalPages > 1 && (
          <div className="mt-16 flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(paginatedUsers.page - 1)}
              disabled={paginatedUsers.page === 1}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>
            <div className="flex items-center px-4 font-mono text-gray-400">
              Page {paginatedUsers.page} of {paginatedUsers.totalPages}
            </div>
            <button
              onClick={() => handlePageChange(paginatedUsers.page + 1)}
              disabled={paginatedUsers.page === paginatedUsers.totalPages}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        )}
      </section>

      <Footer />
    </motion.div>
  );
};

export default ProfileDirectory;
