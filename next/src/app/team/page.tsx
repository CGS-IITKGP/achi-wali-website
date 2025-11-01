export const dynamic = "force-dynamic";

import Navbar from "../components/navbar";
import TeamJPG from "../assets/team.jpg";
import TeamCard from "./TeamCard";
import Footer from "../footer";
import api from "../axiosApi";
import { ITeamExportable } from "../types/domain.types";
import React from "react";

const fetchAllTeams = async () => {
  const apiResponse = await api("GET", "/team", {
    query: {
      target: "all",
    },
  });

  if (apiResponse.action === true) {
    return apiResponse.data as ITeamExportable[];
  } else if (apiResponse.action === null) {
    console.log("Internal Server Error while fetching all teams.");
  } else if (apiResponse.action === false) {
    console.error("API response error while fetching all teams.", apiResponse);
  }
  return [];
};

export default async function TeamsView() {
  const allTeams = await fetchAllTeams();

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="h-screen">
        <div className="relative w-full h-full overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={TeamJPG.src}
              alt="Our Team"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4 sm:px-8 md:px-16 lg:px-24">
            <div className="max-w-5xl mx-auto text-center">
              {/* <span className="inline-block px-4 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm font-semibold mb-6 border border-pink-500/30">
                Game Development Team
              </span> */}

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight drop-shadow-lg fade-in">
                Our <span className="text-pink-400">Team</span>
              </h1>

              <div className="w-24 h-1 bg-pink-500 mx-auto mb-8"></div>

              <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-gray-200 mb-10 fade-in-2">
                We&apos;re a diverse group of passionate developers, artists,
                and storytellers committed to creating immersive gaming
                experiences that push creative and technical boundaries.
              </p>
            </div>

            <div className="absolute bottom-16">
              <span className="inline-flex flex-col items-center animate-bounce">
                <svg
                  className="w-8 h-8 text-pink-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <span className="mt-2 text-pink-400 font-light">
                  Scroll Down
                </span>
              </span>
            </div>
          </div>

          <div className="absolute top-10 left-10 w-40 h-40 border-t-4 border-l-4 border-pink-500/20 hidden lg:block"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 border-b-4 border-r-4 border-pink-500/20 hidden lg:block"></div>
        </div>
      </section>

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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-6 lg:gap-8 2xl:gap-10">
            {allTeams.map((team, index1) => (
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
        </div>
      </section>
      <Footer />
    </div>
  );
}
