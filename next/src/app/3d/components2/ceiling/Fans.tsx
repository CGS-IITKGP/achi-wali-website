"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef } from "react";

// ============================================================
// FAN ROOT NAMES
// ============================================================

const FAN_NAMES = [
  "Ceiling_Fan_1",
  "Ceiling_Fan_2",
  "Ceiling_Fan_3",
  "Ceiling_Fan_4",
];

// ============================================================
// ROTATION SETTINGS
// ============================================================

// 12 = clearly visible, continuous rotation across all modes
const ROTATION_SPEED = 12;

export default function Fans() {
  // FIX: useThree() gets the ACTUAL visible live scene.
  // useGLTF() was modifying the hidden cache, which is why they didn't visually spin!
  const { scene } = useThree();

  // Array to store the exact parts we need to spin
  const rotatingPartsRef = useRef<THREE.Object3D[]>([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    const detectedParts: THREE.Object3D[] = [];

    FAN_NAMES.forEach((fanName) => {
      const fan = scene.getObjectByName(fanName);
      if (!fan) {
        console.warn(`Fans: Could not find ${fanName} in the live scene yet.`);
        return;
      }

      let rotatingPart: THREE.Object3D | null = null;

      // GLB logic: Usually the blade/motor is the first child
      if (fan.children.length === 1) {
        rotatingPart = fan.children[0];
      } else {
        // Fallback: Find the first Mesh inside the fan group
        fan.traverse((object) => {
          if (object !== fan && object instanceof THREE.Mesh && !rotatingPart) {
            rotatingPart = object;
          }
        });
      }

      if (rotatingPart) {
        detectedParts.push(rotatingPart);
      }
    });

    // Save them to our ref so the useFrame loop can spin them
    rotatingPartsRef.current = detectedParts;
    
    if (detectedParts.length > 0) {
      initializedRef.current = true;
      console.log(`[Fans] Successfully mapped ${detectedParts.length} fans for rotation!`);
    }
  }, [scene]);

  // ==========================================================
  // ROTATE
  // ==========================================================

  useFrame((_, delta) => {
    if (rotatingPartsRef.current.length === 0) return;

    rotatingPartsRef.current.forEach((rotatingPart) => {
      // Ceiling fans typically spin around the Y-axis.
      // (If they happen to spin like a ferris wheel, just change this '.y' to '.z')
      rotatingPart.rotation.z -= ROTATION_SPEED * delta;
    });
  });

  return null;
}