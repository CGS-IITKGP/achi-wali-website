"use client";

import { Html } from "@react-three/drei";

interface HoverCardProps {
  position: [number, number, number];
  visible: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

export default function HoverCard({
  position,
  visible,
  onClick,
  onPointerOver,
  onPointerOut,
}: HoverCardProps) {
  if (!visible) return null;

  return (
    <Html position={position} center zIndexRange={[100, 0]}>
      <div
        className="cgs-game-card"
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick(e);
        }}
        onPointerEnter={onPointerOver}
        onPointerLeave={onPointerOut}
      >
        <div className="cgs-card-inner">
          <div className="cgs-card-image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80"
              alt="Game Thumbnail"
              className="cgs-card-image"
            />
            <div className="cgs-image-overlay" />
          </div>
          <div className="cgs-card-info">
            <h3 className="cgs-card-title">Cyber Strike</h3>
            <div className="cgs-card-indicator">PLAY NOW</div>
          </div>
        </div>
      </div>
    </Html>
  );
}
