"use client";

import dynamic from "next/dynamic";

// 1. We put the dynamic import inside this Client Component
const NewClient = dynamic(() => import("./NewClient"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#b8f9ff",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: "14px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      Loading 3D Arcade...
    </div>
  ),
});

// 2. Accept the games prop and pass it down
export default function ArcadeWrapper({ games }: { games: any[] }) {
  return <NewClient games={games} />;
}