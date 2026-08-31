"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

const MODEL_PATH = "/models/myModel/myLatestFile.glb";

const MONITOR_REFLECTION = 0.08;
const MONITOR_ROUGHNESS = 0.30;

export default function Monitors() {
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

        const isMonitor =
          objectName.includes("monitor") ||
          objectName.includes("display") ||
          materialName.includes("monitor") ||
          materialName.includes("display");

        if (!isMonitor) return;

        material.envMapIntensity =
          MONITOR_REFLECTION;

        material.roughness = Math.max(
          material.roughness,
          MONITOR_ROUGHNESS
        );

        material.needsUpdate = true;
      });
    });
  }, [scene]);

  return null;
}

useGLTF.preload(MODEL_PATH);