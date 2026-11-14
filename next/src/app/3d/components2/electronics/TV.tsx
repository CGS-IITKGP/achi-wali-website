"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

const MODEL_PATH = "/models/myModel/myLatestFile.glb";

const TV_REFLECTION = 0.08;
const TV_ROUGHNESS = 0.30;

export default function TV() {
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
        ) return;

        const materialName = material.name.toLowerCase();

        if (
          !objectName.includes("tv") &&
          !objectName.includes("television") &&
          !materialName.includes("tv") &&
          !materialName.includes("television")
        ) return;

        material.envMapIntensity = TV_REFLECTION;
        material.roughness = Math.max(
          material.roughness,
          TV_ROUGHNESS
        );

        material.needsUpdate = true;
      });
    });
  }, [scene]);

  return null;
}

useGLTF.preload(MODEL_PATH);