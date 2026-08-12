"use client";

import TVVideo from "./TVVideo";
import { Canvas } from "@react-three/fiber";
import React, { Suspense, useState, useRef, useEffect } from "react";
import Lighting from "./Lighting"; 
import NewModel from "./NewModel"; 
import CameraRig from "./CameraRig";
import ArcadeScreen from "./ArcadeScreen";
import { IProject } from "@/app/types/index.types";

export default function NewClient({ games = [] }: { games?: IProject[] }) {
  const [step, setStep] = useState(0);
  const totalSteps = 10; 
  
  // 1. Create state to track the TV Video, and a ref for our background audio
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const bgAudioRef = useRef<HTMLAudioElement>(null);

  // 2. Logic to pause BGM when video plays, and resume BGM when video stops
  useEffect(() => {
    if (bgAudioRef.current) {
      if (isVideoPlaying) {
        bgAudioRef.current.pause();
      } else {
        // The browser might block this on initial page load if the user hasn't clicked anything yet
        bgAudioRef.current.play().catch(() => console.log("Waiting for user interaction to play background music."));
      }
    }
  }, [isVideoPlaying]);

  const handleNext = () => {
    // 3. Force audio to start playing on the first click if the browser blocked autoplay
    if (!isVideoPlaying) bgAudioRef.current?.play().catch(() => {});
    if (step < totalSteps - 1) setStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (!isVideoPlaying) bgAudioRef.current?.play().catch(() => {});
    if (step > 0) setStep((s) => s - 1);
  };

  const buttonStyle: React.CSSProperties = {
    pointerEvents: "auto",
    cursor: "pointer",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(34, 197, 94, 0.4)",
    borderRadius: "50%",
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
    transition: "opacity 0.3s ease, background-color 0.2s ease, transform 0.2s ease",
    color: "#4ADE80"
  };

  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "#000", position: "relative" }}>
      
      {/* 4. The hidden audio element. UPDATE THE SRC TO YOUR SONG! */}
      <audio 
        ref={bgAudioRef} 
        src="audios/background-song.m4a" 
        loop 
      />

      <div 
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          transform: "translateY(-50%)",
          display: "flex",
          justifyContent: "space-between",
          padding: "0 40px",
          pointerEvents: "none", 
          zIndex: 10 
        }}
      >
        <button 
          onClick={handlePrev} 
          disabled={step === 0}
          style={{
            ...buttonStyle,
            opacity: step === 0 ? 0 : 1, 
            transform: step === 0 ? "scale(0.8)" : "scale(1)",
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(34, 197, 94, 0.35)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(34, 197, 94, 0.15)"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <button 
          onClick={handleNext} 
          disabled={step === totalSteps - 1}
          style={{
            ...buttonStyle,
            opacity: step === totalSteps - 1 ? 0 : 1, 
            transform: step === totalSteps - 1 ? "scale(0.8)" : "scale(1)",
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(34, 197, 94, 0.35)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(34, 197, 94, 0.15)"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <Canvas>
        <color attach="background" args={["#000000"]} />
        <Lighting />
        
        <CameraRig step={step} />

        {/* 5. Pass the new state variables as props to TVVideo */}
        <TVVideo 
          step={step} 
          isPlaying={isVideoPlaying} 
          setIsPlaying={setIsVideoPlaying} 
        />
        <ArcadeScreen step={step} games={games} />
        <Suspense fallback={null}>
          <NewModel />
        </Suspense>
      </Canvas>
    </div>
  );
}