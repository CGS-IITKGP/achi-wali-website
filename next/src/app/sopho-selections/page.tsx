"use client";

import { useState } from "react";

const portfolioData = {
  WebX: [
    {
      title: "Digital Locker System",
      description:
        "Build a secure digital locker with PIN authentication and persistent storage.",
      tech: ["Python", "JSON", "Authentication"],
      difficulty: "Intermediate",
    },
    {
      title: "Personal Whiteboard App",
      description:
        "Create a browser whiteboard with drawing tools, persistence and export features.",
      tech: ["Canvas API", "JavaScript", "localStorage"],
      difficulty: "Intermediate",
    },
  ],

  Graphics: [
    {
      title: "Digital Locker System",
      description:
        "Build a secure digital locker with PIN authentication and persistent storage.",
      tech: ["Python", "JSON", "Authentication"],
      difficulty: "Intermediate",
    },
    {
      title: "Personal Whiteboard App",
      description:
        "Create a browser whiteboard with drawing tools, persistence and export features.",
      tech: ["Canvas API", "JavaScript", "localStorage"],
      difficulty: "Intermediate",
    },
  ],

  GameDev: [
    {
      title: "Digital Locker System",
      description:
        "Build a secure digital locker with PIN authentication and persistent storage.",
      tech: ["Python", "JSON", "Authentication"],
      difficulty: "Intermediate",
    },
    {
      title: "Personal Whiteboard App",
      description:
        "Create a browser whiteboard with drawing tools, persistence and export features.",
      tech: ["Canvas API", "JavaScript", "localStorage"],
      difficulty: "Intermediate",
    },
  ],
};

export default function SophoSelectionsPage() {
  const [activeTab, setActiveTab] = useState("WebX");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#12000f] to-black text-white px-6 py-10">
      {/* Hero Section */}
      <div className="text-center mb-14">
        <h1 className="text-5xl md:text-7xl font-bold text-pink-300 mb-4">
          SOPHO Selections
        </h1>

        <p className="text-gray-400 max-w-3xl mx-auto text-lg">
          Explore the selection tasks for different portfolios of the
          Computer Graphics Society.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-12 flex-wrap">
        {Object.keys(portfolioData).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-full transition-all duration-300 border ${
              activeTab === tab
                ? "bg-pink-400 text-black border-pink-300"
                : "bg-[#1a1a1a] text-white border-gray-700 hover:border-pink-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {portfolioData[activeTab as keyof typeof portfolioData].map(
          (task, index) => (
            <div
              key={index}
              className="bg-[#111111] border border-gray-800 rounded-3xl p-8 hover:border-pink-400 hover:shadow-[0_0_25px_rgba(255,105,180,0.25)] transition-all duration-300"
            >
              <h2 className="text-3xl font-semibold text-pink-300 mb-4">
                {task.title}
              </h2>

              <p className="text-gray-400 mb-6 leading-relaxed">
                {task.description}
              </p>

              <div className="flex gap-3 flex-wrap mb-6">
                {task.tech.map((item, idx) => (
                  <span
                    key={idx}
                    className="bg-pink-300/20 text-pink-200 px-3 py-1 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="text-sm text-gray-500">
                Difficulty: {task.difficulty}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}