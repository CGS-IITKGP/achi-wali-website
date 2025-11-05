"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Github,
  FileText,
  Gamepad,
  Image,
  FlaskConical,
} from "lucide-react";
import { IRecentFeaturedContent } from "./types/domain.types";
import { prettySafeImage } from "./utils/pretty";
import Link from "next/link";

const AnimatedBackground = React.memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />

      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-10 animate-float"
          style={{
            width: `${120 + i * 30}px`,
            height: `${120 + i * 30}px`,
            left: `${20 + i * 15}%`,
            top: `${10 + i * 12}%`,
            background: `radial-gradient(circle, ${
              ["#ff69b4", "#ff1493", "#c71585"][i % 3]
            }40, transparent)`,
            animationDelay: `${i * 3}s`,
            animationDuration: `${20 + i * 5}s`,
            filter: "blur(2px)",
          }}
        />
      ))}
    </div>
  );
});

AnimatedBackground.displayName = "AnimatedBackground";

const getIconByType = (type: "BLOG" | "GAME" | "GRAPHICS" | "RND") => {
  if (type === "BLOG") {
    return <FileText className="w-6 h-6" />;
  } else if (type === "GAME") {
    return <Gamepad className="w-6 h-6" />;
  } else if (type === "GRAPHICS") {
    return <Image className="w-6 h-6" />;
  } else if (type === "RND") {
    return <FlaskConical className="w-6 h-6" />;
  } else {
    return null;
  }
};

