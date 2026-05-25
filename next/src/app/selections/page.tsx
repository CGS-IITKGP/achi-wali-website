"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../footer";

const dummyTasks = [
  {
    title: "Digital Locker System",

    introduction:
      "This challenge focuses on building a secure digital locker system with persistent local storage and authentication mechanisms.",

    overview:
      "The task is divided into two phases to progressively improve functionality and system design.",

    objectives: [
      "Implement secure PIN-based authentication",
      "Store locker data persistently",
      "Allow adding and deleting items",
      "Create a clean user interface",
    ],

    phase1: [
      "Create a basic locker system",
      "Implement authentication",
      "Store data using JSON",
      "Add menu-driven interactions",
    ],

    phase2: [
      "Add categories",
      "Support import/export",
      "Visualize storage usage",
      "Improve encryption",
    ],

    evaluation: [
      "Functionality",
      "UI/UX",
      "System Design",
      "Code Quality",
      "Polish & Extensions",
    ],

    techStack: [
      "Python",
      "JSON",
      "Tkinter",
      "Authentication",
    ],
  },

  {
    title: "Personal Whiteboard Web App",

    introduction:
      "Design a browser-based whiteboard where users can draw, erase, and persist sketches locally.",

    overview:
      "The project focuses on Canvas API, frontend interactions, and local persistence.",

    objectives: [
      "Implement freehand drawing",
      "Add eraser functionality",
      "Persist drawings locally",
      "Support export features",
    ],

    phase1: [
      "Create HTML Canvas",
      "Add pencil tool",
      "Add eraser tool",
      "Store data in localStorage",
    ],

    phase2: [
      "Add undo/redo",
      "Support shapes",
      "Add dark mode",
      "Export as PNG",
    ],

    evaluation: [
      "Functionality",
      "Responsive Design",
      "Code Structure",
      "UI/UX",
      "Extra Features",
    ],

    techStack: [
      "HTML5",
      "CSS3",
      "JavaScript",
      "Canvas API",
      "localStorage",
    ],
  },
];

const portfolioData = {
  WebX: {
    download: "/docs/webx.pdf",
    tasks: dummyTasks,
  },

  Graphics: {
    download: "/docs/graphics.pdf",
    tasks: dummyTasks,
  },

  GameDev: {
    download: "/docs/gamedev.pdf",
    tasks: dummyTasks,
  },
};

function TaskSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="mb-8">
      <h3 className="text-2xl font-semibold text-pink-200 mb-4">
        {title}
      </h3>

      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={index}
            className="text-gray-300 leading-relaxed"
          >
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SelectionsPage() {
  const [activeTab, setActiveTab] = useState("WebX");
  const [activeTask, setActiveTask] = useState(0);

  const currentPortfolio =
    portfolioData[activeTab as keyof typeof portfolioData];

  useEffect(() => {
    const handleScroll = () => {
      currentPortfolio.tasks.forEach((_, index) => {
        const element = document.getElementById(
          `task-${index}`
        );

        if (element) {
          const rect = element.getBoundingClientRect();

          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveTask(index);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, [currentPortfolio.tasks]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#12000f] to-black text-white pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Hero */}

        <section className="max-w-6xl mx-auto text-center mb-16">
          <div className="inline-block mb-6 px-4 py-2 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-200 text-sm">
            2025–26 Selections
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-pink-300 mb-6">
            Sophomore Selections
          </h1>

          <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
            Explore the official selection tasks for WebX,
            Graphics, and Game Development portfolios
            of the Computer Graphics Society.
          </p>
        </section>

        {/* Tabs */}

        <div className="sticky top-24 z-40 mb-10">
          <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4">
            {Object.keys(portfolioData).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setActiveTask(0);
                }}
                className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 border ${
                  activeTab === tab
                    ? "bg-pink-400 text-black border-pink-300"
                    : "bg-[#1a1a1a]/80 backdrop-blur-xl text-white border-gray-700 hover:border-pink-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Download */}

        <div className="flex justify-center mb-16">
          <a
            href={currentPortfolio.download}
            download
            className="inline-flex items-center gap-3 bg-pink-400 text-black font-semibold px-6 py-3 rounded-full hover:scale-105 transition-all duration-300"
          >
            Download Full {activeTab} Tasks
          </a>
        </div>

        {/* Main Layout */}

        <div className="max-w-7xl mx-auto grid lg:grid-cols-[280px_1fr] gap-10">
          {/* Sidebar */}

          <aside className="hidden lg:block">
            <div className="sticky top-40 border border-pink-500/10 bg-white/[0.03] rounded-3xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-pink-200 mb-6">
                Task Contents
              </h3>

              <div className="space-y-3">
                {currentPortfolio.tasks.map((task, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      document
                        .getElementById(`task-${index}`)
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border ${
                      activeTask === index
                        ? "bg-pink-400 text-black border-pink-300"
                        : "bg-black/20 border-white/5 text-gray-300 hover:border-pink-300"
                    }`}
                  >
                    <div className="text-sm font-semibold mb-1">
                      Task {index + 1}
                    </div>

                    <div className="text-sm leading-relaxed">
                      {task.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Tasks */}

          <div className="space-y-20">
            {currentPortfolio.tasks.map((task, index) => (
              <section
                id={`task-${index}`}
                key={index}
                className="scroll-mt-40 border border-pink-500/10 rounded-3xl p-8 md:p-12 bg-white/[0.03] backdrop-blur-sm"
              >
                {/* Number */}

                <div className="w-14 h-14 rounded-full bg-pink-400 text-black flex items-center justify-center text-xl font-bold mb-8">
                  {index + 1}
                </div>

                {/* Title */}

                <h2 className="text-4xl font-bold text-pink-300 mb-8">
                  {task.title}
                </h2>

                <p className="text-gray-500 mb-10">
                  Portfolio Task • 2025–26 Selection Process
                </p>

                {/* Introduction */}

                <div className="mb-10">
                  <h3 className="text-2xl font-semibold text-pink-200 mb-4">
                    Introduction
                  </h3>

                  <p className="text-gray-300 leading-relaxed text-lg">
                    {task.introduction}
                  </p>
                </div>

                {/* Overview */}

                <div className="mb-10">
                  <h3 className="text-2xl font-semibold text-pink-200 mb-4">
                    Overview
                  </h3>

                  <p className="text-gray-300 leading-relaxed text-lg">
                    {task.overview}
                  </p>
                </div>

                {/* Objectives */}

                <TaskSection
                  title="Objectives"
                  items={task.objectives}
                />

                {/* Phase 1 */}

                <div className="bg-pink-500/5 border border-pink-500/10 rounded-2xl p-6 mb-10">
                  <TaskSection
                    title="Phase 1"
                    items={task.phase1}
                  />
                </div>

                {/* Phase 2 */}

                <div className="bg-pink-500/5 border border-pink-500/10 rounded-2xl p-6 mb-10">
                  <TaskSection
                    title="Phase 2"
                    items={task.phase2}
                  />
                </div>

                {/* Evaluation */}

                <TaskSection
                  title="Evaluation Criteria"
                  items={task.evaluation}
                />

                {/* Tech Stack */}

                <div>
                  <h3 className="text-2xl font-semibold text-pink-200 mb-4">
                    Recommended Tech Stack
                  </h3>

                  <div className="flex flex-wrap gap-3">
                    {task.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="bg-pink-400/10 border border-pink-400/20 text-pink-200 px-4 py-2 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}