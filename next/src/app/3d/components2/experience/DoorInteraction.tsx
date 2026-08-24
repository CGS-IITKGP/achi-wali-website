"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

// FIX: Increased from 5 to 10. Agar aur door se interact karna ho toh ise 12 ya 15 kar lena!
const INTERACTION_DISTANCE = 10;
const LABEL_HEIGHT_OFFSET = 2.3;

const DOOR_NAMES = [
  "DOOR01", "DOOR02", "DOOR03", "DOOR04", "DOOR05", "DOOR06", "DOOR07",
  "MAINDOOR01", "MAINDOOR02", "MAINDOOR03", "MAINDOOR04",
] as const;

const NORMAL_DOOR = "DOOR01";
const RND_DOOR = "DOOR07";
const MAIN_LEFT = "MAINDOOR01";
const MAIN_RIGHT = "MAINDOOR02";
const WAYFINDER_DOOR = "DOOR04"; 

const RESTRICTED_DOORS = [
  "DOOR02", "DOOR03", "DOOR04", "DOOR05", "DOOR06",
];

const RESTRICTED_MAIN_DOORS = [
  "MAINDOOR03", "MAINDOOR04",
];

const MAIN_RIGHT_ANGLE = THREE.MathUtils.degToRad(-75); 
const NORMAL_DOOR_ANGLE = THREE.MathUtils.degToRad(90);

// ==========================================
// SceneCollision.tsx exposes this global so DoorInteraction can
// directly tell it "this door is open, disable the matching proxy".
// This bypasses transform/rotation guessing entirely - it's a direct,
// guaranteed signal fired at the exact moment the door is toggled.
// ==========================================
type CollisionDoorKey = "DOOR01" | "DOOR07" | "MAINDOOR";

declare global {
  interface Window {
    __setDoorOpen?: (doorKey: CollisionDoorKey, isOpen: boolean) => void;
    __clearDoorOverride?: (doorKey: CollisionDoorKey) => void;
  }
}

type DoorState = {
  object: THREE.Object3D;
  closedRotation: number;
  targetRotation: number;
  open: boolean;
};

type DoorInteractionProps = {
  enabled: boolean;
  onInteractionChange?: (text: string | null) => void;
};

