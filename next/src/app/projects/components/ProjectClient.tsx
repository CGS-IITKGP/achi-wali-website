"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { righteousFont, robotoFont } from "../../fonts";
import { ExternalLink, Github } from "lucide-react";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { FiMousePointer } from "react-icons/fi";
import { IProject } from "@/app/types/domain.types";
import { prettySafeImage } from "@/app/utils/pretty";

interface ProjectsClientProps {
  projects: IProject[];
  featuredProjects: IProject[];
}

export default function ProjectsClient({
  projects,
  featuredProjects,
}: ProjectsClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isMobile, setIsMobile] = useState(false);
  const [useSmallCardSize, setUseSmallCardSize] = useState(false);
  const [flippedCardIndex, setFlippedCardIndex] = useState<number | null>(null);
  const [isCenterCardActive, setIsCenterCardActive] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setUseSmallCardSize(window.innerWidth < 1150);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredProjects.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, featuredProjects.length]);

  useEffect(() => {
    setIsCenterCardActive(false);
  }, [currentIndex]);

  const handleSelect = (index: number) => {
    setCurrentIndex(index);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + featuredProjects.length) % featuredProjects.length
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredProjects.length);
  };

  const handleCenterCardClick = (e: React.MouseEvent) => {
    if (isMobile && !isCenterCardActive) {
      e.preventDefault();
      setIsCenterCardActive(true);
    }
  };

  const handleCardClick = (index: number) => {
    if (isMobile) {
      setFlippedCardIndex(flippedCardIndex === index ? null : index);
    }
  };

  return (
    <>
      <div className="pt-36 pb-16 px-4 sm:px-8 lg:px-32 flex flex-col items-center">
        <div className="w-full text-center">
          <motion.h1
            initial={{ opacity: 0, x: "-100%" }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-white bg-clip-text text-transparent ${righteousFont.className} mb-4 text-center inline-block`}
          >
            Featured Projects
          </motion.h1>
        </div>

        <p
          className={`text-gray-400 text-lg ${robotoFont.className} my-12 text-center max-w-2xl`}
        >
          A curated selection of standout projects.{" "}
        </p>

        <div
          className="relative w-full max-w-7xl h-[450px] flex items-center justify-center overflow-hidden"
          style={{ perspective: isMobile ? "none" : "1600px" }}
        >
          {featuredProjects.map((featuredProject, index) => {
            const isCenter = index === currentIndex;
            const isLeft =
              index ===
              (currentIndex - 1 + featuredProjects.length) %
                featuredProjects.length;
            const isRight =
              index === (currentIndex + 1) % featuredProjects.length;

            let transformStyle = "";
            let zIndex = 0;
            let opacity = 0;
            let filterStyle = "brightness(0.5)";

            if (isCenter) {
              transformStyle = isMobile
                ? "translateX(0) scale(1)"
                : "translateX(0) translateY(0) translateZ(150px) rotateY(0deg) scale(1)";
              zIndex = 5;
              opacity = 1;
              filterStyle = "brightness(1)";
            } else if (isLeft) {
              transformStyle = isMobile
                ? "translateX(-100%) scale(0.8)"
                : useSmallCardSize
                ? "translateX(-280px) translateY(0) translateZ(0) rotateY(-35deg) scale(0.8)"
                : "translateX(-380px) translateY(0) translateZ(0) rotateY(-35deg) scale(0.8)";
              zIndex = 2;
              opacity = 1;
              filterStyle = "brightness(0.7)";
            } else if (isRight) {
              transformStyle = isMobile
                ? "translateX(100%) scale(0.8)"
                : useSmallCardSize
                ? "translateX(280px) translateY(0) translateZ(0) rotateY(35deg) scale(0.8)"
                : "translateX(380px) translateY(0) translateZ(0) rotateY(35deg) scale(0.8)";
              zIndex = 2;
              opacity = 1;
              filterStyle = "brightness(0.7)";
            }

            if (isMobile && (isLeft || isRight)) opacity = 0;

            const centerCardHoverClasses =
              "hover:scale-110 hover:rotate-1 hover:shadow-2xl";
            const centerCardActiveClasses = "scale-110 rotate-1 shadow-2xl";

            const cardContent = (
              <div
                className={`relative w-[320px] h-[330px] p-1.5 rounded-2xl z-10
                    bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500
                    shadow-lg shadow-pink-500/30
                    transition-transform duration-500 ease-in-out
                    scale-90 sm:scale-100 
                    ${isCenter && !isMobile ? centerCardHoverClasses : ""}
                    ${
                      isCenter && isMobile && isCenterCardActive
                        ? centerCardActiveClasses
                        : ""
                    }
                    before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:-z-10
                    before:bg-gradient-to-br before:from-purple-400 before:to-yellow-400
                    before:[transform:rotate(2deg)] before:transition-opacity before:duration-500 group-hover:before:opacity-0
                    after:content-[''] after:absolute after:inset-0 after:rounded-2xl after:-z-10
                    after:bg-gradient-to-tr after:from-pink-400 after:to-blue-400
                    after:[transform:rotate(-2deg)] after:transition-opacity after:duration-500 group-hover:after:opacity-0`}
              >
                <div className="relative w-full h-full bg-zinc-900 rounded-xl overflow-hidden border-2 border-pink-500/20">
                  <Image
                    src={prettySafeImage(featuredProject.coverImgMediaKey)}
                    alt={featuredProject.title}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 flex flex-col justify-end">
                    <h3
                      className={`text-2xl font-bold text-white transition-colors duration-700 ${
                        righteousFont.className
                      } ${
                        isCenter && isMobile && isCenterCardActive
                          ? "text-pink-400"
                          : "group-hover:text-pink-400"
                      }`}
                    >
                      {featuredProject.title}
                    </h3>
                    <p
                      className={`text-gray-300 text-sm mt-2 line-clamp-2 ${robotoFont.className}`}
                    >
                      {featuredProject.description}
                    </p>
                  </div>
                </div>
              </div>
            );

            return (
              <div
                key={index}
                className="group absolute transition-all duration-700 ease-in-out"
                style={{
                  transform: transformStyle,
                  zIndex,
                  opacity,
                  filter: filterStyle,
                  transformStyle: "preserve-3d",
                }}
              >
                {isCenter ? (
                  <Link
                    href={featuredProject.links[0]?.url || "#"}
                    legacyBehavior
                  >
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleCenterCardClick}
                    >
                      {cardContent}
                    </a>
                  </Link>
                ) : (
                  cardContent
                )}
              </div>
            );
          })}

          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-3 z-20 -translate-y-1/2 rounded-full bg-black/30 p-3 text-gray-300 backdrop-blur-sm border border-pink-500/30 transition-all duration-300 ease-in-out hover:bg-black/50 hover:border-pink-500/70 hover:text-white hover:shadow-lg hover:shadow-pink-500/40 md:left-5"
          >
            <MdArrowBackIos className="ml-2" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-3 z-20 -translate-y-1/2 rounded-full bg-black/30 p-3 text-gray-300 backdrop-blur-sm border border-pink-500/30 transition-all duration-300 ease-in-out hover:bg-black/50 hover:border-pink-500/70 hover:text-white hover:shadow-lg hover:shadow-pink-500/40 md:right-5"
          >
            <MdArrowForwardIos className="ml-1" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-12">
          {featuredProjects.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? "bg-pink-500 scale-125"
                  : "bg-gray-600 hover:bg-gray-500"
              }`}
              aria-label={`Go to project ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-32 py-12">
        <div className="w-full text-center">
          <motion.h2
            initial={{ opacity: 0, x: "-100%" }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`text-4xl lg:text-5xl font-bold text-center mb-20 bg-gradient-to-r from-pink-400 via-purple-400 to-white bg-clip-text text-transparent ${righteousFont.className} inline-block`}
          >
            All Projects
          </motion.h2>
        </div>

        <div className="grid lg:p-2 md:p-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-14">
          {projects.map((project, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="group aspect-square [perspective:800px]"
              onClick={() => handleCardClick(idx)}
            >
              <div
                className={`relative h-full w-full rounded-3xl shadow-xl [transform-style:preserve-3d] transition-transform duration-[1000ms] ${
                  !isMobile
                    ? "group-hover:[transform:rotateX(180deg)_rotateZ(-180deg)]"
                    : ""
                } ${
                  isMobile && flippedCardIndex === idx
                    ? "[transform:rotateX(180deg)_rotateZ(-180deg)]"
                    : ""
                }`}
              >
                <div className="absolute inset-0 backface-hidden rounded-3xl border-2 border-pink-500/20 overflow-hidden shadow-lg transition-all duration-500 group-hover:border-pink-500/50 group-hover:shadow-pink-500/30 group-hover:scale-105">
                  <Image
                    src={prettySafeImage(project.coverImgMediaKey)}
                    alt={project.title}
                    fill
                    className="object-cover rounded-3xl"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end rounded-3xl bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                    <h3
                      className={`text-2xl font-bold text-white ${righteousFont.className}`}
                    >
                      {project.title}
                    </h3>
                    <p
                      className={`mt-1 line-clamp-2 text-sm text-gray-300 ${robotoFont.className}`}
                    >
                      {project.description}
                    </p>
                    <div className="absolute top-4 right-4 md:hidden flex items-center gap-1 text-xs text-white/70 bg-black/40 rounded-full px-2 py-1">
                      <FiMousePointer size={12} />
                      <span>Tap</span>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-black via-zinc-900 to-black backdrop-blur-md px-4 text-center text-slate-200 backface-hidden [transform:rotateX(180deg)_rotateZ(-180deg)] shadow-[0_0_30px_-5px_rgba(236,72,153,0.3)]">
                  <div className="absolute h-[150%] w-[180px] animate-[rotation_5s_linear_infinite] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-70 blur-md" />

                  <div className="absolute inset-[2px] flex flex-col items-center justify-center gap-4 rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-6 shadow-inner border border-pink-500/10 hover:border-pink-500/30 transition-all duration-300">
                    <h3
                      className={`text-2xl font-bold text-white tracking-wide drop-shadow-md ${righteousFont.className}`}
                    >
                      {project.title}
                    </h3>

                    <div className="flex flex-wrap justify-center gap-2">
                      {project.tags.map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs text-pink-300 transition-all duration-300 hover:bg-pink-500/30 hover:text-white shadow-[0_0_8px_rgba(236,72,153,0.3)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-col items-center gap-3 w-full">
                      <div className="flex flex-wrap justify-center gap-3 w-full">
                        {["github", "live-demo"].map((type) => {
                          const link = project.links.find(
                            (l) => l.text.toLowerCase().trim() === type
                          );
                          const isActive = !!link;
                          const Icon =
                            type === "github" ? Github : ExternalLink;
                          const linkText =
                            type === "github" ? "GitHub" : "Live Link";

                          const activeClasses =
                            "flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 px-4 py-2 font-semibold text-white backdrop-blur-sm border border-pink-500/30 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]";
                          const disabledClasses =
                            "flex items-center gap-2 rounded-lg bg-zinc-700/30 px-4 py-2 font-semibold text-gray-500 border border-zinc-700/50 cursor-not-allowed transition-all duration-300";

                          if (isActive) {
                            return (
                              <a
                                key={type}
                                href={link!.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={activeClasses}
                              >
                                <Icon />
                                {linkText}
                              </a>
                            );
                          } else {
                            return (
                              <span key={type} className={disabledClasses}>
                                <Icon />
                                {linkText} (N/A)
                              </span>
                            );
                          }
                        })}
                      </div>
                      {(() => {
                        const otherLinks = project.links.filter(
                          (l) =>
                            l.text.toLowerCase().trim() !== "github" &&
                            l.text.toLowerCase().trim() !== "live-demo"
                        );

                        if (otherLinks.length === 0) return null;

                        return (
                          <div className="mt-4 pt-4 border-t border-pink-500/10 w-full flex flex-col items-center">
                            <p className="text-xs text-gray-400 mb-2">
                              Additional Resources:
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                              {otherLinks.map((link, i) => (
                                <a
                                  key={`other-${i}`}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 rounded-full text-sm text-gray-300 border border-gray-600/50 px-3 py-1 transition-colors hover:text-white hover:border-pink-500/50"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  {link.text}
                                </a>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
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
