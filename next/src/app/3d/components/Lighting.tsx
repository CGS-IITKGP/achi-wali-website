"use client";

export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.38} />
      <hemisphereLight intensity={0.7} color="#f1f7ff" groundColor="#1b1f2b" />

      {/* Key */}
      <directionalLight
        position={[6, 9, 6]}
        intensity={1.15}
        color="#ffffff"
        castShadow
        shadow-bias={-0.00015}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Fill */}
      <directionalLight position={[-7, 6, 4]} intensity={0.85} color="#dff7ff" />

      {/* Back/rim */}
      <directionalLight position={[0, 5, -10]} intensity={0.6} color="#f2e4ff" />

      {/* Cyber tint */}
      <pointLight position={[8, 3, 2]} intensity={0.35} distance={60} decay={2} color="#00e5ff" />
      <pointLight position={[-8, 3, 2]} intensity={0.28} distance={60} decay={2} color="#ff2bd6" />
    </>
  );
}
