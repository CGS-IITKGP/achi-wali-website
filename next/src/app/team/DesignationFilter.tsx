"use client";

import { useState } from "react";

interface DesignationFilterProps {
  onFilterChange: (designation: string | null) => void;
}

const designations = [
  { value: "ADVISOR", label: "Advisor" },
  { value: "HEAD", label: "Head" },
  { value: "SENIOR", label: "Senior" },
  { value: "JUNIOR", label: "Junior " },
];

export default function DesignationFilter({
  onFilterChange,
}: DesignationFilterProps) {
  const [activeFilter, setActiveFilter] = useState<string>("SENIOR");

  const handleFilterClick = (value: string) => {
    setActiveFilter(value);
    onFilterChange(value === "SENIOR" ? "SENIOR" : value);
  };

  return (
    <section className="py-8 px-4 sm:px-8 md:px-16 lg:px-24 relative bg-black">
      <div className="relative z-10 max-w-[96rem] mx-auto">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
          {designations.map((designation) => (
            <button
              key={designation.value}
              onClick={() => handleFilterClick(designation.value)}
              className={`
                group relative px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 
                rounded-full font-semibold text-xs sm:text-sm md:text-base
                transition-all duration-500 ease-out
                overflow-hidden
                ${
                  activeFilter === designation.value
                    ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-[0_0_30px_rgba(236,72,153,0.5)] scale-105 border-2 border-pink-400"
                    : "bg-black/40 text-gray-300 border-2 border-pink-500/30 hover:border-pink-500/60 hover:text-white hover:scale-105"
                }
              `}
            >
              {/* Animated background gradient */}
              <div
                className={`
                absolute inset-0 bg-gradient-to-r from-pink-500/20 via-pink-500/40 to-pink-500/20
                opacity-0 group-hover:opacity-100 transition-opacity duration-500
                ${activeFilter === designation.value ? "opacity-100" : ""}
              `}
              ></div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>

              {/* Glow effect for active state */}
              {activeFilter === designation.value && (
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 via-pink-500/50 to-pink-500/30 blur-xl animate-pulse-slow -z-10"></div>
              )}

              {/* Button text */}
              <span className="relative z-10 tracking-wide">
                {designation.label}
              </span>

              {/* Corner accents for active state */}
              {activeFilter === designation.value && (
                <>
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/50 rounded-tl-full"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/50 rounded-br-full"></div>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Decorative line underneath */}
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent"></div>
      </div>
    </section>
  );
}
