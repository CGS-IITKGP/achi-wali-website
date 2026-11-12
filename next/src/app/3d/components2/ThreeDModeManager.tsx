"use client";

import dynamic from "next/dynamic";
import React from "react";
import "../arcade.css";

const ArcadeClient = dynamic(() => import("../components/ArcadeClient"), {
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
        color: "#52f3ff",
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
        color: "#ec4899",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: "14px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      Loading 3D Experience...
    </div>
  ),
});

interface ThreeDModeManagerProps {
  mode: "arcade" | "experience";
  games: any[];
}

export default function ThreeDModeManager({
  mode,
  games,
}: ThreeDModeManagerProps) {
  return (
    <div key={mode} className="w-full h-screen overflow-hidden bg-black">
      {mode === "arcade" ? (
        <ArcadeClient />
      ) : (
        <NewClient games={games} />
      )}
    </div>
  );
}
