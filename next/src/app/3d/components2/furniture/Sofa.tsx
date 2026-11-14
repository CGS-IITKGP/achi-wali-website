"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

const MODEL_PATH = "/models/myModel/myLatestFile.glb";

const SOFA_REFLECTION = 0.02;
const SOFA_ROUGHNESS = 0.85;

export default function Sofa() {
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

        const isSofa =
          objectName.includes("sofa") ||
          objectName.includes("couch") ||
          materialName.includes("sofa") ||
          materialName.includes("fabric");

        if (!isSofa) return;

        /*
         * Sofa should remain a fabric-like surface.
         *
         * Very low reflection prevents the sofa from
         * becoming glossy while preserving Blender's color
         * and textures.
         */
        material.envMapIntensity = SOFA_REFLECTION;

        /*
         * Keep fabric matte.
         */
        material.roughness = Math.max(
          material.roughness,
          SOFA_ROUGHNESS
        );

        material.needsUpdate = true;
      });
    });
  }, [scene]);

  return null;
}

useGLTF.preload(MODEL_PATH);