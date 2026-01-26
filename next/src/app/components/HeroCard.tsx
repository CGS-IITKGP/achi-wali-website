"use client";
import React from "react";
import { useRouter } from "next/navigation";
// Icons removed
import Image from "next/image";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

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
    icon: <Image src={"/game-controller.png"} alt="Game Controller" width={100} height={100} />,
    aosDelay: "300",
    link: "/games",
  },
  {
    title: "Graphics & Animation",
    description:
      "Our expertise ensures high-quality visuals, from detailed environments to dynamic lighting and textures. We create stunning animations and artwork that push creative boundaries.",
    icon: <Image src={"/rocket-3d.png"} alt="Animation" width={100} height={100} />,
    aosDelay: "500",
    link: "/projects",
  },
  {
    title: "Research & Development",
    description:
      "We're at the forefront of game technology, researching advanced shaders, AI, and machine learning to pioneer innovative visual effects and AI-driven gameplay mechanics.",
    icon: <Image src={"/microscope-3d.png"} alt="Game Development" width={100} height={100} />,
    aosDelay: "700",
    link: "/projects",
  },
];

const HeroCard: React.FC = () => {
  const router = useRouter();
  const handleNavigation = (link: string) => router.push(link);

  return (
    <section id="services" className="relative overflow-hidden py-20 px-6 sm:px-12 bg-black/40">
      <AnimatedBackground />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 z-10">
        {serviceData.map((item, index) => (
          <div
            key={index}
            data-aos="fade-up"
            data-aos-delay={item.aosDelay}
            data-aos-once="true"
            className="flex justify-center" // Center cards in grid cells
          >
            <CardContainer className="inter-var w-full">
              <CardBody className="bg-black/40 relative group/card dark:hover:shadow-2xl dark:hover:shadow-pink-500/[0.1] dark:bg-black dark:border-white/[0.2] border-white/[0.1] w-full h-auto rounded-xl p-8 border backdrop-blur-sm">

                {/* Icon - Floating High */}
                <CardItem translateZ="60" className="w-full flex justify-center mb-6">
                  <div className="relative w-24 h-24 drop-shadow-2xl">
                    {item.icon}
                  </div>
                </CardItem>

                {/* Title - Mid Depth */}
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-white text-center w-full"
                >
                  {item.title}
                </CardItem>

                {/* Description - Lower Depth */}
                <CardItem
                  as="p"
                  translateZ="40"
                  className="text-gray-300 text-sm max-w-sm mt-4 text-center mx-auto leading-relaxed"
                >
                  {item.description}
                </CardItem>

                {/* Button - Base Depth */}
                <div className="flex justify-center items-center mt-8">
                  <CardItem
                    translateZ={30}
                    as="button"
                    onClick={() => handleNavigation(item.link)}
                    className="px-6 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition-colors shadow-lg shadow-pink-500/20"
                  >
                    Learn More →
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroCard;
