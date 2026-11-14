"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

const MODEL_PATH = "/models/myModel/myLatestFile.glb";

const SPEAKER_REFLECTION = 0.05;
const SPEAKER_ROUGHNESS = 0.55;

export default function Speakers() {
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

        const isSpeaker =
          objectName.includes("speaker") ||
          objectName.includes("sound") ||
          objectName.includes("woofer") ||
          materialName.includes("speaker") ||
          materialName.includes("sound") ||
          materialName.includes("woofer");

        if (!isSpeaker) return;

        material.envMapIntensity =
          SPEAKER_REFLECTION;

        material.roughness = Math.max(
          material.roughness,
          SPEAKER_ROUGHNESS
        );

        material.needsUpdate = true;
      });
    });
  }, [scene]);

  return null;
}

useGLTF.preload(MODEL_PATH);