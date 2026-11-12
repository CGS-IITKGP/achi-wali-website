"use client";

import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { MODEL_PATH } from "./modelConfig";

export default function NewModel() {
  const { scene } = useGLTF(MODEL_PATH);

  useEffect(() => {
    console.log("==== FULL SCENE DUMP ====");
    scene.traverse((o) => {
      console.log(o.name, "|", o.type, "| parent:", o.parent?.name);
    });
    console.log("==== END DUMP ====");
  }, [scene]);

  return (
    <group dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);