export default function DoorInteraction({
  enabled,
  onInteractionChange,
}: DoorInteractionProps) {
  const { scene, camera } = useThree();

  const doorsRef = useRef<Record<string, DoorState>>({});
  const activeDoorRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  const raycasterRef = useRef(new THREE.Raycaster());
  const centerPointerRef = useRef(new THREE.Vector2(0, 0));

  const promptAnchorRef = useRef<THREE.Group>(null);
  const wayfinderAnchorRef = useRef<THREE.Group>(null);
  const door01AnchorRef = useRef<THREE.Group>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [promptText, setPromptText] = useState<string | null>(null);
  const [isMainDoorOpen, setIsMainDoorOpen] = useState(false);
  const [isRoom1Open, setIsRoom1Open] = useState(false);

  const initializeDoors = useCallback(() => {
    const registered: Record<string, DoorState> = {};

    for (const name of DOOR_NAMES) {
      const object = scene.getObjectByName(name);
      if (!object) continue;

      registered[name] = {
        object,
        closedRotation: object.rotation.y,
        targetRotation: object.rotation.y,
        open: false,
      };
    }

    doorsRef.current = registered;
    initializedRef.current = true;

    if (registered[WAYFINDER_DOOR] && wayfinderAnchorRef.current) {
      const wp = new THREE.Vector3();
      registered[WAYFINDER_DOOR].object.getWorldPosition(wp);
      wp.y += 3.5; 
      wayfinderAnchorRef.current.position.copy(wp);
    }

    if (registered[NORMAL_DOOR] && door01AnchorRef.current) {
      const wp = new THREE.Vector3();
      registered[NORMAL_DOOR].object.getWorldPosition(wp);
      
      // FIX: Increased height (achi khasi height)
      wp.y += 4.5; 
      
      // FIX: Acha khasa right shift (Z-axis offset)
      wp.z -= 15.5; 
      
      door01AnchorRef.current.position.copy(wp);
    }
  }, [scene]);

  useEffect(() => {
    if (!enabled) {
      activeDoorRef.current = null;
      initializedRef.current = false;
      doorsRef.current = {};
      setPromptText(null);
      setIsMainDoorOpen(false);
      setIsRoom1Open(false);
      onInteractionChange?.(null);
      return;
    }
    const frame = requestAnimationFrame(() => initializeDoors());
    return () => cancelAnimationFrame(frame);
  }, [enabled, initializeDoors, onInteractionChange]);

  // Audio references for Door and Restricted sounds
  const doorAudioRef = useRef<HTMLAudioElement | null>(null);
  const fahhAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const doorSound = new Audio("/music/door.mp3");
      doorSound.preload = "auto";
      doorAudioRef.current = doorSound;

      const fahhSound = new Audio("/music/fahh.mp3");
      fahhSound.preload = "auto";
      fahhAudioRef.current = fahhSound;
    }
  }, []);

  const playDoorSound = useCallback(() => {
    if (doorAudioRef.current) {
      doorAudioRef.current.currentTime = 0;
      doorAudioRef.current.play().catch(() => {});
    }
  }, []);

  const playFahhSound = useCallback(() => {
    if (fahhAudioRef.current) {
      fahhAudioRef.current.currentTime = 0;
      fahhAudioRef.current.play().catch(() => {});
    }
  }, []);

  const getPrompt = useCallback((name: string) => {
    if (name === NORMAL_DOOR) {
      const door = doorsRef.current[NORMAL_DOOR];
      return door?.open ? "[O] Close Door" : "[O] Open Door";
    }
    if (RESTRICTED_DOORS.includes(name) || name === RND_DOOR || RESTRICTED_MAIN_DOORS.includes(name)) {
      return "[O] Check Security Clearance";
    }
    if (name === MAIN_LEFT || name === MAIN_RIGHT) {
      const door = doorsRef.current[MAIN_RIGHT];
      return door?.open ? "[O] Close Door" : "[O] Open Door";
    }
    return null;
  }, []);

  const getMessage = useCallback((name: string) => {
    if (RESTRICTED_DOORS.includes(name)) {
      return "⛔ [SECURITY CLEARANCE REQUIRED] High-Security Sector — Join CGS to Decrypt & Explore!";
    }
    if (name === RND_DOOR) {
      return "⚠️ [CLASSIFIED - LEVEL 5 CLEARANCE] R&D Quantum Lab: Experimental Shaders & Physics in Progress... KEEP OUT!";
    }
    if (RESTRICTED_MAIN_DOORS.includes(name)) {
      return "⛔ [EMERGENCY AIRLOCK SEALED] Exit Hatchway Locked: Please Use Designated Main Airlock!";
    }
    return null;
  }, []);

  const toggleMainDoor = useCallback(() => {
    const right = doorsRef.current[MAIN_RIGHT];
    if (!right) return;
    const shouldOpen = !right.open;
    right.open = shouldOpen;
    right.targetRotation = right.closedRotation + (shouldOpen ? MAIN_RIGHT_ANGLE : 0);
    
    setIsMainDoorOpen(shouldOpen); 

    // Play door sound effect
    playDoorSound();

    // NEW: tell SceneCollision directly, no transform-guessing needed
    window.__setDoorOpen?.("MAINDOOR", shouldOpen);

    onInteractionChange?.(shouldOpen ? "[O] Close Door" : "[O] Open Door");
    setPromptText(shouldOpen ? "[O] Close Door" : "[O] Open Door");
  }, [onInteractionChange, playDoorSound]);

  const toggleDoor01 = useCallback(() => {
    const door = doorsRef.current[NORMAL_DOOR];
    if (!door) return;
    const shouldOpen = !door.open;
    door.open = shouldOpen;
    door.targetRotation = door.closedRotation + (shouldOpen ? NORMAL_DOOR_ANGLE : 0);
    
    setIsRoom1Open(shouldOpen); 

    // Play door sound effect
    playDoorSound();

    // NEW: tell SceneCollision directly, no transform-guessing needed
    window.__setDoorOpen?.("DOOR01", shouldOpen);

    onInteractionChange?.(shouldOpen ? "[O] Close Door" : "[O] Open Door");
    setPromptText(shouldOpen ? "[O] Close Door" : "[O] Open Door");
  }, [onInteractionChange, playDoorSound]);

  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "o") return;
      if (event.repeat) return;
      const active = activeDoorRef.current;
      if (!active) return;
      if (active === NORMAL_DOOR) return toggleDoor01();
      if (active === MAIN_LEFT || active === MAIN_RIGHT) return toggleMainDoor();

      // Restricted door attempted -> play Fahh sound effect
      playFahhSound();

      const message = getMessage(active);
      if (message) {
        onInteractionChange?.(message);
        setPromptText(message);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, toggleDoor01, toggleMainDoor, getMessage, onInteractionChange, playFahhSound]);

  useFrame((_, delta) => {
    if (!enabled || !initializedRef.current) return;

    Object.values(doorsRef.current).forEach((door) => {
      door.object.rotation.y = THREE.MathUtils.damp(
        door.object.rotation.y, door.targetRotation, 9, delta
      );
    });

    camera.updateMatrixWorld(true);
    raycasterRef.current.setFromCamera(centerPointerRef.current, camera);
    const doorObjects = Object.values(doorsRef.current).map((door) => door.object);
    const intersections = raycasterRef.current.intersectObjects(doorObjects, true);

    let target: string | null = null;
    for (const intersection of intersections) {
      let current: THREE.Object3D | null = intersection.object;
      while (current) {
        const name = current.name.trim();
        if (doorsRef.current[name]) {
          if (intersection.distance <= INTERACTION_DISTANCE) target = name;
          break;
        }
        current = current.parent;
      }
      if (target) break;
    }

    if (target !== activeDoorRef.current) {
      activeDoorRef.current = target;
      if (!target) {
        onInteractionChange?.(null);
        setPromptText(null);
        return;
      }
      const door = doorsRef.current[target];
      if (door && promptAnchorRef.current) {
        const wp = new THREE.Vector3();
        door.object.getWorldPosition(wp);
        wp.y += LABEL_HEIGHT_OFFSET;
        promptAnchorRef.current.position.copy(wp);
      }
      const prompt = getPrompt(target);
      onInteractionChange?.(prompt);
      setPromptText(prompt);
    }
  });

  return (
    <>
      <Html>
        <style>
          {`
            @keyframes smoothFloat {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            @keyframes cgsMagentaPulse {
              0%, 100% {
                box-shadow: 0 0 25px rgba(236, 72, 153, 0.45), inset 0 0 12px rgba(236, 72, 153, 0.2);
                border-color: rgba(236, 72, 153, 0.75);
              }
              50% {
                box-shadow: 0 0 40px rgba(236, 72, 153, 0.8), inset 0 0 18px rgba(236, 72, 153, 0.4);
                border-color: #FFFFFF;
              }
            }
            .cyber-wayfinder {
              background: rgba(10, 5, 12, 0.92);
              border: 1.5px solid rgba(236, 72, 153, 0.8);
              border-radius: 10px;
              color: #FFFFFF;
              font-family: 'Inter', 'Segoe UI', sans-serif;
              font-weight: 700;
              text-transform: uppercase;
              backdrop-filter: blur(12px);
              animation: smoothFloat 2.5s ease-in-out infinite, cgsMagentaPulse 2.2s ease-in-out infinite;
            }
          `}
        </style>
      </Html>

      {/* Main Door Wayfinder */}
      <group ref={wayfinderAnchorRef}>
        {isMainDoorOpen && !isRoom1Open ? (
          <Html center distanceFactor={85} zIndexRange={[100, 0]}>
            <div className="cyber-wayfinder">
              <div
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  letterSpacing: "2px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ color: "#EC4899", fontWeight: 900 }}>←</span> More Way Here
              </div>
            </div>
          </Html>
        ) : null}
      </group>

      {/* DOOR01 "OPEN THIS" Marker */}
      <group ref={door01AnchorRef}>
        {isMainDoorOpen && !isRoom1Open ? (
          <Html center distanceFactor={55} zIndexRange={[100, 0]}>
            <div className="cyber-wayfinder">
              <div
                style={{
                  padding: "10px 20px",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  letterSpacing: "1.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ color: "#EC4899", fontWeight: 900 }}>↓</span> MEETING ROOM
              </div>
            </div>
          </Html>
        ) : null}
      </group>
    </>
  );
}