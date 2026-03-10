"use client";

import Image from "next/image";
// import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, Variants } from "framer-motion";
import { righteousFont, robotoFont } from "../../fonts";
import { ExternalLink, FlaskConical, Github } from "lucide-react";
import { Image as GraphicsIcon } from "lucide-react";
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
      },
    );

    const element = featuredSectionRef.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const handleSelect = (index: number) => {
    setCurrentIndex(index);
    setTimer(0);
  };

  const detailsVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
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

  const getIconByType = (type: "BLOG" | "GAME" | "GRAPHICS" | "RND") => {
    if (type === "GRAPHICS") {
      return <GraphicsIcon className="w-6 h-6" />;
    } else if (type === "RND") {
      return <FlaskConical className="w-6 h-6" />;
    } else {
      return null;
    }
  };
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
              className="w-full max-w-[700px] mx-auto bg-gray-900/70 backdrop-blur-xl border border-pink-500/30 rounded-3xl p-4 shadow-[0_0_30px_-10px_rgba(236,72,153,0.4)] relative"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Desktop Navbar */}
              <div className="hidden lg:flex justify-center gap-3 relative z-10 flex-wrap max-w-xl mx-auto">
                {featuredProjects.map((proj, index) => (
                  <motion.button
                    key={proj._id || index}
                    onClick={() => handleSelect(index)}
                    className={`relative px-4 py-2 rounded-3xl font-semibold transition-all duration-300 whitespace-nowrap text-sm lg:text-base tracking-wide ${
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

              {/* Mobile Carousel */}
              <div className="flex items-center justify-between gap-3 w-full lg:hidden">
                <motion.button
                  aria-label="Previous project"
                  whileHover={{ scale: 1.08, x: -2 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() =>
                    setCurrentIndex(
                      (prev) =>
                        (prev - 1 + featuredProjects.length) %
                        featuredProjects.length,
                    )
                  }
                  className="p-2 rounded-full bg-gray-900/70 border border-fuchsia-500/20 backdrop-blur-sm shadow-sm hover:shadow-[0_0_18px_rgba(236,72,153,0.35)] text-fuchsia-300 hover:text-white transition-all duration-200"
                >
                  <FaChevronLeft size={18} />
                </motion.button>

                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="px-4 py-2 flex-1 text-center rounded-xl bg-gray-900/20 max-w-xs mx-auto"
                  style={{ maxHeight: 60 }}
                >
                  <h2
                    className={`text-sm sm:text-base font-semibold bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent ${righteousFont.className}`}
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
                      (prev) => (prev + 1) % featuredProjects.length,
                    )
                  }
                  className="p-2 rounded-full bg-gray-900/70 border border-fuchsia-500/20 backdrop-blur-sm shadow-sm hover:shadow-[0_0_18px_rgba(236,72,153,0.35)] text-fuchsia-300 hover:text-white transition-all duration-200"
                >
                  <FaChevronRight size={18} />
                </motion.button>
              </div>

              {/* Progress Bar */}
              <motion.div
                key={currentIndex}
                className="absolute bottom-[-12px] left-1/2 transform -translate-x-1/2 h-1 w-[80%] rounded-full overflow-hidden bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 shadow-[0_0_20px_5px_rgba(236,72,153,0.7)]"
                initial={{ width: 0 }}
                animate={{ width: "100%", opacity: [0.7, 1, 0.7] }}
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
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="group relative mt-10 w-full max-w-[600px] overflow-hidden rounded-3xl border border-pink-500/30 bg-gray-900/70 p-4 sm:p-6 lg:p-8 transition-all duration-500 hover:border-pink-400/60 hover:shadow-[0_0_40px_rgba(236,72,153,0.15)]"
              >
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute -inset-1 opacity-0 blur-2xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-pink-500/20 group-hover:opacity-100 transition-opacity duration-700"
                />

                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent"
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={{ x: "100%", opacity: [0, 0.25, 0] }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                />

                <div className="flex-1 relative z-10 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.9, x: -30 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative w-full sm:w-[240px] h-52 sm:h-64 shrink-0 overflow-hidden rounded-2xl border border-pink-500/20"
                  >
                    <Image
                      src={prettySafeImage(currentProject.coverImgUrl)}
                      alt={currentProject.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </motion.div>

                  <motion.div
                    key={currentIndex}
                    className="flex-1 flex h-full flex-col gap-3 text-left sm:gap-4"
                    variants={detailsVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Title */}
                    <motion.h2
                      variants={itemVariants}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-white ${righteousFont.className}`}
                    >
                      {currentProject.title}
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                      variants={itemVariants}
                      className={`text-sm sm:text-base lg:text-lg text-gray-300 leading-relaxed ${robotoFont.className}`}
                    >
                      {currentProject.description}
                    </motion.p>

                    {/* Author */}
                    <motion.div
                      variants={itemVariants}
                      className="mt-auto border-t border-pink-500/20 pt-3"
                    >
                      <p
                        className={`text-xs uppercase tracking-wide text-pink-300/80 ${robotoFont.className}`}
                      >
                        Author
                      </p>
                      <p
                        className={`mt-1 text-sm sm:text-base text-pink-200 ${robotoFont.className}`}
                      >
                        {currentProject.author?.name || "Anonymous"}
                      </p>
                    </motion.div>
                  </motion.div>
                </div>
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

        <div className="grid lg:p-2 md:p-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-14">
          {[...projects].reverse().map((proj, idx) => (
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
                    src={prettySafeImage(proj.coverImgUrl)}
                    alt={proj.title}
                    fill
                    className="object-fill rounded-3xl"
                  />

                  <div className="absolute inset-0 top-2 flex flex-col justify-end rounded-3xl bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                    <div className="absolute top-2 xs:top-3 left-2 xs:left-3 flex items-center space-x-1.5 xs:space-x-2 bg-pink-500/80 rounded-full px-1.5 xs:px-2 py-0.5 xs:py-1">
                      {getIconByType(proj.portfolio)}
                      <span className="text-white text-[10px] xs:text-xs font-medium">
                        {proj.portfolio}
                      </span>
                    </div>
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
                          i: number,
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
                        ),
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
