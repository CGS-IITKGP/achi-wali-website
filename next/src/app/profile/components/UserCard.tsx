"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Shield, Star, ChevronRight, Users } from "lucide-react";
import { EUserRole } from "@/app/types/domain.types"; // Adjust import path if needed

interface UserCardProps {
    user: {
        _id: string;
        name: string;
        email: string;
        profileImgMediaKey: string | null;
        roles: EUserRole[];
        designation: string; // or EUserDesignation
        teamId: string | null;
    };
    index: number;
}

const UserCard = ({ user, index }: UserCardProps) => {
    const [imgError, setImgError] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link href={`/profile/${user._id}`}>
                <div className="group h-full relative p-6 rounded-2xl bg-card/40 border border-white/5 hover:border-pink-500/30 overflow-hidden transition-all duration-300 hover:bg-card/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-900/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-transparent to-purple-500/0 group-hover:from-pink-500/5 group-hover:to-purple-500/5 transition-colors duration-500" />

                    <div className="relative flex flex-col items-center text-center h-full">
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-[2px]">
                                <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                                    {user.profileImgMediaKey && !imgError ? (
                                        <Image
                                            src={user.profileImgMediaKey}
                                            alt={user.name}
                                            fill
                                            className="object-cover"
                                            onError={() => setImgError(true)}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-3xl font-bold text-white/50 select-none uppercase">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {user.roles.includes(EUserRole.ADMIN) && (
                                <div className="absolute -bottom-1 -right-1 bg-pink-500 rounded-full p-1.5 border-2 border-black" title="Admin">
                                    <Shield className="w-3 h-3 text-white fill-current" />
                                </div>
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-pink-300 transition-colors">
                            {user.name}
                        </h3>
                        <p className="text-sm text-pink-400/80 font-medium mb-3 uppercase tracking-wide">
                            {user.designation !== "NONE" ? user.designation : "Member"}
                        </p>

                        <div className="mt-auto pt-4 w-full border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                {user.roles.includes(EUserRole.ROOT) ? (
                                    <>
                                        <Star className="w-3 h-3 text-yellow-500" />
                                        Root
                                    </>
                                ) : (
                                    <>
                                        <Users className="w-3 h-3" />
                                        Community
                                    </>
                                )}
                            </span>
                            <span className="flex items-center gap-1 group-hover:text-pink-400 transition-colors">
                                Profile <ChevronRight className="w-3 h-3" />
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default UserCard;
