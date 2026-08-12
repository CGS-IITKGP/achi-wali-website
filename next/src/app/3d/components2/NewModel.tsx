"use client";

import { useGLTF } from "@react-three/drei";
import React from "react";

export default function Model(props: JSX.IntrinsicElements['group']) {
  // 1. Load the file
  const { scene } = useGLTF('/models/myModel/myModel_v.glb');

  // 2. Render the entire scene as one solid block
  return (
    <group {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

// 3. Preload it
useGLTF.preload('/models/myModel/myModel_v.glb');