"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import ShopModel from "./ShopModel";

export default function ScrollShopRig({ machineHoverEnabled = false }: { machineHoverEnabled?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const introProgress = useRef(0);

  const basePosition = useMemo(() => new THREE.Vector3(0, -0.18, 0), []);
  const scrollOffset = useMemo(() => new THREE.Vector3(0.55, -1.1, -0.32), []);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    // No scroll in this context, progress stays at 0
    const progress = 0;
    introProgress.current = Math.min(1, introProgress.current + delta / 1.75);
    const introT = THREE.MathUtils.smootherstep(introProgress.current, 0, 1);

    const tx = basePosition.x + scrollOffset.x * progress;
    const ty = basePosition.y + scrollOffset.y * progress;
    const tz = basePosition.z + scrollOffset.z * progress;

    group.position.x = THREE.MathUtils.damp(group.position.x, tx, 4.5, delta);
    group.position.y = THREE.MathUtils.damp(group.position.y, ty, 4.5, delta);
    group.position.z = THREE.MathUtils.damp(group.position.z, tz, 4.5, delta);

    const targetRotY = 0.26 * introT + 0.65 * progress;
    const targetRotX = -0.05 * progress;
    group.rotation.y = THREE.MathUtils.damp(
      group.rotation.y,
      targetRotY,
      4,
      delta,
    );
    group.rotation.x = THREE.MathUtils.damp(
      group.rotation.x,
      targetRotX,
      4,
      delta,
    );
  });

  return (
    <group
      ref={groupRef}
      position={[basePosition.x, basePosition.y, basePosition.z]}
    >
      <ShopModel machineHoverEnabled={machineHoverEnabled} />
    </group>
  );
}
