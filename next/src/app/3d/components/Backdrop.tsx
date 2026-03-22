"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function Backdrop() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const shader = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 },
        uTop: { value: new THREE.Color("#0b1238") },
        uMid: { value: new THREE.Color("#0a0622") },
        uBottom: { value: new THREE.Color("#030412") },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform vec3 uTop;
        uniform vec3 uMid;
        uniform vec3 uBottom;

        float hash21(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }

        float star(vec2 uv, float t) {
          vec2 g = fract(uv) - 0.5;
          float d = length(g);
          float m = smoothstep(0.06, 0.0, d);
          float tw = 0.6 + 0.4 * sin(t + uv.x * 9.0 + uv.y * 13.0);
          return m * tw;
        }

        void main() {
          float y = clamp(vUv.y, 0.0, 1.0);
          vec3 col = mix(uBottom, uMid, smoothstep(0.0, 0.55, y));
          col = mix(col, uTop, smoothstep(0.55, 1.0, y));

          float band = exp(-pow((y - 0.62) * 7.0, 2.0));
          col += band * vec3(0.08, 0.05, 0.11);

          vec2 p = vUv * vec2(1.1, 1.0);
          float t = uTime * 0.12;
          float a1 = sin(p.x * 5.0 + t) * 0.5 + 0.5;
          float a2 = sin((p.x + p.y) * 4.0 - t * 1.25) * 0.5 + 0.5;
          float ribbon = smoothstep(0.10, 0.85, a1) * (0.55 + 0.45 * a2);
          float fade = smoothstep(0.05, 0.35, y) * (1.0 - smoothstep(0.70, 0.98, y));
          vec3 aurC = vec3(0.03, 0.10, 0.14);
          vec3 aurP = vec3(0.14, 0.04, 0.18);
          vec3 aurM = vec3(0.16, 0.06, 0.12);
          vec3 aur = mix(aurC, aurP, a1);
          aur = mix(aur, aurM, a2);
          col += aur * ribbon * fade;

          vec2 suv = vUv * vec2(140.0, 80.0);
          float sid = floor(suv.x) + floor(suv.y) * 157.0;
          float r = hash21(vec2(sid, sid + 3.1));
          float s = 0.0;
          if (r > 0.985) {
            s = star(suv, uTime * 0.6 + sid);
          }
          col += s * vec3(0.22, 0.35, 0.6);

          float scan = sin((vUv.y * 320.0) + (uTime * 0.55)) * 0.004;
          float n = (hash21(vUv * vec2(640.0, 360.0) + uTime) - 0.5) * 0.008;
          col += scan + n;

          vec2 v = vUv - 0.5;
          float vig = smoothstep(0.85, 0.15, dot(v, v) * 1.4);
          col *= mix(0.92, 1.0, vig);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    };
  }, []);

  useFrame((_, delta) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value += delta;
  });

  return (
    <mesh scale={1} position={[0, 0, 0]}>
      <sphereGeometry args={[80, 48, 32]} />
      <shaderMaterial
        ref={materialRef}
        args={[shader]}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
