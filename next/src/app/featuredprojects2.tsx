"use client";

import React, { useState, useEffect } from "react";
import { useSprings, animated, config } from "@react-spring/web";
import styled from "styled-components";
import { motion } from "framer-motion";
import Image from "next/image";

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  techStack: string[];
  link: string;
}

const FooterContainer = styled.footer`
  position: relative;
  width: 100%;
  padding: 4rem 0;
  background-color: #0a0a0a;
  overflow: hidden;
`;

const CarouselTitle = styled(motion.h2)`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #ff69b4;
  font-weight: bold;
  position: relative;
  z-index: 2;
`;

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1500px;
`;

const Card = styled(animated.div)`
  position: absolute;
  width: 320px;
  height: 500px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 20px;
  color: white;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(255, 105, 180, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 105, 180, 0.3);
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    box-shadow: 0 15px 40px rgba(255, 105, 180, 0.7);
    border: 1px solid rgba(255, 105, 180, 0.8);

    &::after {
      opacity: 1;
    }
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 105, 180, 0.2) 0%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #ff69b4;
  font-weight: bold;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 50px;
    height: 3px;
    background: linear-gradient(to right, #ff69b4, transparent);
  }
`;

const CardDescription = styled.p`
  font-size: 1rem;
  color: #e0e0e0;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const CardImageWrapper = styled.div`
  width: 100%;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 0.6) 100%
    );
  }
`;

const ViewButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 15px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #ff69b4, #c71585);
  color: white;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(255, 105, 180, 0.4);
  }

  svg {
    margin-left: 8px;
  }
`;

const NavigationButton = styled(motion.button)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: #ff69b4;
  border: 2px solid #ff69b4;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 105, 180, 0.2);
    transform: translateY(-50%) scale(1.1);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const PrevButton = styled(NavigationButton)`
  left: 5%;
`;

const NextButton = styled(NavigationButton)`
  right: 5%;
`;

const BackgroundBlob = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
  z-index: 1;
