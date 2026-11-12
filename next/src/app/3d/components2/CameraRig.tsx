"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";

const POSITIONS = [
  new THREE.Vector3(47.354, 38.470, 64.982),
  new THREE.Vector3(47.354, 38.470, 35.113),
  new THREE.Vector3(49.699, 35.772, 30.842),
  new THREE.Vector3(-0.201, 40.621, 18.475),
  new THREE.Vector3(-22.569, 35.096, 20.583),
  new THREE.Vector3(-20.421, 31.846, -19.780),
  new THREE.Vector3(6.284, 35.921, -22.501),
  new THREE.Vector3(5.338, 34.127, -9.064),
  new THREE.Vector3(14.078, 33.881, -20.733),
  new THREE.Vector3(25.892, 36.876, -20.195),
];

const TARGETS = [
  new THREE.Vector3(47.354, 38.470, 0.000),
  new THREE.Vector3(47.354, 38.470, 0.000),
  new THREE.Vector3(48.447, 35.799, 30.840),
  new THREE.Vector3(-0.201, 40.618, 18.546),
  new THREE.Vector3(-22.489, 35.102, 19.666),
  new THREE.Vector3(-15.215, 32.223, -19.106),
  new THREE.Vector3(6.322, 12.702, 19.243),
  new THREE.Vector3(5.508, 30.004, 17.791),
  new THREE.Vector3(20.857, 33.331, -20.632),
  new THREE.Vector3(70.924, 31.524, -18.545),
];

export default function CameraRig({ step }: { step: number }) {
  const currentTarget = useRef(
    new THREE.Vector3().copy(TARGETS[0])
  );

  useFrame(({ camera }, delta) => {
    const targetPos = POSITIONS[step];
    const targetLookAt = TARGETS[step];

    const speed = 3.5;
    const dampFactor = 1 - Math.exp(-speed * delta);

    camera.position.lerp(targetPos, dampFactor);

    currentTarget.current.lerp(
      targetLookAt,
      dampFactor
    );

    camera.lookAt(currentTarget.current);

    // Keep the same wide perspective as the original setup.
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 75;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}