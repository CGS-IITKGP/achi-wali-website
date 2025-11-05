"use client";

import React, { useState, useMemo } from "react";
import { ITeamExportable } from "../types/domain.types";
import TeamCard from "./TeamCard";
import DesignationFilter from "./DesignationFilter";

interface TeamPageClientProps {
  allTeams: ITeamExportable[];
}

export default function TeamPageClient({ allTeams }: TeamPageClientProps) {
  const [selectedDesignation, setSelectedDesignation] = useState<string | null>(
    "SENIOR"
  );

  // Filter teams based on selected designation
  const filteredTeams = useMemo(() => {
    if (!selectedDesignation) {
      return allTeams;
    }

    return allTeams
      .map((team) => ({
        ...team,
        members: team.members.filter(
          (member) => member.designation === selectedDesignation
        ),
      }))
      .filter((team) => team.members.length > 0); // Only show teams that have members with the selected designation
  }, [allTeams, selectedDesignation]);

  return (
    <>
      {/* Team Designation based Filter Bar */}
      <DesignationFilter onFilterChange={setSelectedDesignation} />

      {/* Team Cards Section */}
      <section className="py-20 px-4 sm:px-8 md:px-16 lg:px-24 relative bg-gradient-to-b from-black via-black to-pink-900/10 overflow-hidden">
        {/* Enhanced animated background effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Particle effect overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, rgba(236,72,153,0.1) 0%, transparent 8%)",
              backgroundSize: "120px 120px",
              animation: "particleFade 4s ease-in-out infinite alternate",
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-[96rem] mx-auto">
          {filteredTeams.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">
                No team members found with the selected designation.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-6 lg:gap-8 2xl:gap-10">
              {filteredTeams.map((team, index1) => (
                <React.Fragment key={team._id || index1}>
                  {team.members.map((member, index2) => (
                    <div
                      key={member._id || `${index1}-${index2}`}
                      className="lg:max-w-[320px] 2xl:max-w-[360px] mx-auto w-full"
                    >
                      <TeamCard
                        member={{
                          ...member,
                          teamName: team.name,
                        }}
                        index={index2}
                      />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
