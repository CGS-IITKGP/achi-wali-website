"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useProgress } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import Scene from "./Scene";
import CameraLogger from "./CameraLogger";
import * as THREE from "three";

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function safeSamplePointAt(
  curve: THREE.CatmullRomCurve3 | null,
  t: number,
  out: THREE.Vector3,
  fallback: THREE.Vector3,
) {
  const safeT = Number.isFinite(t) ? THREE.MathUtils.clamp(t, 0, 1) : 0;

  if (!curve || !curve.points || curve.points.length < 2) {
    out.copy(fallback);
    return;
  }

  try {
    out.copy(curve.getPointAt(safeT));
  } catch {
    out.copy(fallback);
  }
}

const CAMERA_SPLINE_POINTS: [number, number, number][] = [
  [8.28, 6.743, 4.324],
  [2.624, 1.722, 3.002],
  [-1.057, 1.114, 2.579],
  [-2.976, 0.383, 0.808],
  [-2.905, 0.571, 0.634],
  [-2.500, 0.850, -0.800],
  [-0.803, 1.130, 0.191],
];

const LOOK_SPLINE_POINTS: [number, number, number][] = [
  [-0.611, 0.264, -0.308],
  [-0.546, 0.333, -0.239],
  [-0.137, 0.327, -0.153],
  [-0.1, 0.175, 0.024],
  [0.003, -0.450, -0.085],
  [0.100, 0.400, -0.080],
  [0.196, 0.892, -0.066],
];

interface FocusShot {
  id: string;
  label: string;
  camera: [number, number, number];
  look: [number, number, number];
  ui: { left: string; top: string };
}

const FOCUS_SHOTS: FocusShot[] = [
  {
    id: "machines",
    label: "A",
    camera: [-0.203, 0.98, 0.037],
    look: [0.108, 0.94, -0.047],
    ui: { left: "53%", top: "18%" },
  },
  {
    id: "dance-floor",
    label: "B",
    camera: [-0.413, 0.39, 0.84],
    look: [-0.717, 0.009, -0.438],
    ui: { left: "24%", top: "54%" },
  },
  {
    id: "scanner-wall",
    label: "C",
    camera: [-0.722, 0.107, 0.438],
    look: [-0.292, 0.077, 0.341],
    ui: { left: "58%", top: "54%" },
  },
];

interface Telemetry {
  progress: number;
  targetProgress: number;
  camera: { x: number; y: number; z: number };
  look: { x: number; y: number; z: number };
}

interface JumpRequest {
  id: number;
  progress: number;
}

interface FocusRequest {
  id: number;
  shotId: string;
  camera: [number, number, number];
  look: [number, number, number];
}

interface ClearFocusRequest {
  id: number;
}

