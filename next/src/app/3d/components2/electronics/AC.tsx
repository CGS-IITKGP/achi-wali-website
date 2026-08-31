"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

const MODEL_PATH = "/models/myModel/myLatestFile.glb";

const AC_REFLECTION = 0.07;
const AC_ROUGHNESS = 0.40;

export default function AC() {
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
          !objectName.includes("ac") &&
          !objectName.includes("air") &&
          !objectName.includes("condition") &&
          !materialName.includes("ac") &&
          !materialName.includes("air")
        ) return;

        material.envMapIntensity = AC_REFLECTION;
        material.roughness = Math.max(
          material.roughness,
          AC_ROUGHNESS
        );

        material.needsUpdate = true;
      });
    });
  }, [scene]);

  return null;
}

useGLTF.preload(MODEL_PATH);