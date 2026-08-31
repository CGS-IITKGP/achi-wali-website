"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

const MODEL_PATH = "/models/myModel/myLatestFile.glb";

const LIGHT_EMISSIVE_INTENSITY = 1.5;

export default function CeilingLights() {
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

        const isLight =
          objectName.includes("light") ||
          objectName.includes("lamp") ||
          objectName.includes("ceiling light") ||
          materialName.includes("light");

        if (!isLight) return;

        /*
         * Only increase existing emissive response.
         * Don't replace the material/color.
         */
        if (material.emissiveIntensity > 0) {
          material.emissiveIntensity =
            Math.max(
              material.emissiveIntensity,
              LIGHT_EMISSIVE_INTENSITY
            );

          material.needsUpdate = true;
        }
      });
    });
  }, [scene]);

  return null;
}

useGLTF.preload(MODEL_PATH);