function ScrollPathCameraRig({
  onTelemetry,
  jumpRequest,
  focusRequest,
  clearFocusRequest,
  onFocusChange,
  enabled,
  introCanStart,
}: {
  onTelemetry: (t: Telemetry) => void;
  jumpRequest: JumpRequest | null;
  focusRequest: FocusRequest | null;
  clearFocusRequest: ClearFocusRequest | null;
  onFocusChange: (active: boolean) => void;
  enabled: boolean;
  introCanStart: boolean;
}) {
  const { camera } = useThree();
  const heroProgress = 0.556;
  const minProgressAfterIntro = heroProgress;
  const clampPlayableProgress = (value: number) =>
    THREE.MathUtils.clamp(value, minProgressAfterIntro, 1);
  const progress = useRef(0);
  const targetProgress = useRef(heroProgress);
  const introElapsed = useRef(0);
  const introDone = useRef(false);
  const lastJumpId = useRef<number | null>(null);
  const telemetryAccumulator = useRef(0);
  const lookPoint = useMemo(() => new THREE.Vector3(), []);
  const focusCameraTarget = useMemo(() => new THREE.Vector3(), []);
  const focusLookTarget = useMemo(() => new THREE.Vector3(), []);
  const lastFocusId = useRef<number | null>(null);
  const lastClearFocusId = useRef<number | null>(null);
  const focusActiveRef = useRef(false);
  const returnFromFocusActive = useRef(false);
  const returnFromFocusElapsed = useRef(0);
  const returnFromFocusDuration = 0.9;
  const returnFromFocusStartCamera = useMemo(() => new THREE.Vector3(), []);
  const returnFromFocusStartLook = useMemo(() => new THREE.Vector3(), []);
  const splineCamPoint = useMemo(() => new THREE.Vector3(), []);
  const splineLookPoint = useMemo(() => new THREE.Vector3(), []);
  const blendedCamPoint = useMemo(() => new THREE.Vector3(), []);
  const blendedLookPoint = useMemo(() => new THREE.Vector3(), []);
  const cameraFallback = useMemo(
    () => new THREE.Vector3(...CAMERA_SPLINE_POINTS[0]),
    [],
  );
  const lookFallback = useMemo(
    () => new THREE.Vector3(...LOOK_SPLINE_POINTS[0]),
    [],
  );

  const cameraPath = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        CAMERA_SPLINE_POINTS.map((p) => new THREE.Vector3(...p)),
      ),
    [],
  );
  const lookPath = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        LOOK_SPLINE_POINTS.map((p) => new THREE.Vector3(...p)),
      ),
    [],
  );

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (!introDone.current) return;
      if (focusActiveRef.current) onFocusChange?.(false);
      focusActiveRef.current = false;
      targetProgress.current = clampPlayableProgress(
        targetProgress.current + event.deltaY * 0.00045,
      );
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!introDone.current) return;

      const isForward = event.key === "ArrowDown" || event.key === "PageDown";
      const isBackward = event.key === "ArrowUp" || event.key === "PageUp";
      if (!isForward && !isBackward) return;

      if (focusActiveRef.current) onFocusChange?.(false);
      focusActiveRef.current = false;
      if (isForward) {
        targetProgress.current = clampPlayableProgress(
          targetProgress.current + 0.055,
        );
      }
      if (isBackward) {
        targetProgress.current = clampPlayableProgress(
          targetProgress.current - 0.055,
        );
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useFrame((_, delta) => {
    if (!enabled) return;

    if (jumpRequest && jumpRequest.id !== lastJumpId.current) {
      lastJumpId.current = jumpRequest.id;
      introDone.current = true;
      if (focusActiveRef.current) onFocusChange?.(false);
      focusActiveRef.current = false;
      targetProgress.current = clampPlayableProgress(jumpRequest.progress);
      progress.current = clampPlayableProgress(jumpRequest.progress);
    }

    if (focusRequest && focusRequest.id !== lastFocusId.current) {
      lastFocusId.current = focusRequest.id;
      introDone.current = true;
      focusActiveRef.current = true;
      focusCameraTarget.set(...focusRequest.camera);
      focusLookTarget.set(...focusRequest.look);
      onFocusChange?.(true);
    }

    if (
      clearFocusRequest &&
      clearFocusRequest.id !== lastClearFocusId.current
    ) {
      lastClearFocusId.current = clearFocusRequest.id;
      returnFromFocusActive.current = true;
      returnFromFocusElapsed.current = 0;
      returnFromFocusStartCamera.copy(camera.position);
      returnFromFocusStartLook.copy(lookPoint);
      focusActiveRef.current = false;
    }

    if (!introCanStart) {
      progress.current = 0;
      targetProgress.current = 0;
    }

    if (!introDone.current && introCanStart) {
      introElapsed.current += delta;
      const introT = clamp01((introElapsed.current - 0.08) / 3.2);
      const easedIntro = THREE.MathUtils.smootherstep(introT, 0, 1);
      progress.current = THREE.MathUtils.lerp(0, heroProgress, easedIntro);
      targetProgress.current = progress.current;
      if (introT >= 1) {
        introDone.current = true;
        targetProgress.current = heroProgress;
      }
    }

    if (introDone.current) {
      targetProgress.current = clampPlayableProgress(targetProgress.current);
      progress.current = clampPlayableProgress(progress.current);
    }

    if (focusActiveRef.current) {
      camera.position.x = THREE.MathUtils.damp(camera.position.x, focusCameraTarget.x, 4.6, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, focusCameraTarget.y, 4.6, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, focusCameraTarget.z, 4.6, delta);

      lookPoint.x = THREE.MathUtils.damp(lookPoint.x, focusLookTarget.x, 4.8, delta);
      lookPoint.y = THREE.MathUtils.damp(lookPoint.y, focusLookTarget.y, 4.8, delta);
      lookPoint.z = THREE.MathUtils.damp(lookPoint.z, focusLookTarget.z, 4.8, delta);
      camera.lookAt(lookPoint);
    } else if (returnFromFocusActive.current) {
      const safeProgress = Number.isFinite(progress.current)
        ? THREE.MathUtils.clamp(progress.current, 0, 1)
        : 0;
      const t = THREE.MathUtils.smootherstep(safeProgress, 0, 1);
      safeSamplePointAt(cameraPath, t, splineCamPoint, cameraFallback);
      safeSamplePointAt(lookPath, t, splineLookPoint, lookFallback);

      returnFromFocusElapsed.current += delta;
      const blendT = clamp01(
        returnFromFocusElapsed.current / returnFromFocusDuration,
      );
      const easedBlend = THREE.MathUtils.smootherstep(blendT, 0, 1);

      blendedCamPoint.lerpVectors(returnFromFocusStartCamera, splineCamPoint, easedBlend);
      blendedLookPoint.lerpVectors(returnFromFocusStartLook, splineLookPoint, easedBlend);

      camera.position.copy(blendedCamPoint);
      lookPoint.copy(blendedLookPoint);
      camera.lookAt(lookPoint);

      if (blendT >= 1) {
        returnFromFocusActive.current = false;
        onFocusChange?.(false);
      }
    } else {
      progress.current = THREE.MathUtils.damp(
        progress.current,
        targetProgress.current,
        5,
        delta,
      );
      const safeProgress = Number.isFinite(progress.current)
        ? THREE.MathUtils.clamp(progress.current, 0, 1)
        : 0;
      const t = THREE.MathUtils.smootherstep(safeProgress, 0, 1);
      safeSamplePointAt(cameraPath, t, camera.position, cameraFallback);
      safeSamplePointAt(lookPath, t, lookPoint, lookFallback);
      camera.lookAt(lookPoint);
    }

    telemetryAccumulator.current += delta;
    if (telemetryAccumulator.current >= 0.08 && onTelemetry) {
      telemetryAccumulator.current = 0;
      onTelemetry({
        progress: progress.current,
        targetProgress: targetProgress.current,
        camera: {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z,
        },
        look: {
          x: lookPoint.x,
          y: lookPoint.y,
          z: lookPoint.z,
        },
      });
    }
  });

  return null;
}

