"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Shield, Star, ChevronRight, Users } from "lucide-react";
import { EUserRole } from "@/app/types/domain.types";

interface UserCardProps {
  user: {
    _id: string;
    name: string;
    email: string;
    profileImgUrl: string | null;
    roles: EUserRole[];
    designation: string;
    teamId: string | null;
  };
  index: number;
}

// Consistent, professional gradient palette based on name initial
const getAvatarGradient = (name: string) => {
  const gradients = [
    "from-pink-500 to-rose-600",
    "from-purple-500 to-violet-600",
    "from-indigo-500 to-blue-600",
    "from-cyan-500 to-teal-600",
    "from-emerald-500 to-green-600",
    "from-amber-500 to-orange-600",
    "from-pink-500 to-purple-600",
    "from-violet-500 to-indigo-600",
  ];
  const charCode = name.charCodeAt(0) || 0;
  return gradients[charCode % gradients.length];
};

const UserCard = ({ user, index }: UserCardProps) => {
  const [imgError, setImgError] = useState(false);
  const avatarGradient = useMemo(
    () => getAvatarGradient(user.name),
    [user.name],
  );

  const isAdmin = user.roles.includes(EUserRole.ADMIN);
  const isRoot = user.roles.includes(EUserRole.ROOT);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link href={`/profile/${user._id}`}>
        <div className="group h-full relative rounded-2xl bg-gradient-to-b from-gray-900/80 to-gray-950/90 border border-gray-800/50 hover:border-pink-500/40 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/10">
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-transparent to-purple-500/0 group-hover:from-pink-500/5 group-hover:to-purple-500/10 transition-all duration-500" />

          {/* Glow effect on hover */}
          <div className="absolute -inset-px bg-gradient-to-r from-pink-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-pink-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500" />

          <div className="relative p-6 flex flex-col items-center text-center h-full">
            {/* Avatar */}
            <div className="relative mb-5">
              <div
                className={`w-20 h-20 rounded-full bg-gradient-to-br ${avatarGradient} p-[2px] shadow-lg group-hover:shadow-xl group-hover:shadow-pink-500/20 transition-shadow duration-500`}
              >
                <div className="w-full h-full rounded-full bg-gray-950 overflow-hidden relative">
                  {user.profileImgUrl && !imgError ? (
                    <Image
                      src={user.profileImgUrl}
                      alt={user.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={() => setImgError(true)}
                      sizes="80px"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${avatarGradient} text-2xl font-bold text-white select-none uppercase`}
                    >
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Admin/Root badge */}
              {isAdmin && (
                <div
                  className="absolute -bottom-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-1.5 border-2 border-gray-950 shadow-lg"
                  title="Admin"
                >
                  <Shield className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Name */}
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-300 group-hover:to-purple-300 group-hover:bg-clip-text transition-all duration-300">
              {user.name}
            </h3>

            {/* Designation */}
            <p className="text-xs text-pink-400/70 font-medium uppercase tracking-widest mb-4">
              {user.designation !== "NONE" ? user.designation : "Member"}
            </p>

            {/* Spacer */}
            <div className="flex-grow" />

            {/* Footer */}
            <div className="w-full pt-4 border-t border-gray-800/50 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                {isRoot ? (
                  <>
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-400/80">Root</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5" />
                    <span>Community</span>
                  </>
                )}
              </span>
              <span className="flex items-center gap-1 text-gray-500 group-hover:text-pink-400 transition-colors duration-300">
                View{" "}
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default UserCard;
