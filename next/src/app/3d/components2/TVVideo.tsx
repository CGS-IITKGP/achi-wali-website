"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";

// 1. Accept isPlaying and setIsPlaying as props from the parent
export default function TVVideo({ 
  step, 
  isPlaying, 
  setIsPlaying 
}: { 
  step: number; 
  isPlaying: boolean; 
  setIsPlaying: (val: boolean) => void;
}) {
  
  const [video] = useState(() => {
    const vid = document.createElement("video");
    vid.src = "videos/cgs.mp4"; 
    vid.crossOrigin = "Anonymous";
    vid.loop = true;
    vid.muted = false; 
    vid.playsInline = true;
    return vid;
  });

  useEffect(() => {
    if (step !== 3) {
      video.pause();
      setIsPlaying(false); // Tell the parent the video stopped
    }
  }, [step, video, setIsPlaying]);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    video.play().then(() => {
      setIsPlaying(true); // Tell the parent the video started
    }).catch((err) => {
      console.log("Video playback failed:", err);
    });
  };

  const handlePause = (e: any) => {
    e.stopPropagation();
    if (isPlaying) {
      video.pause();
      setIsPlaying(false); // Tell the parent the video stopped
    }
  };

  return (
    <group position={[-0.201, 40.450, 32.530]}>
      <mesh scale={[-1, 1, 1]} onClick={handlePause}>
        <planeGeometry args={[30, 12]} /> 
        <meshBasicMaterial side={THREE.DoubleSide} toneMapped={false}>
          <videoTexture attach="map" args={[video]} />
        </meshBasicMaterial>
      </mesh>

      {step === 3 && !isPlaying && (
        <Html
          position={[0, 0, 0.5]} 
          center
          transform 
          zIndexRange={[100, 0]}
        >
          <button
            onClick={handlePlay}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              border: "3px solid white",
              borderRadius: "50%",
              width: "80px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "white",
              transition: "transform 0.2s ease, background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.backgroundColor = "rgba(255, 0, 0, 0.8)"; 
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "5px" }}>
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </Html>
      )}
    </group>
  );
}