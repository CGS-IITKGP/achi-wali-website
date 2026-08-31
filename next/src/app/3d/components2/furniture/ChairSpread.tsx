"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef } from "react";

// ============================================================
// IMPORTANT
// This MUST be the exact same GLB used by NewModel.tsx
// ============================================================

const MODEL_PATH = "/models/myModel/myLatestFile.glb?v=chairs3";

// ============================================================
// SCENE SETTINGS
// ============================================================

const FOCUS_STEP = 7;

// How far each chair moves away from its original position
const SPREAD_DISTANCE = 6.5;

// Animation speed
const ANIMATION_SPEED = 5.0;

// ============================================================
// EXACT CHAIR NAMES FROM BLENDER
// ============================================================

const CHAIR_NAMES = [
  "CHAIR_01",
  "CHAIR_02",
  "CHAIR_03",
  "CHAIR_04",
  "CHAIR_05",
  "CHAIR_06",
  "CHAIR_07",
];

// ============================================================
// TYPE
// ============================================================

type ChairData = {
  object: THREE.Object3D;
  originalPosition: THREE.Vector3;
  targetPosition: THREE.Vector3;
};

// ============================================================
// COMPONENT
// ============================================================

export default function ChairSpread({
  step,
}: {
  step: number;
}) {
  const { scene } = useGLTF(MODEL_PATH);

  const chairsRef = useRef<ChairData[]>([]);

  const initializedRef = useRef(false);

  // ==========================================================
  // DETECT + PREPARE CHAIRS
  // ==========================================================

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    console.log("");
    console.log("==================================================");
    console.log("CHAIR SPREAD INITIALIZATION");
    console.log("==================================================");

    console.log("MODEL PATH:", MODEL_PATH);
    console.log("CURRENT STEP:", step);
    console.log("FOCUS STEP:", FOCUS_STEP);

    // --------------------------------------------------------
    // PRINT ROOT SCENE INFORMATION
    // --------------------------------------------------------

    console.log("GLB ROOT:", scene.name);
    console.log("GLB ROOT TYPE:", scene.type);

    // --------------------------------------------------------
    // SEARCH EXACT CHAIR NAMES
    // --------------------------------------------------------

    const detectedChairs: THREE.Object3D[] = [];

    console.log("");
    console.log("SEARCHING FOR EXACT CHAIR NAMES...");
    console.log("");

    CHAIR_NAMES.forEach((chairName) => {
      let found: THREE.Object3D | undefined;

      scene.traverse((object) => {
        if (object.name === chairName) {
          found = object;
        }
      });

      if (found) {
        detectedChairs.push(found);

        const worldPosition = new THREE.Vector3();

        found.getWorldPosition(worldPosition);

        console.log(
          `FOUND ${chairName}`,
          {
            type: found.type,
            parent: found.parent?.name,
            position: {
              x: Number(worldPosition.x.toFixed(3)),
              y: Number(worldPosition.y.toFixed(3)),
              z: Number(worldPosition.z.toFixed(3)),
            },
            visible: found.visible,
          }
        );
      } else {
        console.error(
          `NOT FOUND: ${chairName}`
        );
      }
    });

    // --------------------------------------------------------
    // SUMMARY
    // --------------------------------------------------------

    console.log("");
    console.log("==================================================");
    console.log("CHAIR DETECTION RESULT");
    console.log("==================================================");

    console.log(
      "EXPECTED CHAIRS:",
      CHAIR_NAMES.length
    );

    console.log(
      "DETECTED CHAIRS:",
      detectedChairs.length
    );

    console.log(
      "DETECTED NAMES:",
      detectedChairs.map(
        (chair) => chair.name
      )
    );

    console.log("==================================================");

    // --------------------------------------------------------
    // IF NO CHAIRS FOUND
    // --------------------------------------------------------

    if (detectedChairs.length === 0) {
      console.error(
        "ChairSpread: NO CHAIRS FOUND."
      );

      console.log("");
      console.log(
        "SEARCHING ALL GLB OBJECT NAMES FOR DEBUG..."
      );

      const allObjects: string[] = [];

      scene.traverse((object) => {
        if (object.name) {
          allObjects.push(
            `${object.name} [${object.type}]`
          );
        }
      });

      console.log(
        "TOTAL GLB OBJECTS:",
        allObjects.length
      );

      console.log(
        "ALL OBJECT NAMES:",
        allObjects
      );

      initializedRef.current = true;

      return;
    }

    // --------------------------------------------------------
    // WRONG COUNT
    // --------------------------------------------------------

    if (detectedChairs.length !== 7) {
      console.warn(
        `ChairSpread: Expected 7 chairs, found ${detectedChairs.length}`
      );
    }

    // --------------------------------------------------------
    // CALCULATE CENTER OF THE 7 CHAIRS
    //
    // This gives us the approximate center of the chair circle.
    // Chairs then move away from this center.
    // --------------------------------------------------------

    const chairWorldPositions =
      detectedChairs.map((chair) => {
        const position =
          new THREE.Vector3();

        chair.getWorldPosition(position);

        return position;
      });

    const center =
      new THREE.Vector3();

    chairWorldPositions.forEach(
      (position) => {
        center.add(position);
      }
    );

    center.divideScalar(
      chairWorldPositions.length
    );

    console.log("");
    console.log("==================================================");
    console.log("CALCULATED CHAIR CENTER");
    console.log("==================================================");

    console.log(
      "CENTER:",
      {
        x: Number(center.x.toFixed(3)),
        y: Number(center.y.toFixed(3)),
        z: Number(center.z.toFixed(3)),
      }
    );

    console.log("==================================================");

    // ========================================================
    // CREATE TARGET POSITIONS
    // ========================================================

    const chairData: ChairData[] = [];

    detectedChairs.forEach((chair) => {
      // ------------------------------------------------------
      // Original local position
      // ------------------------------------------------------

      const originalPosition =
        chair.position.clone();

      // ------------------------------------------------------
      // Current world position
      // ------------------------------------------------------

      const worldPosition =
        new THREE.Vector3();

      chair.getWorldPosition(
        worldPosition
      );

      // ------------------------------------------------------
      // Direction from chair-center -> chair
      // ------------------------------------------------------

      const direction =
        new THREE.Vector3(
          worldPosition.x - center.x,
          0,
          worldPosition.z - center.z
        );

      // ------------------------------------------------------
      // Safety
      // ------------------------------------------------------

      if (
        direction.lengthSq() < 0.0001
      ) {
        console.warn(
          `${chair.name}: Cannot calculate direction because it is too close to center.`
        );

        return;
      }

      direction.normalize();

      // ------------------------------------------------------
      // Move outward
      // ------------------------------------------------------

      const targetWorldPosition =
        worldPosition
          .clone()
          .add(
            direction
              .clone()
              .multiplyScalar(
                SPREAD_DISTANCE
              )
          );

      // ------------------------------------------------------
      // Convert world target to local position
      // ------------------------------------------------------

      const targetPosition =
        targetWorldPosition.clone();

      if (chair.parent) {
        chair.parent.worldToLocal(
          targetPosition
        );
      }

      // ------------------------------------------------------
      // Save
      // ------------------------------------------------------

      chairData.push({
        object: chair,
        originalPosition,
        targetPosition,
      });

      // ------------------------------------------------------
      // DEBUG
      // ------------------------------------------------------

      console.log("");
      console.log(
        `${chair.name} MOVEMENT DATA`
      );

      console.log(
        "Original World:",
        {
          x: Number(
            worldPosition.x.toFixed(3)
          ),
          y: Number(
            worldPosition.y.toFixed(3)
          ),
          z: Number(
            worldPosition.z.toFixed(3)
          ),
        }
      );

      console.log(
        "Target World:",
        {
          x: Number(
            targetWorldPosition.x.toFixed(3)
          ),
          y: Number(
            targetWorldPosition.y.toFixed(3)
          ),
          z: Number(
            targetWorldPosition.z.toFixed(3)
          ),
        }
      );

      console.log(
        "Original Local:",
        originalPosition.toArray().map(
          (value) =>
            Number(value.toFixed(3))
        )
      );

      console.log(
        "Target Local:",
        targetPosition.toArray().map(
          (value) =>
            Number(value.toFixed(3))
        )
      );
    });

    // ========================================================
    // SAVE DATA
    // ========================================================

    chairsRef.current = chairData;

    initializedRef.current = true;

    // ========================================================
    // FINAL DEBUG
    // ========================================================

    console.log("");
    console.log("==================================================");
    console.log("CHAIR SPREAD READY");
    console.log("==================================================");

    console.log(
      "CHAIRS:",
      chairData.length
    );

    console.log(
      "SPREAD DISTANCE:",
      SPREAD_DISTANCE
    );

    console.log(
      "ANIMATION SPEED:",
      ANIMATION_SPEED
    );

    console.log(
      "FOCUS STEP:",
      FOCUS_STEP
    );

    console.log(
      "CURRENT STEP:",
      step
    );

    console.log("==================================================");
    console.log("");

  }, [scene]);

  // ==========================================================
  // ANIMATION
  // ==========================================================

  useFrame((_, delta) => {
    if (
      chairsRef.current.length === 0
    ) {
      return;
    }

    // --------------------------------------------------------
    // Spread only at laptop focus step
    // --------------------------------------------------------

    const shouldSpread =
      step === FOCUS_STEP;

    // --------------------------------------------------------
    // Smooth frame-rate independent animation
    // --------------------------------------------------------

    const interpolation =
      1 -
      Math.exp(
        -ANIMATION_SPEED * delta
      );

    // --------------------------------------------------------
    // Move every chair
    // --------------------------------------------------------

    chairsRef.current.forEach(
      ({
        object,
        originalPosition,
        targetPosition,
      }) => {
        const destination =
          shouldSpread
            ? targetPosition
            : originalPosition;

        object.position.lerp(
          destination,
          interpolation
        );
      }
    );
  });

  return null;
}

// ============================================================
// PRELOAD
// ============================================================

useGLTF.preload(MODEL_PATH);