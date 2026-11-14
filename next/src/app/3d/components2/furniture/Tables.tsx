"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

const MODEL_PATH = "/models/myModel/myLatestFile.glb";

const TABLE_REFLECTION = 0.08;
const TABLE_MIN_ROUGHNESS = 0.45;

export default function Tables() {
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

        const isTable =
          objectName.includes("table") ||
          materialName.includes("table") ||
          materialName.includes("wood");

        if (!isTable) return;

        /*
         * Keep the original Blender color and textures.
         *
         * Only add a very subtle environment response.
         */
        material.envMapIntensity = TABLE_REFLECTION;

        /*
         * Tables should have a slight surface response,
         * but should not look like polished plastic.
         */
        material.roughness = Math.max(
          material.roughness,
          TABLE_MIN_ROUGHNESS
        );

        material.needsUpdate = true;
      });
    });
  }, [scene]);

  return null;
}

useGLTF.preload(MODEL_PATH);