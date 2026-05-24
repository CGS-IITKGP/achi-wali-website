"use client";

import dynamic from "next/dynamic";
import "./arcade.css";

const ArcadeClient = dynamic(() => import("./components/ArcadeClient"), {
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
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: "14px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      Loading 3D Arcade...
    </div>
  ),
});

export default function ThreeDPage() {
  return <ArcadeClient />;
}
