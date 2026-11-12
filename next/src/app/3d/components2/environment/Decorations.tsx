"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

const MODEL_PATH = "/models/myModel/myLatestFile.glb";

const DECORATION_REFLECTION = 0.025;

export default function Decorations() {
  const { scene } = useGLTF(MODEL_PATH);

  useEffect(() => {
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      const objectName = object.name.toLowerCase();

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach((material) => {
        if (
          !(
            material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshPhysicalMaterial
          )
        ) {
          return;
        }

        const materialName = material.name.toLowerCase();

        const isDecoration =
          objectName.includes("decoration") ||
          objectName.includes("decor") ||
          objectName.includes("plant") ||
          objectName.includes("poster") ||
          objectName.includes("frame") ||
          materialName.includes("decoration") ||
          materialName.includes("decor");

        if (!isDecoration) return;

        material.envMapIntensity =
          DECORATION_REFLECTION;

        material.needsUpdate = true;
      });
    });
  }, [scene]);

  return null;
}

useGLTF.preload(MODEL_PATH);