"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

const DEMO_VIDEO_PATH = "/videos/demo.mp4";
const MAIN_VIDEO_PATH = "/videos/cgs.mp4";

const TV_OBJECT_NAME = "Cube";
const TV_MATERIAL_NAME = "TV_Display";

// ==========================================
// 💻 LAPTOP SCREEN FIT SETTINGS
// ==========================================
const LAPTOP_SCALE_X = 2.25; 
const LAPTOP_SCALE_Y = 3.2; 
const LAPTOP_OFFSET_X = -0.08; 
const LAPTOP_OFFSET_Y = 0.0; 

// ==========================================
// 📺 TV SCREEN FIT SETTINGS
// ==========================================
const TV_SCALE_X = 4.8; 
const TV_SCALE_Y = 5.0; 
const TV_OFFSET_X = -1.75; 
const TV_OFFSET_Y = 0.0; 
// ==========================================

type VideoInteractionProps = {
  enabled: boolean;
};

// Find TV screen mesh
function findTVScreen(scene: THREE.Object3D): THREE.Mesh | null {
  const tvGroup = scene.getObjectByName(TV_OBJECT_NAME);
  if (!tvGroup) return null;

  let bestScreen: THREE.Mesh | null = null;

  tvGroup.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      const hasTVMaterial = materials.some(
        (material) => material.name.trim().toLowerCase() === TV_MATERIAL_NAME.toLowerCase()
      );
      if (hasTVMaterial) bestScreen = object;
    }
  });

  if (!bestScreen) {
    bestScreen = tvGroup.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh || null;
  }

  return bestScreen;
}

// Find Laptop screen mesh
function findLaptopScreen(scene: THREE.Object3D): THREE.Mesh | null {
  const laptopGroup = scene.getObjectByName("Lenovo laptop") || scene.getObjectByName("Lenovo_laptop");
  if (!laptopGroup) return null;

  let screenMesh: THREE.Mesh | null = null;

  laptopGroup.traverse((object) => {
    if (object instanceof THREE.Mesh && object.name.toUpperCase().includes("SCREEN")) {
      screenMesh = object;
    }
  });

  if (!screenMesh) {
    screenMesh = laptopGroup.children.find(child => child instanceof THREE.Mesh && child.name === "Mesh_1") as THREE.Mesh || null;
  }

  return screenMesh;
}

