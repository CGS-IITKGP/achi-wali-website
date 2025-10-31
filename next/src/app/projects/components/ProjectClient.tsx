"use client";

import Image from "next/image";
// import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, Variants } from "framer-motion";
import { righteousFont, robotoFont } from "../../fonts";
import { ExternalLink, Github } from "lucide-react";
// import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { FiMousePointer } from "react-icons/fi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { IProject } from "@/app/types/domain.types";
import { prettySafeImage } from "@/app/utils/pretty";

const detailsVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

interface ProjectsClientProps {
  projects: IProject[];
  featuredProjects: IProject[];
}

export default function ProjectsClient({
  projects,
  featuredProjects,
}: ProjectsClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [flippedCardIndex, setFlippedCardIndex] = useState<number | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const duration = 5;
  const featuredSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Track if the featured section is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.3, // At least 30% of the section must be visible
      }
    );

    if (featuredSectionRef.current) {
      observer.observe(featuredSectionRef.current);
    }

    return () => {
      if (featuredSectionRef.current) {
        observer.unobserve(featuredSectionRef.current);
      }
    };
  }, []);

  const handleSelect = (index: number) => {
    setCurrentIndex(index);
    setTimer(0);
  };

  useEffect(() => {
    setTimer(0);
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  useEffect(() => {
    if (timer >= duration && isInView) {
      setCurrentIndex((prev) => (prev + 1) % featuredProjects.length);
      setTimer(0);
    }
  }, [timer, featuredProjects.length, isInView]);

  const handleCardClick = (index: number) => {
    if (isMobile) {
      setFlippedCardIndex(flippedCardIndex === index ? null : index);
    }
  };
  const currentProject = featuredProjects[currentIndex];

  return (
    <>
      <div
        ref={featuredSectionRef}
        className=" pt-24 lg:pt-36 pb-8 sm:pb-16 px-2 sm:px-2 lg:px-4 flex flex-col items-center"
      >
        <div className="w-full text-center">
          <motion.h1
            initial={{ opacity: 0, x: "-100%" }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-white bg-clip-text text-transparent ${righteousFont.className} mb-4 text-center inline-block`}
          >
            Featured Projects
          </motion.h1>
        </div>

        <p
          className={`text-gray-400 text-base sm:text-lg ${robotoFont.className} my-4 sm:my-8 text-center max-w-2xl px-4`}
        >
          A curated selection of standout projects.
        </p>

        <div className="relative z-10 w-full max-w-7xl mx-auto pt:8 px-4 sm:px-20 lg:px-16 flex flex-col">
          <div className="flex flex-col gap-8 mb-8 items-center">
            <motion.div
              className="w-full lg:w-auto mx-auto bg-gray-900/70 backdrop-blur-xl border border-pink-500/30 rounded-3xl sm:rounded-3xl p-3 shadow-[0_0_30px_-10px_rgba(236,72,153,0.4)] relative"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* 🌐 Desktop Navbar */}
              <div className="hidden lg:flex lg:min-w-xl lg:overflow-x-hidden lg:justify-evenly relative z-10">
                {featuredProjects.map((proj, index) => (
                  <motion.button
                    key={proj._id || index}
                    onClick={() => handleSelect(index)}
                    className={`relative w-auto overflow-hidden px-2 py-2 sm:px-4 sm:py-2.5 rounded-3xl font-semibold transition-all duration-300 whitespace-nowrap text-[0.6rem] sm:text-lg lg:text-base tracking-wide ${
                      currentIndex === index
                        ? "text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {currentIndex === index ? proj.title : index + 1}
                    {currentIndex === index && (
                      <motion.div
                        layoutId="activeProjectTab"
                        className="absolute inset-0 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 rounded-full -z-10 shadow-[0_0_25px_-5px_rgba(236,72,153,0.6)] animate-gradient"
                        transition={{
                          type: "spring",
                          bounce: 0.25,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4 w-full lg:hidden bg-transparent border-none p-0">
                <motion.button
                  aria-label="Previous project"
                  whileHover={{ scale: 1.08, x: -2 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() =>
                    setCurrentIndex(
                      (prev) =>
                        (prev - 1 + featuredProjects.length) %
                        featuredProjects.length
                    )
                  }
                  className="flex-shrink-0 p-2 sm:p-3 rounded-full
               bg-gray-900/70 border border-fuchsia-500/20 backdrop-blur-sm
               shadow-sm hover:shadow-[0_0_18px_rgba(236,72,153,0.35)]
               text-fuchsia-300 hover:text-white transition-all duration-200"
                >
                  <FaChevronLeft size={18} />
                </motion.button>

                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="px-3 sm:px-5 py-2 w-[90%] rounded-xl flex-0 flex-grow-0
               min-w-[160px] sm:min-w-[200px]  text-center"
                >
                  <h2
                    className={`text-sm  sm:text-base font-semibold 
                 bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400
                 bg-clip-text text-transparent ${righteousFont.className}`}
                  >
                    {featuredProjects[currentIndex]?.title ||
                      "Untitled Project"}
                  </h2>
                </motion.div>

                <motion.button
                  aria-label="Next project"
                  whileHover={{ scale: 1.08, x: 2 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() =>
                    setCurrentIndex(
                      (prev) => (prev + 1) % featuredProjects.length
                    )
                  }
                  className="flex-shrink-0 p-2 sm:p-3 rounded-full
               bg-gray-900/70 border border-fuchsia-500/20 backdrop-blur-sm
               shadow-sm hover:shadow-[0_0_18px_rgba(236,72,153,0.35)]
               text-fuchsia-300 hover:text-white transition-all duration-200"
                >
                  <FaChevronRight size={18} />
                </motion.button>
              </div>

              <motion.div
                key={currentIndex}
                className="absolute bottom-[-15px] left-5 right-4 sm:left-8 sm:right-8 h-1 rounded-full overflow-hidden bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 shadow-[0_0_20px_5px_rgba(236,72,153,0.7)]"
                initial={{ width: 0 }}
                animate={{
                  width: "calc(97% - 32px)",
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{ duration: 5, ease: "linear" }}
              >
                <motion.div
                  className="w-full absolute inset-0 bg-white/20 blur-[8px] transform -translate-x-full"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </motion.div>
            </motion.div>

            {currentProject && (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mt-10 rounded-3xl border border-pink-500/40 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800/90 backdrop-blur-2xl shadow-[0_0_50px_-10px_rgba(236,72,153,0.5)] p-4 sm:p-6 lg:p-10 overflow-hidden"
              >
                <div className="relative group w-full">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative h-[300px] sm:h-[300px] lg:h-[500px] rounded-2xl overflow-hidden shadow-inner shadow-pink-700/20 bg-gray-900/10 transition-all duration-500 border-[2px] border-transparent hover:shadow-[0_0_30px_1px_rgba(255,105,180,0.3)] hover:rounded-[20px] hover:scale-105"
                    style={{
                      backgroundImage:
                        "linear-gradient(163deg, #ff79c6 0%, #ff0080 100%)",
                    }}
                  >
                    <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 animate-subtle-gradient pointer-events-none z-20">
                      <div className="absolute inset-0 bg-gray-900/10 rounded-2xl m-[2px]">
                        <Image
                          src={prettySafeImage(currentProject.coverImgMediaKey)}
                          alt={currentProject.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105 rounded-2xl z-10 relative"
                          priority
                        />
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-pink-900/30 to-transparent opacity-60 rounded-2xl z-10"></div>
                  </motion.div>
                </div>

                <motion.div
                  key={currentIndex}
                  className="flex flex-col justify-between space-y-4 sm:space-y-6 text-left px-2 relative"
                  variants={detailsVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.h2
                    variants={itemVariants}
                    className={`text-3xl sm:text-4xl lg:text-6xl font-extrabold bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent tracking-tight leading-tight animate-gradient drop-shadow-[0_0_25px_rgba(236,72,153,0.4)] ${righteousFont.className}`}
                  >
                    {currentProject.title}
                  </motion.h2>

                  <motion.p
                    variants={itemVariants}
                    className={`text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed ${robotoFont.className}`}
                  >
                    {currentProject.description}
                  </motion.p>

                  <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap gap-2 sm:gap-3 pt-2"
                  >
                    {currentProject.tags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="rounded-full border border-pink-400/40 bg-gradient-to-r from-pink-900/50 via-fuchsia-900/40 to-purple-900/40 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-pink-300 shadow-inner shadow-pink-700/30 backdrop-blur-sm animate-gradient transition-transform duration-300 hover:scale-110 cursor-default"
                      >
                        {tag}
                      </span>
                    ))}
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap gap-3 sm:gap-4 pt-4"
                  >
                    {currentProject.links.map((link, i) => {
                      const isGithub = link.text
                        .toLowerCase()
                        .includes("github");
                      const primaryButton =
                        "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 shadow-[0_0_15px_rgba(236,72,153,0.6)] hover:shadow-[0_0_25px_rgba(236,72,153,0.8)] text-white";
                      const secondaryButton =
                        "bg-gray-800/50 border border-purple-400/50 text-purple-200 shadow-inner shadow-purple-700/20 backdrop-blur-sm hover:bg-gray-800 hover:border-purple-400";

                      return (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`group flex items-center justify-center gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-semibold transition-all duration-300 hover:scale-105 text-sm sm:text-base ${
                            isGithub ? secondaryButton : primaryButton
                          }`}
                        >
                          {link.text}
                          {isGithub ? (
                            <Github className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-12" />
                          ) : (
                            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
                          )}
                        </a>
                      );
                    })}
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-20 py-4 lg:py-8">
        <div className="w-full text-center">
          <motion.h2
            initial={{ opacity: 0, x: "-100%" }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl pb-6 lg:pb-12 font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-white bg-clip-text text-transparent ${righteousFont.className} mb-4 text-center inline-block`}
          >
            All Projects
          </motion.h2>
        </div>

        <div className="grid lg:p-2 md:p-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-14">
          {projects.map((proj, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="group aspect-square [perspective:800px]"
              onClick={() => hasMounted && handleCardClick(idx)}
            >
              <div
                className={`relative h-full w-full rounded-3xl shadow-xl [transform-style:preserve-3d] transition-transform duration-[1000ms] ${
                  hasMounted && !isMobile
                    ? "group-hover:[transform:rotateX(180deg)_rotateZ(-180deg)]"
                    : ""
                } ${
                  hasMounted && isMobile && flippedCardIndex === idx
                    ? "[transform:rotateX(180deg)_rotateZ(-180deg)]"
                    : ""
                }`}
              >
                <div className="absolute inset-0 backface-hidden rounded-3xl border-2 border-pink-500/20 overflow-hidden shadow-lg transition-all duration-500 group-hover:border-pink-500/50 group-hover:shadow-pink-500/30 group-hover:scale-105">
                  <Image
                    src={prettySafeImage(proj.coverImgMediaKey)}
                    alt={proj.title}
                    fill
                    className="object-fill rounded-3xl"
                  />

                  <div className="absolute inset-0 flex flex-col justify-end rounded-3xl bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                    <h3
                      className={`text-xl sm:text-2xl font-bold text-white ${righteousFont.className}`}
                    >
                      {proj.title}
                    </h3>

                    <p
                      className={`mt-1 line-clamp-2 text-xs sm:text-sm text-gray-300 ${robotoFont.className}`}
                    >
                      {proj.description}
                    </p>

                    <div className="absolute top-4 right-4 md:hidden flex items-center gap-1 text-xs text-white/70 bg-black/40 rounded-full px-2 py-1">
                      <FiMousePointer size={12} /> <span>Tap</span>{" "}
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-black via-zinc-900 to-black backdrop-blur-md px-4 text-center text-slate-200 backface-hidden [transform:rotateX(180deg)_rotateZ(-180deg)] shadow-[0_0_30px_-5px_rgba(236,72,153,0.3)]">
                  <div className="absolute h-[150%] w-[180px] animate-[rotation_5s_linear_infinite] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-70 blur-md" />

                  <div className="absolute inset-[2px] flex flex-col items-center justify-center gap-4 rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-6 shadow-inner border border-pink-500/10 hover:border-pink-500/30 transition-all duration-300">
                    <h3
                      className={`text-xl sm:text-2xl font-bold text-white tracking-wide drop-shadow-md ${righteousFont.className}`}
                    >
                      {proj.title}
                    </h3>

                    <div className="flex flex-wrap justify-center gap-2">
                      {proj.tags.map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs text-pink-300 transition-all duration-300 hover:bg-pink-500/30 hover:text-white shadow-[0_0_8px_rgba(236,72,153,0.3)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap justify-center gap-3">
                      {proj.links.map(
                        (
                          link: {
                            text: string;
                            url: string;
                          },
                          i: number
                        ) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold text-white backdrop-blur-sm border border-pink-500/30 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                          >
                            {link.text.toLowerCase().includes("git") ? (
                              <Github className="h-4 w-4" />
                            ) : (
                              <ExternalLink className="h-4 w-4" />
                            )}
                            {link.text}
                          </a>
                        )
                      )}
                    </div>

                    <div className="mt-4 h-[1px] w-2/3 bg-gradient-to-r from-transparent via-pink-500/50 to-transparent animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
