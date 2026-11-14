"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

const MODEL_PATH = "/models/myModel/myLatestFile.glb";

const LAPTOP_REFLECTION = 0.10;
const LAPTOP_ROUGHNESS = 0.35;

export default function Laptop() {
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
          !objectName.includes("laptop") &&
          !materialName.includes("laptop")
        ) return;

        material.envMapIntensity = LAPTOP_REFLECTION;
        material.roughness = Math.max(
          material.roughness,
          LAPTOP_ROUGHNESS
        );

        material.needsUpdate = true;
      });
    });
  }, [scene]);

  return null;
}

useGLTF.preload(MODEL_PATH);