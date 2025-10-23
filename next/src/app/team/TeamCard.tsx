'use client';

import { Mail, Github, Linkedin } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  linkedin: string;
  github: string;
  email: string;
}

interface TeamCardProps {
  member: TeamMember;
  index: number;
}

export default function TeamCard({ member, index }: TeamCardProps) {
  return (
    <div
      className="group relative bg-black/30 rounded-2xl p-6 border border-pink-500/20 backdrop-blur-md hover:border-pink-500/50 transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_15px_50px_rgba(236,72,153,0.25)] animate-slide-up will-change-transform perspective-1000 hover:z-10"
      style={{ 
        animationDelay: `${index * 0.15}s`,
        animationFillMode: 'backwards',
        transform: 'translateZ(0)',
        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 25;
        const rotateY = (centerX - x) / 25;
        const scale = 1.05;
        e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px) scale(${scale})`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0) scale(1)';
        e.currentTarget.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }}
    >
      {/* Subtle background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-pink-500/2 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      
      {/* Professional shine effect */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 translate-x-[-100%] group-hover:animate-[shine_1.5s_ease-in-out] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"></div>
      </div>

      {/* Refined border glow */}
      <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/10 via-pink-500/20 to-pink-500/10 blur-sm"></div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/0 via-pink-500/15 to-pink-500/0 group-hover:animate-pulse-slow"></div>
      </div>

      {/* Interactive highlight effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/0 via-pink-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"></div>
      
      <div className="relative z-10">
        {/* Avatar with enhanced animations */}
        <div className="relative mb-6 w-32 h-32 mx-auto group-hover:animate-float">
          {/* Subtle glow ring */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-full opacity-10 group-hover:opacity-30 transition-all duration-500 animate-pulse-slow"></div>
          
          {/* Elegant rotating rings */}
          <div className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500">
            <div className="absolute inset-0 rounded-full border border-pink-500/10 group-hover:animate-[spin_8s_linear_infinite]"></div>
            <div className="absolute inset-0 rounded-full border border-pink-500/10 group-hover:animate-[spin_12s_linear_infinite_reverse]"></div>
            <div className="absolute inset-[-4px] rounded-full border border-pink-500/10 group-hover:animate-[spin_10s_linear_infinite]"></div>
          </div>

          {/* Professional hover glow */}
          <div className="absolute inset-[-2px] bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-all duration-500"></div>
          
          <img
            src={member.image}
            alt={member.name}
            className="relative z-10 w-full h-full rounded-full border-4 border-pink-500/20 group-hover:border-pink-500/70 transition-all duration-700 object-cover group-hover:scale-110"
          />
        </div>

        {/* Info with staggered animations */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-pink-400 transition-all duration-500 group-hover:scale-105">
            {member.name}
          </h3>
          <p className="text-gray-400 text-sm uppercase tracking-wider transition-all duration-500 group-hover:tracking-widest group-hover:text-pink-300/80">
            {member.role}
          </p>
        </div>

        {/* Social Links with refined hover */}
        <div className="flex justify-center gap-4">
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-pink-500/90 hover:scale-110 hover:rotate-3 transition-all duration-300 ease-out group/icon overflow-hidden backdrop-blur-sm"
            aria-label={`${member.name}'s LinkedIn`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-pink-500/40 translate-y-full group-hover/icon:translate-y-0 transition-transform duration-300 ease-out"></div>
            <Linkedin className="relative z-10 w-5 h-5 text-gray-400 group-hover/icon:text-white transition-colors duration-300 group-hover/icon:scale-110" />
          </a>
          <a
            href={member.github}
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-pink-500/90 hover:scale-110 hover:-rotate-3 transition-all duration-300 ease-out group/icon overflow-hidden backdrop-blur-sm"
            aria-label={`${member.name}'s GitHub`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-pink-500/40 translate-y-full group-hover/icon:translate-y-0 transition-transform duration-300 ease-out"></div>
            <Github className="relative z-10 w-5 h-5 text-gray-400 group-hover/icon:text-white transition-colors duration-300 group-hover/icon:scale-110" />
          </a>
          <a
            href={`mailto:${member.email}`}
            className="relative w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-pink-500/90 hover:scale-110 hover:rotate-3 transition-all duration-300 ease-out group/icon overflow-hidden backdrop-blur-sm"
            aria-label={`Email ${member.name}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-pink-500/40 translate-y-full group-hover/icon:translate-y-0 transition-transform duration-300 ease-out"></div>
            <Mail className="relative z-10 w-5 h-5 text-gray-400 group-hover/icon:text-white transition-colors duration-300 group-hover/icon:scale-110" />
          </a>
        </div>
      </div>

      {/* Corner accents with scale animation */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-pink-500/30 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150 origin-top-left"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-pink-500/30 rounded-br-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150 origin-bottom-right"></div>
    </div>
  );
}