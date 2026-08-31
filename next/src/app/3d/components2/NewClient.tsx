"use client";

import Link from "next/link";
import Image from "next/image";
import TVVideo from "./TVVideo";
import { Canvas } from "@react-three/fiber";
import ChairSpread from "./furniture/ChairSpread";
import React, { Suspense, useEffect, useRef, useState } from "react";

import * as THREE from "three";
import { Environment } from "@react-three/drei";

import Lighting from "./Lighting";
import NewModel from "./NewModel";
import CameraRig from "./CameraRig";
import ArcadeScreen from "./ArcadeScreen";
import ExperienceMode from "./experience/ExperienceMode";
import SceneCollision from "./experience/collision/SceneCollision"; // <-- IMPORTED HERE

import Fans from "./ceiling/Fans";
import CeilingLights from "./ceiling/CeilingLights";
import Windows from "./environment/Windows";
import Walls from "./environment/Walls";
import Floor from "./environment/Floor";
import Ceiling from "./environment/Ceiling";
import Clock from "./environment/Clock";
import Decorations from "./environment/Decorations";
import Plants from "./environment/Plants";

import Sofa from "./furniture/Sofa";
import Tables from "./furniture/Tables";
import Chairs from "./furniture/Chairs";
import Cushions from "./furniture/Cushions";

import PC from "./electronics/PC";
import Laptop from "./electronics/Laptop";
import TV from "./electronics/TV";
import AC from "./electronics/AC";
import Router from "./electronics/Router";
import Monitors from "./electronics/Monitors";
import Speakers from "./electronics/Speakers";
import Keyboard from "./electronics/Keyboard";
import Mouse from "./electronics/Mouse";

import ArcadeMachine from "./arcade/ArcadeMachine";
import ArcadeControls from "./arcade/ArcadeControls";
import { IProject } from "@/app/types/index.types";

type NewClientProps = {
  games?: IProject[];
};

