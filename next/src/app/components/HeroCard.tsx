"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { FaGamepad } from "react-icons/fa";
import { FaShuttleSpace, FaSpaceAwesome } from "react-icons/fa6";

// ✅ Reuse AnimatedBackground from FeaturedContent
const AnimatedBackground = React.memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
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

interface IServiceData {
  title: string;
  description: string;
  icon: React.ReactNode;
  aosDelay: string;
  link: string;
}

const serviceData: IServiceData[] = [
  {
    title: "Game Development",
    description:
      "We craft engaging and interactive games using Unity, delivering dynamic gameplay experiences with smooth mechanics, intuitive controls, and immersive storytelling.",
    icon: <FaGamepad className="icon-spin text-6xl text-white" />,
    aosDelay: "300",
    link: "/games",
  },
  {
    title: "Graphics & Animation",
    description:
      "Our expertise ensures high-quality visuals, from detailed environments to dynamic lighting and textures. We create stunning animations and artwork that push creative boundaries.",
    icon: <FaShuttleSpace className="icon-spin text-6xl text-white" />,
    aosDelay: "500",
    link: "/projects",
  },
  {
    title: "R&D in Game Tech",
    description:
      "We're at the forefront of game technology, researching advanced shaders, AI, and machine learning to pioneer innovative visual effects and AI-driven gameplay mechanics.",
    icon: <FaSpaceAwesome className="icon-spin text-6xl text-white" />,
    aosDelay: "700",
    link: "/projects",
  },
];

const HeroCard: React.FC = () => {
  const router = useRouter();
  const handleNavigation = (link: string) => router.push(link);

  return (
    <section id="services" className="relative overflow-hidden py-16 px-6 sm:px-12">
      {/* ✅ Shared animated background from Featured section */}
      <AnimatedBackground />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 z-5">
        {serviceData.map((item, index) => (
          <div
            key={index}
            data-aos="fade-up"
            data-aos-delay={item.aosDelay}
            data-aos-once="true"
            className="group relative bg-black/40 border border-white/20 backdrop-blur-lg rounded-2xl p-8 flex flex-col justify-between items-center text-center shadow-lg hover:border-pink-500/40 transition-all duration-300"
          >
            <div className="mb-4">{item.icon}</div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              {item.title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              {item.description}
            </p>

            <button
              onClick={() => handleNavigation(item.link)}
              className="text-pink-500 font-medium text-sm hover:text-pink-400 transition-colors cursor-pointer relative z-10"
            >
              Learn More →
            </button>

            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/0 to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          </div>
        ))}
      </div>

      {/* Global CSS for icon rotation */}
      <style jsx global>{`
        .icon-spin {
          transition: transform 0.6s ease-in-out;
        }
        .group:hover .icon-spin {
          transform: rotate(360deg);
        }
      `}</style>
    </section>
  );
};

export default HeroCard;
