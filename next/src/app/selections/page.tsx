"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../footer";
import { graphicsTasks } from '@/app/selections/tasks/graphicsTasks';
import { webxTasks } from '@/app/selections/tasks/webxTasks';
import { gamedevTasks } from '@/app/selections/tasks/gamedevTasks';

const portfolioData = {
  WebX: {
    download: "/docs/webx.pdf",
    tasks: webxTasks,
  },
  Graphics: {
    download: "/docs/graphics.pdf",
    tasks: graphicsTasks,
  },
  GameDev: {
    download: "/docs/gamedev.pdf",
    tasks: gamedevTasks,
  },
};

function TaskSection({
  title,
  items,
}: {
  title: string;
  items: string[] | undefined;
}) {
  if (!items || items.length === 0) return null;
  
  return (
    <div className="mb-8">
      <h3 className="text-xl sm:text-2xl font-semibold text-pink-200 mb-4">
        {title}
      </h3>

      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={index}
            className="text-gray-300 leading-relaxed text-sm sm:text-base"
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

  const [showScrollTop, setShowScrollTop] = useState(false);

  const currentPortfolio =
    portfolioData[activeTab as keyof typeof portfolioData];

  useEffect(() => {
    const handleScroll = () => {
      currentPortfolio.tasks.forEach((_, index) => {
        const element = document.getElementById(`task-${index}`);

        if (element) {
          const rect = element.getBoundingClientRect();

          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveTask(index);
          }
        }
      });

      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPortfolio.tasks]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#12000f] to-black text-white pt-28 sm:pt-32 pb-40 sm:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="max-w-6xl mx-auto text-center mb-12 sm:mb-16">
          <div className="inline-block mb-5 px-4 py-2 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-200 text-xs sm:text-sm">
            2026–27 Selections
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-pink-300 mb-5 leading-tight">
            Sophomore Selections
          </h1>

          <p className="text-gray-400 max-w-3xl mx-auto text-sm sm:text-lg leading-relaxed px-2">
            Explore the official selection tasks for WebX, Graphics, and Game
            Development portfolios of the Computer Graphics Society.
          </p>

          {/* Deadline */}
          <div className="mt-8 max-w-2xl mx-auto border border-pink-500/20 bg-pink-500/10 rounded-2xl px-6 py-4 backdrop-blur-sm">
            <p className="text-pink-200 font-semibold text-sm sm:text-base">
              Submission Deadline:
              <span className="text-white ml-2">
                27th June 2026 • 11:59 PM (Tentative)
              </span>
            </p>
          </div>
        </section>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-3 sm:gap-4 mb-14">
          {Object.keys(portfolioData).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setActiveTask(0);

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className={`w-full py-3 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 border ${
                activeTab === tab
                  ? "bg-pink-400 text-black border-pink-300"
                  : "bg-[#1a1a1a]/80 backdrop-blur-xl text-white border-gray-700 hover:border-pink-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Layout */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-36 border border-pink-500/10 bg-white/[0.03] rounded-3xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-pink-200 mb-6">
                Task Contents
              </h3>

              <div className="space-y-3">
                {currentPortfolio.tasks.map((task, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      document.getElementById(`task-${index}`)?.scrollIntoView({
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
          <div className="space-y-12 sm:space-y-20">
            {currentPortfolio.tasks.map((task, index) => (
              <section
                id={`task-${index}`}
                key={index}
                className="scroll-mt-32 border border-pink-500/10 rounded-3xl p-5 sm:p-8 md:p-12 bg-white/[0.03] backdrop-blur-sm"
              >
                {/* Number */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-pink-400 text-black flex items-center justify-center text-lg sm:text-xl font-bold mb-6 sm:mb-8">
                  {index + 1}
                </div>

                {/* Title */}
                <h2 className="text-3xl sm:text-4xl font-bold text-pink-300 mb-6 leading-tight">
                  {task.title}
                </h2>

                <p className="text-gray-500 mb-8 sm:mb-10 text-sm sm:text-base">
                  Portfolio Task • 2026–27 Selection Process
                </p>

                {/* Introduction */}
                {task.introduction && (
                  <div className="mb-8 sm:mb-10">
                    <h3 className="text-xl sm:text-2xl font-semibold text-pink-200 mb-4">
                      Introduction
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm sm:text-lg">
                      {task.introduction}
                    </p>
                  </div>
                )}

                {/* Overview */}
                {task.overview && (
                  <div className="mb-8 sm:mb-10">
                    <h3 className="text-xl sm:text-2xl font-semibold text-pink-200 mb-4">
                      Overview
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm sm:text-lg">
                      {task.overview}
                    </p>
                  </div>
                )}

                <TaskSection title="Objectives" items={task.objectives} />

                {task.phase1 && task.phase1.length > 0 && (
                  <div className="bg-pink-500/5 border border-pink-500/10 rounded-2xl p-5 sm:p-6 mb-8 sm:mb-10">
                    <TaskSection title="Phase 1" items={task.phase1} />
                  </div>
                )}

                {task.phase2 && task.phase2.length > 0 && (
                  <div className="bg-pink-500/5 border border-pink-500/10 rounded-2xl p-5 sm:p-6 mb-8 sm:mb-10">
                    <TaskSection title="Phase 2" items={task.phase2} />
                  </div>
                )}

                <TaskSection
                  title="Evaluation Criteria"
                  items={task.evaluation}
                />

                {task.techStack && task.techStack.length > 0 && (
                    <TaskSection title="Recommended Tech Stack" items={task.techStack} />
                )}
              </section>
            ))}

            {/* Bottom Download Section */}
            <div className="flex justify-center pt-6 pb-20 sm:pb-6">
              <a
                href={currentPortfolio.download}
                download
                className="inline-flex items-center justify-center bg-pink-400 text-black font-semibold px-6 sm:px-7 py-3 sm:py-4 rounded-full hover:scale-105 transition-all duration-300 text-sm sm:text-base"
              >
                Download Full {activeTab} Tasks
              </a>
            </div>
          </div>
        </div>

        {/* Floating Back To Top */}
        {showScrollTop && (
          <button
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            className="
              fixed bottom-5 right-4 sm:bottom-7 sm:right-7 z-50 
              w-10 h-10 text-lg md:w-14 md:h-14 md:text-2xl
              rounded-full bg-pink-400 text-black
              flex items-center justify-center
              shadow-lg hover:scale-110
              transition-all duration-300 font-semibold
            "
          >
            ↑
          </button>
        )}
      </main>

      <Footer />
    </>
  );
}