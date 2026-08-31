"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

const MODEL_PATH = "/models/myModel/myLatestFile.glb";

const ROUTER_REFLECTION = 0.10;
const ROUTER_ROUGHNESS = 0.38;

export default function Router() {
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
          !objectName.includes("router") &&
          !materialName.includes("router")
        ) return;

        material.envMapIntensity = ROUTER_REFLECTION;
        material.roughness = Math.max(
          material.roughness,
          ROUTER_ROUGHNESS
        );

        material.needsUpdate = true;
      });
    });
  }, [scene]);

  return null;
}

useGLTF.preload(MODEL_PATH);