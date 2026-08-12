"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";

// Your exact coordinates extracted from the previous CatmullRom curves
const POSITIONS = [
    new THREE.Vector3(47.354, 38.470, 64.982), // 0: Start outside
    new THREE.Vector3(47.354, 38.470, 35.113), // 1: Door
    new THREE.Vector3(49.699, 35.772, 30.842), // 2: Hallway
    new THREE.Vector3(-0.201, 40.621, 18.475), // 3: TV FINAL
    new THREE.Vector3(-22.569, 35.096, 20.583),
    new THREE.Vector3(-20.421, 31.846, -19.780),
    new THREE.Vector3(6.284, 35.921, -22.501),
    new THREE.Vector3(5.338, 34.127, -9.064),
    new THREE.Vector3(14.078, 33.881, -20.733),
    new THREE.Vector3(25.892, 36.876, -20.195)
];

const TARGETS = [
    new THREE.Vector3(47.354, 38.470, -0.000), 
    new THREE.Vector3(47.354, 38.470, -0.000),   
    new THREE.Vector3(48.447, 35.799, 30.840),  
    new THREE.Vector3(-0.201, 40.618, 18.546), 
    new THREE.Vector3(-22.489, 35.102, 19.666),
    new THREE.Vector3(-15.215, 32.223, -19.106),
    new THREE.Vector3(6.322, 12.702, 19.243),
    new THREE.Vector3(5.508, 30.004, 17.791),//laptop final
    new THREE.Vector3(20.857, 33.331, -20.632),
    new THREE.Vector3(70.924, 31.524, -18.545)
];

export default function CameraRig({ step }: { step: number }) {
  // We keep a reference to the current lookAt point so we can smoothly rotate
  const currentTarget = useRef(new THREE.Vector3().copy(TARGETS[0]));

  useFrame(({ camera }, delta) => {
    // Determine where we want to be and where we want to look
    const targetPos = POSITIONS[step];
    const targetLookAt = TARGETS[step];

    // The speed of the camera movement (higher = faster)
    const speed = 3.5; 
    
    // Frame-rate independent lerp (smooth transition)
    const dampFactor = 1 - Math.exp(-speed * delta);

    // 1. Smoothly glide the camera body to the new position
    camera.position.lerp(targetPos, dampFactor);

    // 2. Smoothly rotate the camera lens to face the new target
    currentTarget.current.lerp(targetLookAt, dampFactor);
    camera.lookAt(currentTarget.current);
  });

  return null;
}