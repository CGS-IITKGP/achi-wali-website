"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

const MODEL_PATH = "/models/myModel/myLatestFile.glb";

const CUSHION_REFLECTION = 0.015;
const CUSHION_MIN_ROUGHNESS = 0.88;

export default function Cushions() {
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

        const isCushion =
          objectName.includes("cushion") ||
          objectName.includes("pillow") ||
          materialName.includes("cushion") ||
          materialName.includes("fabric");

        if (!isCushion) return;

        material.envMapIntensity = CUSHION_REFLECTION;

        material.roughness = Math.max(
          material.roughness,
          CUSHION_MIN_ROUGHNESS
        );

        material.needsUpdate = true;
      });
    });
  }, [scene]);

  return null;
}

useGLTF.preload(MODEL_PATH);