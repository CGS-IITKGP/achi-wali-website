"use client";

import { Suspense } from "react";
import { Html, useProgress } from "@react-three/drei";
import Lighting from "./Lighting";
import ScrollShopRig from "./ScrollShopRig";
import Backdrop from "./Backdrop";

function LoadingProxy() {
  const { progress } = useProgress();

  return (
    <group>
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[2.6, 1.9, 2.2]} />
        <meshStandardMaterial
          color="#1a2a48"
          metalness={0.15}
          roughness={0.55}
        />
      </mesh>

      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[2.66, 1.96, 2.26]} />
        <meshBasicMaterial
          color="#52f3ff"
          wireframe
          opacity={0.9}
          transparent
        />
      </mesh>

      <Html center>
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "10px",
            background: "rgba(8, 14, 28, 0.78)",
            border: "1px solid rgba(82, 243, 255, 0.72)",
            color: "#b8f9ff",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: "12px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textAlign: "center",
            minWidth: "170px",
            boxShadow: "0 0 18px rgba(82, 243, 255, 0.32)",
          }}
        >
          Loading Arcade
          <br />
          {Math.round(progress)}%
        </div>
      </Html>
    </group>
  );
}

export default function Scene({ machineHoverEnabled = false }: { machineHoverEnabled?: boolean }) {
  return (
    <>
      <Backdrop />
      <fog attach="fog" args={["#090a1a", 22, 110]} />

      <Lighting />

      <Suspense fallback={<LoadingProxy />}>
        <ScrollShopRig machineHoverEnabled={machineHoverEnabled} />
      </Suspense>
    </>
  );
}
