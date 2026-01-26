"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Github,
} from "lucide-react";
import Image from "next/image";
import { IRecentFeaturedContent } from "./types/domain.types";
import { prettySafeImage } from "./utils/pretty";
import Link from "next/link";
import { CometCard } from "@/components/ui/comet-card";

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
            background: `radial-gradient(circle, ${["#ff69b4", "#ff1493", "#c71585"][i % 3]
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

// getIconByType removed (unused)

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

  // const isActive = index === activeIndex; // Unused
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
      <div className="h-full px-4 py-6 flex items-center justify-center">
        <CometCard className="w-full h-full max-w-[320px]">
          <div className="relative w-full h-full bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden flex flex-col items-stretch group-hover:border-pink-500/50 transition-colors duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 pointer-events-none" />

            {/* Image Section */}
            <div className="relative h-48 w-full p-2">
              <div className="relative h-full w-full rounded-xl overflow-hidden bg-white/5">
                <Image
                  src={prettySafeImage(content.coverImgMediaKey)}
                  alt={content.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col p-4 pt-1">
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight">
                {content.title}
              </h3>

              <div className="flex flex-wrap gap-1.5 mb-auto">
                {content.tags.slice(0, 3).map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-300 border border-white/5"
                  >
                    {tech}
                  </span>
                ))}
                {content.tags.length > 3 && (
                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-300 border border-white/5">
                    +{content.tags.length - 3}
                  </span>
                )}
              </div>

              <div className="flex space-x-2 mt-4 pt-4 border-t border-white/5">
                {content.type === "BLOG" ? (
                  <Link
                    href={content.readUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Read</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href={content.liveDemoLink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 border border-indigo-500/30 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Demo</span>
                    </Link>

                    <Link
                      href={content.githubLink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </CometCard>
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
  }, [isAutoRotating, featured.length]);

  const nextContent = useCallback(() => {
    setIsAutoRotating(false);
    setActiveIndex((prev) => (prev + 1) % featured.length);
    setTimeout(() => setIsAutoRotating(true), 8000);
  }, [featured.length]);

  const prevContent = useCallback(() => {
    setIsAutoRotating(false);
    setActiveIndex((prev) => (prev - 1 + featured.length) % featured.length);
    setTimeout(() => setIsAutoRotating(true), 8000);
  }, [featured.length]);

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
                className={`w-2 h-2 rounded-full transition-all duration-200 ${index === activeIndex
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