`;

const projects: Project[] = [
  {
    id: 1,
    title: "AI Image Generator",
    description:
      "Deep learning model that generates photorealistic images from text descriptions using neural networks.",
    image: "/ai-project.jpg",
    techStack: ["Python", "PyTorch", "React", "TensorFlow", "CUDA"],
    link: "https://example.com/project1",
  },
  {
    id: 2,
    title: "Blockchain Explorer",
    description:
      "Interactive visualization tool for exploring blockchain transactions and smart contracts in real-time.",
    image: "/blockchain-project.jpg",
    techStack: ["Ethereum", "JavaScript", "Web3.js", "D3.js", "GraphQL"],
    link: "https://example.com/project2",
  },
  {
    id: 3,
    title: "IoT Smart Home",
    description:
      "Smart home ecosystem connecting various devices with voice control, automation rules, and energy optimization.",
    image: "/iot-project.jpg",
    techStack: [
      "Raspberry Pi",
      "MQTT",
      "Node.js",
      "React Native",
      "TensorFlow Lite",
    ],
    link: "https://example.com/project3",
  },
  {
    id: 4,
    title: "Cybersecurity Suite",
    description:
      "Advanced vulnerability scanner and intrusion detection system with ML-powered threat analysis.",
    image: "/security-project.jpg",
    techStack: ["Python", "Docker", "Redis", "Express", "Rust"],
    link: "https://example.com/project4",
  },
  {
    id: 5,
    title: "Cloud Microservices",
    description:
      "High-availability microservices with automatic scaling, service discovery, and distributed tracing.",
    image: "/cloud-project.jpg",
    techStack: ["Kubernetes", "Docker", "Node.js", "MongoDB", "Istio"],
    link: "https://example.com/project5",
  },
];

const placeholderImages = [
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"%3E%3Crect width="100%25" height="100%25" fill="%23333"%3E%3C/rect%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="26px" fill="%23ff69b4"%3EAI Project%3C/text%3E%3C/svg%3E',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"%3E%3Crect width="100%25" height="100%25" fill="%23333"%3E%3C/rect%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="26px" fill="%23ff69b4"%3EBlockchain%3C/text%3E%3C/svg%3E',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"%3E%3Crect width="100%25" height="100%25" fill="%23333"%3E%3C/rect%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="26px" fill="%23ff69b4"%3EIoT Project%3C/text%3E%3C/svg%3E',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"%3E%3Crect width="100%25" height="100%25" fill="%23333"%3E%3C/rect%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="26px" fill="%23ff69b4"%3ECybersecurity%3C/text%3E%3C/svg%3E',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"%3E%3Crect width="100%25" height="100%25" fill="%23333"%3E%3C/rect%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="26px" fill="%23ff69b4"%3ECloud Services%3C/text%3E%3C/svg%3E',
];

const FeaturedProjects2: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  const calculateCardPosition = (index: number) => {
    const totalItems = projects.length;
    const theta = (2 * Math.PI) / totalItems;
    const radius = 500;

    let relativeIndex = (index - activeIndex + totalItems) % totalItems;

    if (relativeIndex > totalItems / 2) {
      relativeIndex = relativeIndex - totalItems;
    }

    const angle = relativeIndex * theta;
    const x = radius * Math.sin(angle);
    const z = radius * Math.cos(angle) - radius;

    const scale = Math.max(0.6, 1 - Math.abs(relativeIndex) * 0.15);
    const opacity =
      relativeIndex === 0
        ? 1
        : Math.max(0.4, 1 - Math.abs(relativeIndex) * 0.2);

    return {
      x,
      z,
      scale,
      opacity,
      rotateY: -angle * (180 / Math.PI),
    };
  };

  const cardSprings = useSprings(
    projects.length,
    projects.map((_, index) => {
      const { x, z, scale, opacity, rotateY } = calculateCardPosition(index);

      return {
        transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${scale})`,
        opacity,
        zIndex:
          index === activeIndex
            ? 10
            : 5 -
            Math.abs(
              (index - activeIndex + projects.length) % projects.length
            ),
        config: config.gentle,
      };
    })
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (autoRotate) {
      timer = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % projects.length);
      }, 5000);
    }

    return () => clearInterval(timer);
  }, [autoRotate]);

  const handleNext = () => {
    setAutoRotate(false);
    setActiveIndex((prevIndex) => (prevIndex + 1) % projects.length);
  };

  const handlePrev = () => {
    setAutoRotate(false);
    setActiveIndex(
      (prevIndex) => (prevIndex - 1 + projects.length) % projects.length
    );
  };

  const handleCardClick = (index: number) => {
    if (index === activeIndex) {
      window.open(projects[index].link, "_blank");
    } else {
      setAutoRotate(false);
      setActiveIndex(index);
    }
  };

  return (
    <FooterContainer>
      <BackgroundBlob
        animate={{
          x: [0, 100, -100, 0],
          y: [0, -100, 100, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          width: "400px",
          height: "400px",
          background: "linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)",
          top: "10%",
          left: "10%",
        }}
      />

      <BackgroundBlob
        animate={{
          x: [0, -150, 150, 0],
          y: [0, 100, -100, 0],
          scale: [1, 0.8, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          width: "350px",
          height: "350px",
          background: "linear-gradient(135deg, #c71585 0%, #db7093 100%)",
          bottom: "10%",
          right: "10%",
        }}
      />

      <BackgroundBlob
        animate={{
          x: [0, 120, -80, 0],
          y: [0, -80, 120, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          width: "300px",
          height: "300px",
          background: "linear-gradient(135deg, #db7093 0%, #ff69b4 100%)",
          bottom: "30%",
          left: "30%",
        }}
      />

      <CarouselTitle
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Featured Projects
      </CarouselTitle>

      <CarouselContainer>
        <PrevButton
          onClick={handlePrev}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </PrevButton>

        {projects.map((project, index) => (
          <Card
            key={project.id}
            style={cardSprings[index]}
            onClick={() => handleCardClick(index)}
          >
            <div>
              <CardImageWrapper>
                <Image
                  src={placeholderImages[index % placeholderImages.length]}
                  alt={project.title}
                  fill
                  style={{ objectFit: "cover" }}
                  quality={90}
                  placeholder="blur"
                  blurDataURL={
                    placeholderImages[index % placeholderImages.length]
                  }
                />
              </CardImageWrapper>

              <CardTitle>{project.title}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </div>

            <div>
              {/* <TechStack>
                {project.techStack.map((tech, i) => (
                  <TechTag key={i}>{tech}</TechTag>
                ))}
              </TechStack> */}

              {(index === activeIndex || 1) && (
                <ViewButton
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Project
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </ViewButton>
              )}
            </div>
          </Card>
        ))}

        <NextButton
          onClick={handleNext}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </NextButton>
      </CarouselContainer>
    </FooterContainer>
  );
};

export default FeaturedProjects2;