export default function VideoInteraction({
  enabled,
}: VideoInteractionProps) {
  const { scene, camera } = useThree();

  const tvMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const laptopMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  
  const demoVideoRef = useRef<HTMLVideoElement | null>(null);
  const mainVideoRef = useRef<HTMLVideoElement | null>(null);
  
  const tvDemoTextureRef = useRef<THREE.VideoTexture | null>(null);
  const laptopDemoTextureRef = useRef<THREE.VideoTexture | null>(null);
  const tvMainTextureRef = useRef<THREE.VideoTexture | null>(null);
  const laptopMainTextureRef = useRef<THREE.VideoTexture | null>(null);
  
  const isMainPlayingRef = useRef(false);
  const inLaptopRadarRef = useRef(false);

  const [laptopWorldPos, setLaptopWorldPos] = useState<THREE.Vector3 | null>(null);
  const [promptState, setPromptState] = useState<"hidden" | "far" | "near">("hidden");
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      tvMaterialsRef.current = [];
      laptopMaterialsRef.current = [];
      inLaptopRadarRef.current = false;
      setPromptState("hidden");
      setNotification(null);
      return;
    }

    const tvScreen = findTVScreen(scene);
    const laptopScreen = findLaptopScreen(scene);
    
    if (tvScreen) {
      const mats = Array.isArray(tvScreen.material) ? tvScreen.material : [tvScreen.material];
      tvMaterialsRef.current = mats.filter(m => m instanceof THREE.MeshStandardMaterial) as THREE.MeshStandardMaterial[];
    }
    
    if (laptopScreen) {
      const mats = Array.isArray(laptopScreen.material) ? laptopScreen.material : [laptopScreen.material];
      laptopMaterialsRef.current = mats.filter(m => m instanceof THREE.MeshStandardMaterial) as THREE.MeshStandardMaterial[];
      
      const wp = new THREE.Vector3();
      laptopScreen.getWorldPosition(wp);
      wp.y += 2.4; // raised higher so the marker floats clearly above the laptop, no clash
      setLaptopWorldPos(wp);
    }

    return () => {
      tvMaterialsRef.current = [];
      laptopMaterialsRef.current = [];
      inLaptopRadarRef.current = false;
      setPromptState("hidden");
      setNotification(null);
    };
  }, [enabled, scene]);

  useEffect(() => {
    if (!enabled) return;

    // --- DEMO VIDEO SETUP ---
    const demoVideo = document.createElement("video");
    demoVideo.src = DEMO_VIDEO_PATH;
    demoVideo.crossOrigin = "anonymous";
    demoVideo.loop = true;
    demoVideo.muted = false;
    demoVideo.playsInline = true;
    demoVideoRef.current = demoVideo;

    // ==========================================
    // TV TEXTURE (Scaling & Fitting)
    // ==========================================
    const tvDemoTex = new THREE.VideoTexture(demoVideo);
    tvDemoTex.colorSpace = THREE.SRGBColorSpace;
    tvDemoTex.flipY = false;
    tvDemoTex.center.set(0.5, 0.5); 
    tvDemoTex.rotation = Math.PI / 2; 
    tvDemoTex.wrapS = THREE.ClampToEdgeWrapping;
    tvDemoTex.wrapT = THREE.ClampToEdgeWrapping;
    tvDemoTex.repeat.set(TV_SCALE_X, TV_SCALE_Y); 
    tvDemoTex.offset.set(TV_OFFSET_X, TV_OFFSET_Y); 

    // ==========================================
    // LAPTOP TEXTURE (Scaling & Fitting)
    // ==========================================
    const laptopDemoTex = new THREE.VideoTexture(demoVideo);
    laptopDemoTex.colorSpace = THREE.SRGBColorSpace;
    laptopDemoTex.flipY = false;
    laptopDemoTex.wrapS = THREE.ClampToEdgeWrapping; 
    laptopDemoTex.wrapT = THREE.ClampToEdgeWrapping;
    laptopDemoTex.repeat.set(LAPTOP_SCALE_X, LAPTOP_SCALE_Y); 
    laptopDemoTex.offset.set(LAPTOP_OFFSET_X, LAPTOP_OFFSET_Y); 

    tvDemoTextureRef.current = tvDemoTex;
    laptopDemoTextureRef.current = laptopDemoTex;

    // --- MAIN VIDEO SETUP ---
    const mainVideo = document.createElement("video");
    mainVideo.src = MAIN_VIDEO_PATH;
    mainVideo.crossOrigin = "anonymous";
    mainVideo.loop = true;
    mainVideo.muted = false; 
    mainVideo.playsInline = true;
    mainVideoRef.current = mainVideo;

    // TV Main Texture (Scaling & Fitting)
    const tvMainTex = new THREE.VideoTexture(mainVideo);
    tvMainTex.colorSpace = THREE.SRGBColorSpace;
    tvMainTex.flipY = false; 
    tvMainTex.center.set(0.5, 0.5);
    tvMainTex.rotation = Math.PI / 2;
    tvMainTex.wrapS = THREE.ClampToEdgeWrapping;
    tvMainTex.wrapT = THREE.ClampToEdgeWrapping;
    tvMainTex.repeat.set(TV_SCALE_X, TV_SCALE_Y); 
    tvMainTex.offset.set(TV_OFFSET_X, TV_OFFSET_Y); 

    // Laptop Main Texture (Scaling & Fitting)
    const laptopMainTex = new THREE.VideoTexture(mainVideo);
    laptopMainTex.colorSpace = THREE.SRGBColorSpace;
    laptopMainTex.flipY = false;
    laptopMainTex.wrapS = THREE.ClampToEdgeWrapping;
    laptopMainTex.wrapT = THREE.ClampToEdgeWrapping;
    laptopMainTex.repeat.set(LAPTOP_SCALE_X, LAPTOP_SCALE_Y); 
    laptopMainTex.offset.set(LAPTOP_OFFSET_X, LAPTOP_OFFSET_Y); 

    tvMainTextureRef.current = tvMainTex;
    laptopMainTextureRef.current = laptopMainTex;

    demoVideo.play().then(() => {
      applyTextures(false);
    }).catch(e => {
      if (e.name !== 'AbortError') console.log("Demo video autoplay blocked", e);
    });

    return () => {
      demoVideo.pause();
      demoVideo.removeAttribute("src");
      demoVideo.load();
      tvDemoTex.dispose();
      laptopDemoTex.dispose();

      mainVideo.pause();
      mainVideo.removeAttribute("src");
      mainVideo.load();
      tvMainTex.dispose();
      laptopMainTex.dispose();
    };
  }, [enabled]);

  const applyTextures = useCallback((isMain: boolean) => {
    const tvTex = isMain ? tvMainTextureRef.current : tvDemoTextureRef.current;
    const laptopTex = isMain ? laptopMainTextureRef.current : laptopDemoTextureRef.current;

    if (tvTex) {
      tvMaterialsRef.current.forEach((material) => {
        material.map = tvTex;
        material.color.set(0xffffff);
        material.needsUpdate = true;
      });
    }

    if (laptopTex) {
      laptopMaterialsRef.current.forEach((material) => {
        material.map = laptopTex;
        material.color.set(0xffffff);
        material.needsUpdate = true;
      });
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.code !== "Enter") return;
      if (event.repeat) return;
      
      if (!inLaptopRadarRef.current) return;

      const demoVid = demoVideoRef.current;
      const mainVid = mainVideoRef.current;

      if (!demoVid || !mainVid) return;

      if (isMainPlayingRef.current) {
        mainVid.pause();
        applyTextures(false);
        demoVid.currentTime = 0;
        await demoVid.play().catch(()=>{});
        isMainPlayingRef.current = false;
      } else {
        demoVid.pause();
        applyTextures(true);
        mainVid.currentTime = 0; 
        await mainVid.play().catch(()=>{}); 
        isMainPlayingRef.current = true;
        
        setNotification("▶ WATCH THE MAIN TV SCREEN!");
        setTimeout(() => {
          setNotification(null);
        }, 4500);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, applyTextures]);

  useFrame(() => {
    if (!enabled || !laptopWorldPos) return;

    const dx = camera.position.x - laptopWorldPos.x;
    const dz = camera.position.z - laptopWorldPos.z;
    const dist2D = Math.sqrt(dx * dx + dz * dz);

    // --- STOP MAIN VIDEO IF USER LEAVES THE ROOM/RANGE ---
    if (isMainPlayingRef.current && dist2D > 45.0) {
      const demoVid = demoVideoRef.current;
      const mainVid = mainVideoRef.current;

      if (demoVid && mainVid) {
        mainVid.pause();
        applyTextures(false);
        demoVid.currentTime = 0;
        demoVid.play().catch(() => {});
        isMainPlayingRef.current = false;
      }
    }

    let nextState: "hidden" | "far" | "near" = "hidden";

    if (isMainPlayingRef.current) {
      nextState = "hidden";
      inLaptopRadarRef.current = false;
    } else if (dist2D <= 7.5) {
      nextState = "near";
      inLaptopRadarRef.current = true;
    } else if (dist2D <= 45.0) {
      nextState = "far";
      inLaptopRadarRef.current = false;
    } else {
      nextState = "hidden";
      inLaptopRadarRef.current = false;
    }

    if (nextState !== promptState) {
      setPromptState(nextState);
    }
  });

  return (
    <>
      <Html>
        <style>
          {`
            /* ==========================================
               WAYPOINT PIN - bounces + blinks like a
               battle-royale style "come here" marker
               ========================================== */
            @keyframes pinBounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-16px); }
            }
            @keyframes pinBlink {
              0%, 100% {
                filter: drop-shadow(0 0 6px rgba(37, 99, 235, 0.85))
                        drop-shadow(0 0 14px rgba(59, 130, 246, 0.6));
                opacity: 1;
              }
              50% {
                filter: drop-shadow(0 0 14px rgba(37, 99, 235, 1))
                        drop-shadow(0 0 26px rgba(59, 130, 246, 0.9));
                opacity: 0.7;
              }
            }
            @keyframes groundShadowPulse {
              0%, 100% { transform: scaleX(1); opacity: 0.35; }
              50% { transform: scaleX(0.65); opacity: 0.18; }
            }
            @keyframes radarPulse {
              0% { transform: scale(0.3); opacity: 0.8; }
              100% { transform: scale(2.2); opacity: 0; }
            }
            @keyframes enterLabelPulse {
              0%, 100% { opacity: 1; transform: translateY(0); }
              50% { opacity: 0.55; transform: translateY(2px); }
            }

            .waypoint-wrap {
              position: relative;
              display: flex;
              flex-direction: column;
              align-items: center;
              pointer-events: none;
              transform: scale(2);
              transform-origin: bottom center;
            }

            .waypoint-bounce {
              animation: pinBounce 0.9s ease-in-out infinite;
            }

            .waypoint-pin-svg {
              display: block;
              animation: pinBlink 1.1s ease-in-out infinite;
            }

            .waypoint-ground {
              position: relative;
              width: 46px;
              height: 14px;
              margin-top: -6px;
            }

            .waypoint-ground-shadow {
              position: absolute;
              left: 50%;
              top: 0;
              width: 42px;
              height: 12px;
              background: radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%);
              border-radius: 50%;
              transform: translateX(-50%);
              animation: groundShadowPulse 0.9s ease-in-out infinite;
            }

            .waypoint-radar-ring {
              position: absolute;
              left: 50%;
              top: 50%;
              width: 40px;
              height: 40px;
              margin-left: -20px;
              margin-top: -20px;
              border-radius: 50%;
              border: 2px solid #3b82f6;
              animation: radarPulse 1.8s ease-out infinite;
            }

            .waypoint-radar-ring.delay {
              animation-delay: 0.9s;
            }

            .waypoint-enter-label {
              margin-top: 10px;
              padding: 6px 16px;
              background: rgba(10, 20, 40, 0.85);
              border: 1px solid rgba(59, 130, 246, 0.6);
              border-radius: 20px;
              color: #ffffff;
              font-family: 'Inter', 'Segoe UI', sans-serif;
              font-weight: 700;
              font-size: 13px;
              letter-spacing: 1px;
              text-transform: uppercase;
              box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);
              animation: enterLabelPulse 1s ease-in-out infinite;
              white-space: nowrap;
            }

            .mario-notification-box {
              background: #FBD000;
              border: 4px solid #000000;
              box-shadow: 8px 8px 0px #000000;
              font-family: 'Courier New', Courier, monospace;
              color: #000000;
              font-weight: 900;
              padding: 16px 32px;
              text-transform: uppercase;
              border-radius: 4px;
              letter-spacing: 1px;
            }
          `}
        </style>
      </Html>

      {laptopWorldPos && promptState !== "hidden" && (
        <group position={laptopWorldPos}>
          <Html center distanceFactor={promptState === "near" ? 9 : 16} zIndexRange={[100, 0]}>
            <div className="waypoint-wrap">
              <div className="waypoint-bounce">
                <svg
                  className="waypoint-pin-svg"
                  width={promptState === "near" ? 40 : 60}
                  height={promptState === "near" ? 52 : 78}
                  viewBox="0 0 40 52"
                >
                  <path
                    d="M20 0C9 0 0 9 0 20c0 14 20 32 20 32s20-18 20-32C40 9 31 0 20 0z"
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth="3"
                  />
                  <circle cx="20" cy="19" r="8" fill="#ffffff" />
                </svg>
              </div>

              <div className="waypoint-ground">
                <div className="waypoint-radar-ring" />
                <div className="waypoint-radar-ring delay" />
                <div className="waypoint-ground-shadow" />
              </div>

              {promptState === "near" && (
                <div className="waypoint-enter-label">PRESS [ENTER]</div>
              )}
            </div>
          </Html>
        </group>
      )}

      {notification && (
        <Html fullscreen zIndexRange={[200, 0]}>
          <div style={{ position: 'fixed', bottom: '25%', left: '50%', transform: 'translateX(-50%)' }}>
            <div className="mario-notification-box" style={{ fontSize: "22px" }}>
              {notification}
            </div>
          </div>
        </Html>
      )}
    </>
  );
}