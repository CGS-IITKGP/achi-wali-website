"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

const MODEL_PATH = "/models/myModel/myLatestFile.glb";

const CONTROL_REFLECTION = 0.10;
const CONTROL_ROUGHNESS = 0.40;

export default function ArcadeControls() {
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

        const isControl =
          objectName.includes("joystick") ||
          objectName.includes("button") ||
          objectName.includes("arcade control") ||
          materialName.includes("joystick") ||
          materialName.includes("button");

        if (!isControl) return;

        material.envMapIntensity = CONTROL_REFLECTION;

        material.roughness = Math.max(
          material.roughness,
          CONTROL_ROUGHNESS
        );

        material.needsUpdate = true;
      });
    });
  }, [scene]);

  return null;
}

useGLTF.preload(MODEL_PATH);