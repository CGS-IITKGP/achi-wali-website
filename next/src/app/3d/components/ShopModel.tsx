"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import HoverCard from "./HoverCard";

export default function ShopModel({ machineHoverEnabled = false }: { machineHoverEnabled?: boolean }) {
  const SHOP_MODEL_URL = "/models/shop/shop.glb";
  const { scene } = useGLTF(SHOP_MODEL_URL, "/draco/");
  const [hoveredNode, setHoveredNode] = useState<THREE.Object3D | null>(null);
  const [popupPos, setPopupPos] = useState<[number, number, number]>([0, 0, 0]);
  const groupRef = useRef<THREE.Group>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoveringCard = useRef(false);
  const cabinetsRef = useRef<THREE.Object3D[]>([]);

  const cancelCloseTimeout = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
  };

  const startCloseTimeout = () => {
    if (hoveredNode && !hoverTimeout.current && !isHoveringCard.current) {
      hoverTimeout.current = setTimeout(() => {
        setHoveredNode(null);
        document.body.style.cursor = "auto";
        hoverTimeout.current = null;
      }, 150);
    }
  };

  useFrame(() => {
    if (!machineHoverEnabled) {
      if (hoveredNode) {
        setHoveredNode(null);
        document.body.style.cursor = "auto";
      }
      return;
    }
  });

  const getArcadeCabinet = (obj: THREE.Object3D): THREE.Object3D | null => {
    let current: THREE.Object3D | null = obj;
    while (current) {
      if (current.name) {
        const n = current.name.toLowerCase();
        if (
          n.includes("cabinet") ||
          (n.includes("arcade") &&
            !n.includes("building") &&
            !n.includes("sign"))
        ) {
          return current;
        }
      }
      current = current.parent;
    }
    return null;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePointerMove = (e: any) => {
    if (!machineHoverEnabled) {
      if (hoveredNode) setHoveredNode(null);
      document.body.style.cursor = "auto";
      return;
    }

    let foundCabinet: THREE.Object3D | null = null;
    for (const hit of e.intersections) {
      const cabinet = getArcadeCabinet(hit.object);
      if (cabinet) {
        foundCabinet = cabinet;
        break;
      }
    }

    if (!foundCabinet && e.intersections.length > 0) {
      const point = e.intersections[0].point;
      for (const cab of cabinetsRef.current) {
        const box = new THREE.Box3().setFromObject(cab);
        box.expandByScalar(0.3);
        if (box.containsPoint(point)) {
          foundCabinet = cab;
          break;
        }
      }
    }

    if (foundCabinet) {
      e.stopPropagation();
      cancelCloseTimeout();

      if (!hoveredNode || hoveredNode.uuid !== foundCabinet.uuid) {
        setHoveredNode(foundCabinet);

        const box = new THREE.Box3().setFromObject(foundCabinet);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const targetWorldPos = new THREE.Vector3(
          center.x,
          center.y + 0.1,
          center.z,
        );

        if (groupRef.current) {
          groupRef.current.worldToLocal(targetWorldPos);
          setPopupPos([targetWorldPos.x, targetWorldPos.y, targetWorldPos.z]);
        }
      }
      document.body.style.cursor = "pointer";
    } else {
      startCloseTimeout();
    }
  };

  const handlePointerOut = () => {
    if (!machineHoverEnabled) return;
    startCloseTimeout();
  };

  const handleClick = (e: { intersections: Array<{ object: THREE.Object3D }>; stopPropagation: () => void }) => {
    if (!machineHoverEnabled) return;
    for (const hit of e.intersections) {
      const cabinet = getArcadeCabinet(hit.object);
      if (cabinet) {
        e.stopPropagation();
        window.open("https://cgs.website/game", "_blank");
        return;
      }
    }
  };

  useEffect(() => {
    if (machineHoverEnabled) return;

    cancelCloseTimeout();
    isHoveringCard.current = false;
    setHoveredNode(null);
    document.body.style.cursor = "auto";
  }, [machineHoverEnabled]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "auto";
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    };
  }, []);

  useEffect(() => {
    const cabs: THREE.Object3D[] = [];
    scene.children.forEach((child) => {
      if (child.name && child.name.toLowerCase().includes("cabinet")) {
        cabs.push(child);
      }
    });
    cabinetsRef.current = cabs;

    scene.traverse((obj) => {
      if (!obj || !(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;

      const objName = (mesh.name || "").toLowerCase();
      if (objName.includes("ddrfloor") || objName.includes("dioramabase")) {
        mesh.visible = false;
        return;
      }

      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;

      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      for (const material of materials) {
        if (!material) continue;

        if ("emissiveIntensity" in material) {
          const n = (material.name || "").toLowerCase();
          const isNeon =
            n.includes("neon") ||
            n.includes("panel") ||
            n.includes("sign") ||
            n.includes("pixel");
          (material as THREE.MeshStandardMaterial).emissiveIntensity = isNeon ? 0.6 : 0.06;
        }

        if ("side" in material) material.side = THREE.DoubleSide;

        if ("transparent" in material && material.transparent) {
          material.transparent = false;
          material.opacity = 1;
          material.depthWrite = true;
          material.depthTest = true;
          (material as THREE.MeshStandardMaterial).alphaTest = Math.max((material as THREE.MeshStandardMaterial).alphaTest || 0, 0.25);
          (material as THREE.MeshStandardMaterial).alphaToCoverage = true;
          material.blending = THREE.NormalBlending;
        }

        material.needsUpdate = true;
      }
    });
  }, [scene]);

  return (
    <group ref={groupRef} scale={1.5} position={[0, 0, 0]}>
      <primitive
        object={scene}
        onPointerMove={machineHoverEnabled ? handlePointerMove : undefined}
        onPointerOut={machineHoverEnabled ? handlePointerOut : undefined}
        onClick={machineHoverEnabled ? handleClick : undefined}
      />
      <HoverCard
        position={popupPos}
        visible={machineHoverEnabled && !!hoveredNode}
        onClick={() => window.open("https://cgs.website/game", "_blank")}
        onPointerOver={() => {
          if (!machineHoverEnabled) return;
          isHoveringCard.current = true;
          cancelCloseTimeout();
        }}
        onPointerOut={() => {
          if (!machineHoverEnabled) return;
          isHoveringCard.current = false;
          startCloseTimeout();
        }}
      />
    </group>
  );
}

useGLTF.preload("/models/shop/shop.glb", "/draco/");
