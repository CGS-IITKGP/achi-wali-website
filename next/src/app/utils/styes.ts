import { EUserDesignation, EUserRole } from "../types/domain.types";

export const roleStyles: Record<EUserRole, string> = {
    [EUserRole.ROOT]:
        "bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white font-bold border-none",
    [EUserRole.ADMIN]:
        "text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 border border-purple-500/40",
    [EUserRole.MEMBER]: "border border-pink-500/50 text-pink-400",
    [EUserRole.GUEST]: "border border-white/30 text-slate-200",
};

export const designationStyles: Record<EUserDesignation, string> = {
    [EUserDesignation.NONE]: "text-slate-400",
    [EUserDesignation.JUNIOR]: "text-green-400",
    [EUserDesignation.SENIOR]: "text-blue-400",
    [EUserDesignation.EXECUTIVE]: "text-purple-400",
    [EUserDesignation.HEAD]: "text-pink-400",
    [EUserDesignation.ADVISOR]: "text-yellow-400",
};