"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

const MODEL_PATH = "/models/myModel/myLatestFile.glb";

const PC_REFLECTION = 0.12;
const PC_ROUGHNESS = 0.32;

export default function PC() {
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

        const isPC =
          objectName.includes("pc") ||
          objectName.includes("computer") ||
          objectName.includes("cpu") ||
          materialName.includes("pc") ||
          materialName.includes("computer");

        if (!isPC) return;

        /*
         * PC casing:
         * controlled reflection, but not mirror-like.
         */
        material.envMapIntensity = PC_REFLECTION;

        material.roughness = Math.max(
          material.roughness,
          PC_ROUGHNESS
        );

        material.needsUpdate = true;
      });
    });
  }, [scene]);

  return null;
}

useGLTF.preload(MODEL_PATH);