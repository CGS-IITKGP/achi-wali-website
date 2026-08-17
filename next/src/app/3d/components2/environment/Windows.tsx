"use client";

import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useEffect } from "react";

const MODEL_PATH =
  "/models/myModel/myLatestFile.glb?v=windows1";

const GLASS_OPACITY = 0.25;

export default function Windows() {
  const { scene } = useGLTF(MODEL_PATH);

  useEffect(() => {
    let glassCount = 0;

    console.log("====================================");
    console.log("WINDOW GLASS TRANSPARENCY");
    console.log("====================================");

    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) {
        return;
      }

      const name = object.name.toLowerCase();

      /*
       * Only actual window/glass objects.
       *
       * Do NOT include:
       * Inner_window_frame
       * Outer_window_frame
       */

      const isGlass =
        name.startsWith("inner_window_") ||
        name.startsWith("outer_window_");

      const isFrame =
        name.includes("window_frame");

      if (!isGlass || isFrame) {
        return;
      }

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach((material) => {
        if (!material) return;

        if (
          material instanceof
          THREE.MeshStandardMaterial
        ) {
          material.transparent = true;
          material.opacity = GLASS_OPACITY;

          // Important for proper transparent rendering
          material.depthWrite = false;

          material.side = THREE.DoubleSide;

          material.needsUpdate = true;

          glassCount++;

          console.log(
            "Glass updated:",
            object.name,
            material.name
          );
        }
      });
    });

    console.log(
      "TOTAL GLASS MATERIALS:",
      glassCount
    );

    console.log(
      "GLASS OPACITY:",
      GLASS_OPACITY
    );

    console.log("====================================");
  }, [scene]);

  return null;
}

useGLTF.preload(MODEL_PATH);