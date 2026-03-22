"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function CameraLogger({ every = 0.5 }: { every?: number }) {
  const { camera } = useThree();
  const acc = useRef(0);

  useFrame((_, delta) => {
    acc.current += delta;
    if (acc.current < every) return;
    acc.current = 0;

    const p = camera.position;
    const r = camera.rotation;
    console.log("camera", {
      position: [p.x, p.y, p.z].map((n) => Number(n.toFixed(3))),
      rotation: [r.x, r.y, r.z].map((n) => Number(n.toFixed(3))),
    });
  });

  return null;
}