const ContentCard = React.memo<{
  content: IRecentFeaturedContent;
  index: number;
  activeIndex: number;
  totalProjects: number;
  onClick: () => void;
}>(({ content, index, activeIndex, totalProjects, onClick }) => {
  const position = useMemo(() => {
    const angle = ((index - activeIndex) * 360) / totalProjects;
    const radius = 300;
    const x = Math.sin((angle * Math.PI) / 180) * radius;
    const z = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.abs(Math.sin((angle * Math.PI) / 180)) * -30;

    return { x, y, z, rotateY: -angle };
  }, [index, activeIndex, totalProjects]);

  const isActive = index === activeIndex;
  const distance = Math.abs(index - activeIndex);

  const cardStyle = useMemo(
    () => ({
      opacity: distance === 0 ? 1 : distance === 1 ? 0.7 : 0.4,
      scale: distance === 0 ? 1 : distance === 1 ? 0.85 : 0.7,
    }),
    [distance]
  );

  return (
    <motion.div
      className="absolute cursor-pointer"
      animate={{
        x: position.x,
        y: position.y,
        z: position.z,
        rotateY: position.rotateY,
        ...cardStyle,
      }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 25,
        duration: 0.6,
      }}
      onClick={onClick}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className={`
        relative w-[260px] xs:w-[280px] sm:w-72 h-[320px] xs:h-[360px] sm:h-80 rounded-xl overflow-hidden
        ${
          isActive
            ? "shadow-xl shadow-pink-500/20"
            : "shadow-md shadow-black/10"
        }
        transition-shadow duration-300
        bg-gradient-to-br from-pink-600 via-violet-500 to-purple-600
        border border-pink-300/10
      `}
      >
        <div
          className={`relative z-10 h-full ${
            isActive ? "bg-black/80" : "bg-black/30"
          } flex flex-col transition-colors duration-300`}
        >
          <div className="relative h-36 xs:h-44 sm:h-40 overflow-hidden">
            <img
              src={prettySafeImage(content.coverImgMediaKey)}
              alt={content.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            <div className="absolute top-2 xs:top-3 left-2 xs:left-3 flex items-center space-x-1.5 xs:space-x-2 bg-pink-500/80 rounded-full px-1.5 xs:px-2 py-0.5 xs:py-1">
              {getIconByType(content.type)}
              <span className="text-white text-[10px] xs:text-xs font-medium">
                {content.type}
              </span>
            </div>
          </div>

          <div className="flex-1 p-4 sm:p-4 flex flex-col">
            <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-2 line-clamp-2">
              {content.title}
            </h3>

            <div className="flex flex-wrap gap-1 mb-2 xs:mb-3">
              {content.tags.slice(0, 3).map((tech, techIndex) => (
                <span
                  key={techIndex}
                  className="px-1.5 xs:px-2 py-0.5 sm:py-1 bg-pink-500/20 rounded text-[9px] xs:text-[10px] sm:text-xs text-pink-200 border border-pink-400/20"
                >
                  {tech}
                </span>
              ))}
              {content.tags.length > 3 && (
                <span className="px-2 py-1 bg-pink-500/20 rounded text-xs text-pink-200 border border-pink-400/20">
                  +{content.tags.length - 3}
                </span>
              )}
            </div>

            <div className="flex space-x-2">
              {content.type === "BLOG" ? (
                <Link
                  href={content.readUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-pink-500/70 hover:bg-pink-500/90 text-white px-3 py-2 rounded text-sm transition-colors duration-200 flex items-center justify-center space-x-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Read Blog</span>
                </Link>
              ) : (
                <>
                  <Link
                    href={content.liveDemoLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-pink-500/70 hover:bg-pink-500/90 text-white px-3 py-2 rounded text-sm transition-colors duration-200 flex items-center justify-center space-x-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Live Demo</span>
                  </Link>

                  <Link
                    href={content.githubLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black/40 hover:bg-black/60 text-white px-3 py-2 rounded text-sm transition-colors duration-200 flex items-center justify-center"
                  >
                    <Github className="w-3 h-3" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ContentCard.displayName = "ProjectCard";

interface FeaturedContentProps {
  featured: IRecentFeaturedContent[];
}

const FeaturedContent = ({ featured }: FeaturedContentProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  useEffect(() => {
    if (!isAutoRotating) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featured.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoRotating]);

  const nextContent = useCallback(() => {
    setIsAutoRotating(false);
    setActiveIndex((prev) => (prev + 1) % featured.length);
    setTimeout(() => setIsAutoRotating(true), 8000);
  }, []);

  const prevContent = useCallback(() => {
    setIsAutoRotating(false);
    setActiveIndex((prev) => (prev - 1 + featured.length) % featured.length);
    setTimeout(() => setIsAutoRotating(true), 8000);
  }, []);

  const selectContent = useCallback((index: number) => {
    setIsAutoRotating(false);
    setActiveIndex(index);
    setTimeout(() => setIsAutoRotating(true), 8000);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-0 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Featured
          </h1>
          <p className="text-lg text-pink-200 max-w-2xl mx-auto">
            Explore cutting-edge technologies and innovative solutions
          </p>
        </motion.div>

        <div
          className="relative h-[500px] flex items-center justify-center"
          style={{
            perspective: 1200,
            WebkitPerspective: 1200,
            transformStyle: "preserve-3d",
          }}
        >
          {featured.map((content, index) => (
            <ContentCard
              key={content._id}
              content={content}
              index={index}
              activeIndex={activeIndex}
              totalProjects={featured.length}
              onClick={() => selectContent(index)}
            />
          ))}
        </div>

        <div className="flex justify-center items-center space-x-6 mt-8">
          <button
            onClick={prevContent}
            className="p-3 bg-pink-500/20 hover:bg-pink-500/30 rounded-full text-pink-300 hover:text-white transition-all duration-200 border border-pink-400/20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex space-x-2">
            {featured.map((_, index) => (
              <button
                key={index}
                onClick={() => selectContent(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === activeIndex
                    ? "bg-pink-500 shadow-sm shadow-pink-500/50"
                    : "bg-pink-300/20 hover:bg-pink-300/40"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextContent}
            className="p-3 bg-pink-500/20 hover:bg-pink-500/30 rounded-full text-pink-300 hover:text-white transition-all duration-200 border border-pink-400/20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedContent;
