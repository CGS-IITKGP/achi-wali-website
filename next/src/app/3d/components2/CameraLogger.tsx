"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export default function CameraLogger({ 
  every = 0.5, 
  controlsRef 
}: { 
  every?: number;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const acc = useRef(0);

  useFrame(({ camera }, delta) => {
    acc.current += delta;
    if (acc.current < every) return;
    acc.current = 0;

    const p = camera.position;
    const r = camera.rotation;
    const t = controlsRef?.current?.target;

    console.log("🎬 Camera Setup:", {
      position: [p.x, p.y, p.z].map((n) => Number(n.toFixed(3))),
      rotation: [r.x, r.y, r.z].map((n) => Number(n.toFixed(3))),
      target: t ? [t.x, t.y, t.z].map((n) => Number(n.toFixed(3))) : [0, 0, 0],
    });
  });

  return null;
}