export default function NewClient({ games = [] }: NewClientProps) {
  const [step, setStep] = useState(0);
  const totalSteps = 10;
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [experienceMode, setExperienceMode] = useState(false);
  const [interactionText, setInteractionText] = useState<string | null>(null);
  const [pointerLocked, setPointerLocked] = useState(false);
  const bgAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = bgAudioRef.current;
    if (!audio) return;
    if (experienceMode || isVideoPlaying) {
      audio.pause();
      return;
    }
    audio.play().catch(() => {});
  }, [experienceMode, isVideoPlaying]);

  const handleNext = () => {
    if (experienceMode) return;
    bgAudioRef.current?.play().catch(() => {});
    setStep((current) => Math.min(current + 1, totalSteps - 1));
  };

  const handlePrev = () => {
    if (experienceMode) return;
    bgAudioRef.current?.play().catch(() => {});
    setStep((current) => Math.max(current - 1, 0));
  };

  const enterExperience = () => {
    setInteractionText(null);
    setPointerLocked(false);
    setExperienceMode(true);
  };

  const exitExperience = () => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    setPointerLocked(false);
    setInteractionText(null);
    setExperienceMode(false);
  };

  const buttonStyle: React.CSSProperties = {
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    border: "1px solid rgba(34,197,94,0.4)",
    background: "rgba(34,197,94,0.12)",
    backdropFilter: "blur(10px)",
    color: "#4ADE80",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    transition: "all 0.2s ease",
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#000000" }}>
      <audio ref={bgAudioRef} src="/audios/background-song.m4a" loop preload="auto" />

      {!experienceMode && (
        <>
          <Link
            href="/"
            style={{
              position: "fixed",
              top: 14,
              right: 14,
              zIndex: 50,
              display: "block",
              width: 40,
              height: 40,
              borderRadius: "50%",
              overflow: "hidden",
              border: "1px solid rgba(236, 72, 153, 0.4)",
              boxShadow: "0 0 12px rgba(236, 72, 153, 0.3)",
              background: "rgba(10, 5, 12, 0.75)",
              transition: "all 0.2s ease",
            }}
            title="Back to CGS"
          >
            <Image
              src="/logo.png"
              alt="CGS"
              width={40}
              height={40}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Link>
          <div style={{ position: "absolute", left: "25px", bottom: "25px", zIndex: 50, display: "flex", gap: "12px", pointerEvents: "auto" }}>
            <button type="button" onClick={handlePrev} disabled={step === 0} style={{ ...buttonStyle, opacity: step === 0 ? 0.3 : 1 }}>←</button>
            <button type="button" onClick={handleNext} disabled={step === totalSteps - 1} style={{ ...buttonStyle, opacity: step === totalSteps - 1 ? 0.3 : 1 }}>→</button>
          </div>
          <div style={{ position: "absolute", left: "50%", bottom: "35px", transform: "translateX(-50%)", zIndex: 50, pointerEvents: "auto" }}>
            <button type="button" onClick={enterExperience} style={{ padding: "14px 28px", borderRadius: "12px", border: "1px solid rgba(34,197,94,0.5)", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(12px)", color: "#4ADE80", fontSize: "15px", fontWeight: 600, letterSpacing: "0.5px", cursor: "pointer", boxShadow: "0 8px 30px rgba(0,0,0,0.45)" }}>
              ENTER EXPERIENCE
            </button>
          </div>
        </>
      )}

      <Canvas 
        camera={{ position: [47.354, 38.470, 64.982], fov: 50, near: 0.1, far: 200 }} 
        gl={{ 
          antialias: true, 
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.8, 
          outputColorSpace: THREE.SRGBColorSpace
        }} 
        dpr={[1, 1.5]}
      >
        <color attach="background" args={["#000000"]} />
        <Lighting />
        {!experienceMode && <CameraRig step={step} />}

        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.4} />

          <NewModel />
          
          {/* GLOBALLY MOUNTED: Will hide proxies instantly & handle collision when enabled */}
          <SceneCollision enabled={experienceMode} />
          
          <Fans />
          <CeilingLights />
          <Windows />
          <Walls />
          <Floor />
          <Ceiling />
          <Clock />
          <Decorations />
          <Plants />
          <Sofa />
          <Tables />
          <Chairs />
          <Cushions />
          {!experienceMode && <ChairSpread step={step} />}
          <PC />
          <Laptop />
          <TV />
          <AC />
          <Router />
          <Monitors />
          <Speakers />
          <Keyboard />
          <Mouse />
          <ArcadeMachine />
          <ArcadeControls />

          {experienceMode && (
            <ExperienceMode enabled={experienceMode} onInteractionChange={setInteractionText} onPointerLockChange={setPointerLocked} />
          )}
        </Suspense>

        {!experienceMode && <TVVideo step={step} isPlaying={isVideoPlaying} setIsPlaying={setIsVideoPlaying} />}
        {!experienceMode && games.length > 0 && <ArcadeScreen step={step} games={games} />}
      </Canvas>

      {experienceMode && (
        <>
          <div style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: "7px", height: "7px", borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 0 10px #EC4899, 0 0 20px rgba(236, 72, 153, 0.8)", pointerEvents: "none", zIndex: 100 }} />
          {interactionText && (
            <div
              style={{
                position: "fixed",
                left: "50%",
                top: "calc(50% + 38px)",
                transform: "translateX(-50%)",
                padding: interactionText.includes("⛔") || interactionText.includes("⚠️") ? "12px 24px" : "9px 18px",
                borderRadius: "10px",
                background: interactionText.includes("⛔") || interactionText.includes("⚠️")
                  ? "rgba(18, 5, 16, 0.94)"
                  : "rgba(10, 8, 14, 0.88)",
                border: interactionText.includes("⛔") || interactionText.includes("⚠️")
                  ? "1.5px solid #EC4899"
                  : "1px solid rgba(236, 72, 153, 0.5)",
                boxShadow: interactionText.includes("⛔") || interactionText.includes("⚠️")
                  ? "0 0 25px rgba(236, 72, 153, 0.6), inset 0 0 12px rgba(236, 72, 153, 0.25)"
                  : "0 4px 18px rgba(0,0,0,0.6)",
                backdropFilter: "blur(12px)",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.8px",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                zIndex: 101,
              }}
            >
              {interactionText}
            </div>
          )}
          {!pointerLocked && (
            <div style={{ position: "fixed", left: "50%", top: "calc(50% + 85px)", transform: "translateX(-50%)", padding: "8px 14px", borderRadius: "8px", background: "rgba(10, 5, 12, 0.75)", border: "1px solid rgba(236, 72, 153, 0.4)", color: "rgba(255,255,255,0.85)", fontSize: "12px", pointerEvents: "none", zIndex: 101, letterSpacing: "1px", textTransform: "uppercase" }}>
              CLICK THE SCENE TO LOOK AROUND
            </div>
          )}
          <div style={{ position: "fixed", top: "25px", right: "25px", zIndex: 110, pointerEvents: "auto" }}>
            <button type="button" onClick={exitExperience} style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid rgba(236, 72, 153, 0.5)", background: "rgba(10, 5, 12, 0.8)", backdropFilter: "blur(10px)", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", boxShadow: "0 0 15px rgba(236, 72, 153, 0.3)" }}>
              EXIT EXPERIENCE
            </button>
          </div>
          <div style={{ position: "fixed", left: "25px", bottom: "25px", zIndex: 110, padding: "12px 18px", borderRadius: "10px", background: "rgba(10, 5, 14, 0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(236, 72, 153, 0.4)", color: "rgba(255,255,255,0.9)", fontSize: "12px", lineHeight: "1.8", pointerEvents: "none", boxShadow: "0 0 20px rgba(0,0,0,0.6)" }}>
            <div><strong style={{ color: "#EC4899" }}>WASD</strong> Move</div>
            <div><strong style={{ color: "#EC4899" }}>SHIFT + WASD</strong> Sprint (2x Speed)</div>
            <div><strong style={{ color: "#EC4899" }}>MOUSE</strong> Look</div>
            <div><strong style={{ color: "#EC4899" }}>O</strong> Interact / Doors</div>
            <div><strong style={{ color: "#EC4899" }}>ENTER</strong> Play Video</div>
            <div><strong style={{ color: "#EC4899" }}>SPACE</strong> Pause / Resume Video</div>
            <div><strong style={{ color: "#EC4899" }}>ESC</strong> Release Mouse</div>
            <div><strong style={{ color: "#EC4899" }}>SCROLL WHEEL</strong> Speed (+ / -)</div>
          </div>
        </>
      )}
    </div>
  );
}