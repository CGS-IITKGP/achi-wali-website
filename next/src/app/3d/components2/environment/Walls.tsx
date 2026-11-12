"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

const MODEL_PATH = "/models/myModel/myLatestFile.glb";

const WALL_REFLECTION = 0.015;

export default function Walls() {
  const { scene } = useGLTF(MODEL_PATH);

  useEffect(() => {
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

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

        /*
         * Only the actual wall material.
         *
         * We do NOT change:
         * - base color
         * - texture
         * - roughness
         * - metalness
         *
         * from the Blender export.
         *
         * This keeps the original wall appearance intact.
         */
        if (
          material.name === "Wall_baked" ||
          material.name === "Wall"
        ) {
          material.envMapIntensity = WALL_REFLECTION;
          material.needsUpdate = true;
        }
      });
    });
  }, [scene]);

  return null;
}

useGLTF.preload(MODEL_PATH);