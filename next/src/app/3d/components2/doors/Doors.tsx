"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import { MODEL_PATH } from "../modelConfig";

const DOOR_NAMES = [
  "DOOR.01",
  "DOOR.02",
  "DOOR.03",
  "DOOR.04",
  "DOOR.05",
  "DOOR.06",
  "DOOR.07",
  "MAINDOOR.01",
  "MAINDOOR.02",
  "MAINDOOR.03",
  "MAINDOOR.04",
];

export default function Doors() {
  const { scene } = useGLTF(MODEL_PATH);

  useEffect(() => {
    const found: string[] = [];

    DOOR_NAMES.forEach((name) => {
      const object =
        scene.getObjectByName(name);

      if (object) {
        found.push(name);
      }
    });

    console.log(
      "===================================="
    );

    console.log(
      "[Doors] MODEL:",
      MODEL_PATH
    );

    console.log(
      "[Doors] Expected:",
      DOOR_NAMES.length
    );

    console.log(
      "[Doors] Found:",
      found.length
    );

    console.log(
      "[Doors] Names:",
      found
    );

    console.log(
      "===================================="
    );
  }, [scene]);

  return null;
}

useGLTF.preload(MODEL_PATH);