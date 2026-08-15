"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import CGSIntroWrapper from "./page";
import "./arcade.css";

const ArcadeClient = dynamic(() => import("./components/ArcadeClient"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
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

export default function ThreeDPage() {
  // ArcadeClient must NOT mount during the intro.
  //
  // Why: the intro works by scrolling the page 3× the viewport height.
  // If ArcadeClient is mounted during that scroll, its own scroll handler
  // fires and drives the Three.js camera through 3 viewport-heights of
  // animation. By the time the intro ends, the camera is deep inside the
  // scene (or past it). window.scrollTo(0,0) resets the scroll position
  // but NOT Three.js's internal state → black screen.
  //
  // Fix: mount ArcadeClient only AFTER the intro is done and scrollY=0,
  // so Three.js initialises fresh from position zero.
  const [arcadeReady, setArcadeReady] = useState(false);

  return (
    <main className="bg-black">
      {/* @ts-ignore - Ignoring TS error because CGSIntroWrapper accepts children at runtime */}
      <CGSIntroWrapper onRelease={() => setArcadeReady(true)}>
        <div className="arcade-scroll-layout">
          <div className="arcade-canvas-shell">
            {arcadeReady && <ArcadeClient />}
          </div>
        </div>
      </CGSIntroWrapper>
    </main>
  );
}