function ModelLoadGate({ onReady }: { onReady: () => void }) {
  const { active, progress } = useProgress();
  const reported = useRef(false);
  const sawLoading = useRef(false);

  useEffect(() => {
    if (active) sawLoading.current = true;

    if (
      !reported.current &&
      !active &&
      (sawLoading.current || progress >= 100)
    ) {
      reported.current = true;
      onReady?.();
    }
  }, [active, progress, onReady]);

  return null;
}

function FreeCameraTelemetry({
  onTelemetry,
  controlsRef,
  enabled,
}: {
  onTelemetry: (t: Telemetry) => void;
  controlsRef: React.RefObject<THREE.EventDispatcher | null>;
  enabled: boolean;
}) {
  const { camera } = useThree();
  const accumulator = useRef(0);

  useFrame((_, delta) => {
    if (!enabled || !onTelemetry) return;
    accumulator.current += delta;
    if (accumulator.current < 0.08) return;
    accumulator.current = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const target = (controlsRef.current as any)?.target;
    onTelemetry({
      progress: 0,
      targetProgress: 0,
      camera: {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      },
      look: {
        x: target?.x ?? 0,
        y: target?.y ?? 0,
        z: target?.z ?? 0,
      },
    });
  });

  return null;
}

export default function ArcadeClient() {
  const introTargetProgress = 0.556;
  const hotspotTriggerProgress = 1.0;
  const hotspotTriggerTolerance = 0.03;
  const checkpoints = useMemo(
    () =>
      CAMERA_SPLINE_POINTS.map((_, index) => {
        if (CAMERA_SPLINE_POINTS.length <= 1) return 0;
        return index / (CAMERA_SPLINE_POINTS.length - 1);
      }),
    [],
  );
  const [freeMove, setFreeMove] = useState(false);
  const [introCanStart, setIntroCanStart] = useState(false);
  const [telemetry, setTelemetry] = useState<Telemetry>({
    progress: 0,
    targetProgress: 0,
    camera: { x: 0, y: 0, z: 0 },
    look: { x: 0, y: 0, z: 0 },
  });
  const [jumpRequest, setJumpRequest] = useState<JumpRequest | null>(null);
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const [clearFocusRequest, setClearFocusRequest] = useState<ClearFocusRequest | null>(null);
  const [focusActive, setFocusActive] = useState(false);
  const [cameraLoggerOn, setCameraLoggerOn] = useState(false);
  const controlsRef = useRef(null);
  const machineHoverEnabled =
    !freeMove && focusActive && focusRequest?.shotId === "machines";

  const hotspotsVisible =
    !freeMove &&
    !focusActive &&
    introCanStart &&
    Math.abs(telemetry.progress - hotspotTriggerProgress) <=
      hotspotTriggerTolerance;

  const clearFocus = () => {
    setClearFocusRequest({ id: Date.now() });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && focusActive) {
        clearFocus();
        return;
      }
      if (event.key === "l") {
        setCameraLoggerOn((prev) => !prev);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusActive]);

  const goToCheckpoint = (direction: number) => {
    const current = telemetry.targetProgress;
    const playableCheckpoints = checkpoints.filter(
      (value) => value >= introTargetProgress,
    );

    if (direction > 0) {
      const next = playableCheckpoints.find((value) => value > current + 0.001);
      if (next != null) setJumpRequest({ id: Date.now(), progress: next });
      return;
    }

    const reversed = [...playableCheckpoints].reverse();
    const prev = reversed.find((value) => value < current - 0.001);
    if (prev != null) setJumpRequest({ id: Date.now(), progress: prev });
  };

  return (
    <div className="arcade-scroll-layout">
      {/* Debug camera logger panel */}
      <div
        style={{
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: 20,
          color: "#ccfbff",
          background: "rgba(5, 11, 24, 0.78)",
          border: "1px solid rgba(90, 236, 255, 0.4)",
          borderRadius: 10,
          padding: "10px 12px",
          minWidth: 248,
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: 11,
          lineHeight: 1.45,
          boxShadow: "0 0 18px rgba(68, 220, 255, 0.2)",
          userSelect: "none",
        }}
      >
        <div style={{ marginBottom: 8, color: "#8ff6ff" }}>CAMERA LOGGER</div>
        <button
          type="button"
          onClick={() => setFreeMove((prev) => !prev)}
          style={{
            marginBottom: 8,
            width: "100%",
            background: freeMove ? "#18465a" : "#2a243d",
            color: "#bff9ff",
            border: "1px solid rgba(90, 236, 255, 0.5)",
            borderRadius: 6,
            padding: "6px 8px",
            cursor: "pointer",
          }}
        >
          {freeMove ? "Free Move: ON" : "Spline Mode: ON"}
        </button>
        <div>P: {telemetry.progress.toFixed(3)}</div>
        <div>TP: {telemetry.targetProgress.toFixed(3)}</div>
        <div>
          C: [{telemetry.camera.x.toFixed(3)}, {telemetry.camera.y.toFixed(3)},{" "}
          {telemetry.camera.z.toFixed(3)}]
        </div>
        <div>
          L: [{telemetry.look.x.toFixed(3)}, {telemetry.look.y.toFixed(3)},{" "}
          {telemetry.look.z.toFixed(3)}]
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button
            type="button"
            onClick={() => goToCheckpoint(-1)}
            disabled={freeMove}
            style={{
              flex: 1,
              background: freeMove ? "#1a2131" : "#0f2e3c",
              color: freeMove ? "#8398aa" : "#bff9ff",
              border: "1px solid rgba(90, 236, 255, 0.5)",
              borderRadius: 6,
              padding: "6px 8px",
              cursor: freeMove ? "not-allowed" : "pointer",
            }}
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => goToCheckpoint(1)}
            disabled={freeMove}
            style={{
              flex: 1,
              background: freeMove ? "#1a2131" : "#0f2e3c",
              color: freeMove ? "#8398aa" : "#bff9ff",
              border: "1px solid rgba(90, 236, 255, 0.5)",
              borderRadius: 6,
              padding: "6px 8px",
              cursor: freeMove ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Focus hotspots */}
      {hotspotsVisible && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 15,
            pointerEvents: "none",
          }}
        >
          {FOCUS_SHOTS.map((shot) => (
            <button
              key={`spot-${shot.id}`}
              type="button"
              onClick={() =>
                setFocusRequest({
                  id: Date.now(),
                  shotId: shot.id,
                  camera: shot.camera,
                  look: shot.look,
                })
              }
              style={{
                position: "absolute",
                left: shot.ui.left,
                top: shot.ui.top,
                width: 44,
                height: 44,
                marginLeft: -22,
                marginTop: -22,
                borderRadius: "50%",
                border: "2px solid rgba(170, 255, 68, 0.9)",
                background: "rgba(145, 255, 43, 0.18)",
                color: "#d8ff9c",
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                pointerEvents: "auto",
                boxShadow: "0 0 22px rgba(145, 255, 43, 0.42)",
              }}
              title={`Focus ${shot.label}`}
            >
              {shot.label}
            </button>
          ))}
        </div>
      )}

      {/* ESC button for focus mode */}
      {!freeMove && focusActive && (
        <button
          type="button"
          onClick={clearFocus}
          style={{
            position: "fixed",
            top: 12,
            right: 12,
            zIndex: 25,
            background: "rgba(22, 16, 36, 0.82)",
            color: "#d8f7ff",
            border: "1px solid rgba(120, 224, 255, 0.7)",
            borderRadius: 8,
            padding: "8px 12px",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: 12,
            cursor: "pointer",
            boxShadow: "0 0 16px rgba(120, 224, 255, 0.24)",
          }}
        >
          ESC
        </button>
      )}

      {/* 3D Canvas */}
      <div className="arcade-canvas-shell">
        <Canvas
          camera={{ position: [10.2, 4.9, 3.8], fov: 33, near: 0.1, far: 200 }}
          shadows
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
          onCreated={({ gl }) => {
            gl.toneMappingExposure = 0.95;
          }}
        >
          <color attach="background" args={["#000000"]} />

          {cameraLoggerOn ? <CameraLogger every={0.35} /> : null}

          <ModelLoadGate onReady={() => setIntroCanStart(true)} />

          <ScrollPathCameraRig
            onTelemetry={setTelemetry}
            jumpRequest={jumpRequest}
            focusRequest={focusRequest}
            clearFocusRequest={clearFocusRequest}
            onFocusChange={setFocusActive}
            enabled={!freeMove}
            introCanStart={introCanStart}
          />
          <FreeCameraTelemetry
            onTelemetry={setTelemetry}
            controlsRef={controlsRef}
            enabled={freeMove}
          />

          <OrbitControls
            ref={controlsRef}
            enabled={freeMove}
            enableDamping
            dampingFactor={0.08}
          />
          <Scene machineHoverEnabled={machineHoverEnabled} />
        </Canvas>
      </div>
    </div>
  );
}
