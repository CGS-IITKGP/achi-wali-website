"use client";

import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useEffect } from "react";

const MODEL_PATH =
  "/models/myModel/myLatestFile.glb?v=floor1";

const FLOOR_NAME = "Floor";

// Slightly warm white, not pure white
const FLOOR_COLOR = "#E2E2D8";

export default function Floor() {
  const { scene } = useGLTF(MODEL_PATH);

  useEffect(() => {
    const floor = scene.getObjectByName(
      FLOOR_NAME
    );

    if (!floor) {
      console.warn(
        `Floor: Could not find "${FLOOR_NAME}" in GLB`
      );

      return;
    }

    console.log(
      "===================================="
    );

    console.log(
      "FLOOR MATERIAL UPDATE"
    );

    console.log(
      "FOUND FLOOR:",
      floor.name
    );

    let materialCount = 0;

    floor.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) {
        return;
      }

      const materials = Array.isArray(
        object.material
      )
        ? object.material
        : [object.material];

      materials.forEach((material) => {
        if (
          !material ||
          !("color" in material)
        ) {
          return;
        }

        const mat =
          material as THREE.MeshStandardMaterial;

        // Change only the floor color
        mat.color.set(FLOOR_COLOR);

        // Keep floor relatively matte
        mat.roughness = 0.75;

        materialCount++;
      });
    });

    console.log(
      "FLOOR MATERIALS UPDATED:",
      materialCount
    );

    console.log(
      "FLOOR COLOR:",
      FLOOR_COLOR
    );

    console.log(
      "===================================="
    );
  }, [scene]);

  return null;
}

useGLTF.preload(MODEL_PATH);