"use client";

export default function Lighting() {
  return (
    <>
      {/* Base room illumination */}
      <ambientLight
        intensity={0.38}
        color="#ffffff"
      />

      {/* Soft sky/fill light */}
      <hemisphereLight
        intensity={0.7}
        color="#f1f7ff"
        groundColor="#1b1f2b"
      />

      {/* Main key light */}
      <directionalLight
        position={[6, 9, 6]}
        intensity={1.15}
        color="#ffffff"
      />

      {/* Fill light */}
      <directionalLight
        position={[-7, 6, 4]}
        intensity={0.85}
        color="#dff7ff"
      />

      {/* Back/rim light */}
      <directionalLight
        position={[0, 5, -10]}
        intensity={0.6}
        color="#f2e4ff"
      />

      {/* Subtle cyan accent */}
      <pointLight
        position={[8, 3, 2]}
        intensity={0.25}
        distance={60}
        decay={2}
        color="#00e5ff"
      />

      {/* Subtle magenta accent */}
      <pointLight
        position={[-8, 3, 2]}
        intensity={0.18}
        distance={60}
        decay={2}
        color="#ff2bd6"
      />
    </>
  );
}