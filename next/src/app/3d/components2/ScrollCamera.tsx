"use client";

import { useFrame } from "@react-three/fiber";
import { useScroll, Html } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";

export default function ScrollCamera() {
  const scroll = useScroll();
  
  const arrowRef = useRef<HTMLDivElement>(null);
  const hasResumed = useRef(false);
  
  const pauseThreshold = 0.63; 

  const cameraPath = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(47.354, 38.470, 64.982), 
        new THREE.Vector3(47.354, 38.470, 35.113), 
        new THREE.Vector3(49.699, 35.772, 30.842), 
        new THREE.Vector3(-0.201, 40.621, 18.475), 
        new THREE.Vector3(-20.421, 31.846, -19.780)
      ]),
    []
  );

  const targetPath = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(47.354, 38.470, -0.000), 
        new THREE.Vector3(47.354, 38.470, -0.000),   
        new THREE.Vector3(48.447, 35.799, 30.840),  
        new THREE.Vector3(-0.201, 40.618, 18.546), 
        new THREE.Vector3(-15.215, 32.223, -19.106)
      ]),
    []
  );

  // 1. Calculate a position 2 units directly in front of the camera to avoid Near Clipping
  const safeHtmlPosition = useMemo(() => {
    const pos = cameraPath.getPointAt(pauseThreshold);
    const target = targetPath.getPointAt(pauseThreshold);
    
    // Get the direction the camera is looking
    const direction = new THREE.Vector3().subVectors(target, pos).normalize();
    
    // Place the HTML anchor exactly 2 units along that line
    return pos.clone().add(direction.multiplyScalar(2));
  }, [cameraPath, targetPath]);

  useFrame(({ camera }) => {
    let t = scroll.offset;

    if (t >= pauseThreshold && !hasResumed.current) {
      if (scroll.el) {
        scroll.el.style.overflowY = "hidden";
      }

      if (arrowRef.current) {
        arrowRef.current.style.opacity = "1";
        arrowRef.current.style.pointerEvents = "auto";
      }
    }

    const isPaused = t >= pauseThreshold && !hasResumed.current;
    const effectiveT = isPaused ? pauseThreshold : t;

    const position = cameraPath.getPointAt(effectiveT);
    const target = targetPath.getPointAt(effectiveT);

    camera.position.copy(position);
    camera.lookAt(target);
  });

  const handleResume = () => {
    hasResumed.current = true; 
    
    if (arrowRef.current) {
      arrowRef.current.style.opacity = "0";
      arrowRef.current.style.pointerEvents = "none";
    }
    
    if (scroll.el) {
      scroll.el.style.overflowY = "auto";
    }
  };

  return (
    // 2. Attach the wrapper to our new safe, visible coordinate
    <Html position={safeHtmlPosition} center zIndexRange={[100, 0]}>
      <div 
        ref={arrowRef}
        onClick={handleResume}
        style={{
          opacity: 0,          
          pointerEvents: 'none',
          
          cursor: "pointer",
          backgroundColor: "rgba(34, 197, 94, 0.15)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(34, 197, 94, 0.4)",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
          transition: "opacity 0.3s ease, background-color 0.2s ease"
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(34, 197, 94, 0.35)"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(34, 197, 94, 0.15)"}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#4ADE80" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </Html>
  );
}