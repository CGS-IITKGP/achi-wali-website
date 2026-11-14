"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useLayoutEffect, useRef } from "react";
const MODEL_PATH = "/models/myModel/myLatestFile.glb?v=collision-final2";

type SceneCollisionProps = {
  enabled: boolean;
};

const PLAYER_RADIUS = 0.45;
const PLAYER_HEIGHT = 1.7;
const MIN_THICKNESS = 0.5;
const BOX_PADDING = 0.05;

// Transform-based detection thresholds (fallback method)
const DOOR_POS_THRESHOLD = 0.08;
const DOOR_ANGLE_THRESHOLD = 0.05; // radians (~2.9deg)

// Debug log throttle (ms). Set to 0 to disable debug logging entirely.
const DEBUG_LOG_INTERVAL = 1000;
const DEBUG_ENABLED = true;

// ==========================================
// COLLISION NAME PREFIXES (from your GLB outliner)
// ==========================================
const INVISIBLE_COLLISION_PREFIXES = ["PROXY"];

const VISIBLE_COLLISION_PREFIXES = [
  "CHAIR",
  "SOFA",
  "ARCADE MACHINE",
  "CUBE.049",
  "CUBE049",
];

type DoorKey = "DOOR01" | "DOOR07" | "MAINDOOR";

type DoorWatcher = {
  node: THREE.Object3D;
  initPos: THREE.Vector3;
  initQuat: THREE.Quaternion;
};

// ==========================================
// EXPLICIT OVERRIDE API
// Call window.__setDoorOpen("DOOR01", true) from your
// door-interaction code (ExperienceMode / interact-on-press logic)
// to force a door's proxy to disable, regardless of transform state.
// This is the RELIABLE path if transform-based detection isn't
// picking up your door animation.
// ==========================================
const manualDoorOverride: Record<DoorKey, boolean | null> = {
  DOOR01: null,
  DOOR07: null,
  MAINDOOR: null,
};

declare global {
  interface Window {
    __setDoorOpen?: (doorKey: DoorKey, isOpen: boolean) => void;
    __clearDoorOverride?: (doorKey: DoorKey) => void;
  }
}

if (typeof window !== "undefined") {
  window.__setDoorOpen = (doorKey: DoorKey, isOpen: boolean) => {
    manualDoorOverride[doorKey] = isOpen;
    console.log(`[SceneCollision] MANUAL OVERRIDE: ${doorKey} -> ${isOpen ? "OPEN (pass-through)" : "CLOSED (blocking)"}`);
  };
  window.__clearDoorOverride = (doorKey: DoorKey) => {
    manualDoorOverride[doorKey] = null;
    console.log(`[SceneCollision] Override cleared for ${doorKey}, back to auto-detection`);
  };
}

export default function SceneCollision({ enabled }: SceneCollisionProps) {
  const { scene } = useGLTF(MODEL_PATH);
  const { camera } = useThree();

  const collisionObjectsRef = useRef<THREE.Object3D[]>([]);

  const doorWatchersRef = useRef<Record<DoorKey, DoorWatcher[]>>({
    DOOR01: [],
    DOOR07: [],
    MAINDOOR: [],
  });

  const boxRef = useRef(new THREE.Box3());
  const playerBoxRef = useRef(new THREE.Box3());
  const sizeRef = useRef(new THREE.Vector3());
  const initializedRef = useRef(false);
  const prevPosRef = useRef(new THREE.Vector3());

  const tempPosRef = useRef(new THREE.Vector3());
  const tempQuatRef = useRef(new THREE.Quaternion());

  const lastDebugLogRef = useRef(0);

  /*
   * ==========================================
   * SETUP: PROXIES, DOOR WATCHERS, VISIBILITY
   * useLayoutEffect => proxies hidden before first paint
   * ==========================================
   */
  useLayoutEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const collisionObjects: THREE.Object3D[] = [];
    const proxyNames: string[] = [];
    const doorNamesFound: Record<DoorKey, string[]> = {
      DOOR01: [],
      DOOR07: [],
      MAINDOOR: [],
    };

    const registerDoorWatchers = (doorKey: DoorKey, root: THREE.Object3D) => {
      const watchers = doorWatchersRef.current[doorKey];
      root.updateWorldMatrix(true, true);
      root.traverse((node) => {
        const initPos = new THREE.Vector3();
        const initQuat = new THREE.Quaternion();
        node.getWorldPosition(initPos);
        node.getWorldQuaternion(initQuat);
        watchers.push({ node, initPos, initQuat });
      });
      doorNamesFound[doorKey].push(root.name);
    };

    scene.traverse((object) => {
      const upperName = object.name.toUpperCase();

      // 1. VISIBLE DOORS -> track for state, NEVER add to collision list
      let doorKey: DoorKey | null = null;
      if (upperName === "DOOR01" || upperName === "DOOR.01") {
        doorKey = "DOOR01";
      } else if (upperName === "DOOR07" || upperName === "DOOR.07") {
        doorKey = "DOOR07";
      } else if (upperName.startsWith("MAINDOOR")) {
        doorKey = "MAINDOOR";
      }

      if (doorKey) {
        registerDoorWatchers(doorKey, object);
        return;
      }

      // 2. PROXIES + VISIBLE SOLID FURNITURE -> collision list
      const isProxyCollider = INVISIBLE_COLLISION_PREFIXES.some((prefix) =>
        upperName.startsWith(prefix)
      );
      const isVisibleCollider = VISIBLE_COLLISION_PREFIXES.some((prefix) =>
        upperName.startsWith(prefix)
      );

      if (isProxyCollider || isVisibleCollider) {
        collisionObjects.push(object);

        if (isProxyCollider) {
          proxyNames.push(object.name);
          object.visible = false;

          if (object instanceof THREE.Mesh) {
            const materials = Array.isArray(object.material)
              ? object.material
              : [object.material];
            materials.forEach((mat) => {
              mat.transparent = true;
              mat.opacity = 0;
              mat.depthWrite = false;
            });
          }
        }
      }
    });

    collisionObjectsRef.current = collisionObjects;

    console.log("[SceneCollision] Total collision objects loaded:", collisionObjects.length);
    console.log("[SceneCollision] Proxy meshes found:", proxyNames);
    console.log("[SceneCollision] Door roots registered:", doorNamesFound);
    console.log(
      "[SceneCollision] Watcher counts -> DOOR01:",
      doorWatchersRef.current.DOOR01.length,
      "DOOR07:",
      doorWatchersRef.current.DOOR07.length,
      "MAINDOOR:",
      doorWatchersRef.current.MAINDOOR.length
    );

    if (doorWatchersRef.current.DOOR01.length === 0) {
      console.warn("[SceneCollision] WARNING: No DOOR01 node found in GLB. PROXY_DOOR_01 will ALWAYS block.");
    }
    if (doorWatchersRef.current.DOOR07.length === 0) {
      console.warn("[SceneCollision] WARNING: No DOOR07 node found in GLB. PROXY_DOOR_07 will ALWAYS block.");
    }
    if (doorWatchersRef.current.MAINDOOR.length === 0) {
      console.warn("[SceneCollision] WARNING: No MAINDOOR* node found in GLB. PROXY_DOOR_MAIN will ALWAYS block.");
    }
  }, [scene]);

  /*
   * ==========================================
   * HELPER: IS DOOR OPEN?
   * Priority: manual override (if set) > transform detection
   * ==========================================
   */
  const isDoorOpen = (doorKey: DoorKey, doDebug: boolean): boolean => {
    // 1. Manual override always wins if set
    const override = manualDoorOverride[doorKey];
    if (override !== null) {
      return override;
    }

    // 2. Transform-based auto detection
    const watchers = doorWatchersRef.current[doorKey];
    if (watchers.length === 0) return false;

    const tempPos = tempPosRef.current;
    const tempQuat = tempQuatRef.current;

    let maxPosDelta = 0;
    let maxAngleDelta = 0;
    let open = false;

    for (const watcher of watchers) {
      watcher.node.updateWorldMatrix(true, false);
      watcher.node.getWorldPosition(tempPos);
      watcher.node.getWorldQuaternion(tempQuat);

      const posDelta = tempPos.distanceTo(watcher.initPos);
      const angleDelta = tempQuat.angleTo(watcher.initQuat);

      if (posDelta > maxPosDelta) maxPosDelta = posDelta;
      if (angleDelta > maxAngleDelta) maxAngleDelta = angleDelta;

      if (posDelta > DOOR_POS_THRESHOLD || angleDelta > DOOR_ANGLE_THRESHOLD) {
        open = true;
      }
    }

    if (DEBUG_ENABLED && doDebug) {
      console.log(
        `[door debug] ${doorKey} -> posDelta=${maxPosDelta.toFixed(4)} (thresh ${DOOR_POS_THRESHOLD}) angleDelta=${maxAngleDelta.toFixed(4)}rad (thresh ${DOOR_ANGLE_THRESHOLD}) => ${open ? "OPEN" : "CLOSED"}`
      );
    }

    return open;
  };

  /*
   * ==========================================
   * BUILD PLAYER BOX
   * ==========================================
   */
  const getPlayerBox = (position: THREE.Vector3) => {
    playerBoxRef.current.set(
      new THREE.Vector3(
        position.x - PLAYER_RADIUS,
        position.y - PLAYER_HEIGHT,
        position.z - PLAYER_RADIUS
      ),
      new THREE.Vector3(
        position.x + PLAYER_RADIUS,
        position.y,
        position.z + PLAYER_RADIUS
      )
    );
    return playerBoxRef.current;
  };

  /*
   * ==========================================
   * CHECK COLLISION
   * ==========================================
   */
  const checkCollision = (
    position: THREE.Vector3,
    doorStates: Record<DoorKey, boolean>
  ): boolean => {
    const playerBox = getPlayerBox(position);
    const box = boxRef.current;
    const size = sizeRef.current;

    for (const object of collisionObjectsRef.current) {
      const name = object.name.toUpperCase();

      if (name.includes("PROXY_DOOR_01")) {
        if (doorStates.DOOR01) continue;
      } else if (name.includes("PROXY_DOOR_07")) {
        if (doorStates.DOOR07) continue;
      } else if (name.includes("PROXY_DOOR_MAIN")) {
        if (doorStates.MAINDOOR) continue;
      }

      object.updateWorldMatrix(true, true);
      box.setFromObject(object);

      box.getSize(size);

      if (size.x < MIN_THICKNESS) {
        box.min.x -= MIN_THICKNESS / 2;
        box.max.x += MIN_THICKNESS / 2;
      }
      if (size.y < MIN_THICKNESS) {
        box.min.y -= MIN_THICKNESS / 2;
        box.max.y += MIN_THICKNESS / 2;
      }
      if (size.z < MIN_THICKNESS) {
        box.min.z -= MIN_THICKNESS / 2;
        box.max.z += MIN_THICKNESS / 2;
      }

      box.expandByScalar(BOX_PADDING);

      if (box.intersectsBox(playerBox)) {
        return true;
      }
    }
    return false;
  };

  /*
   * ==========================================
   * COLLISION MOVEMENT (X/Z-separated sliding)
   * ==========================================
   */
  useLayoutEffect(() => {
    if (enabled) {
      prevPosRef.current.copy(camera.position);
    }
  }, [enabled, camera]);

  useFrame(() => {
    if (!enabled || collisionObjectsRef.current.length === 0) return;

    const now = performance.now();
    const doDebug = DEBUG_ENABLED && now - lastDebugLogRef.current > DEBUG_LOG_INTERVAL;
    if (doDebug) lastDebugLogRef.current = now;

    const doorStates: Record<DoorKey, boolean> = {
      DOOR01: isDoorOpen("DOOR01", doDebug),
      DOOR07: isDoorOpen("DOOR07", doDebug),
      MAINDOOR: isDoorOpen("MAINDOOR", doDebug),
    };

    const currentPosition = camera.position.clone();

    const testX = prevPosRef.current.clone();
    testX.x = currentPosition.x;

    if (checkCollision(testX, doorStates)) {
      camera.position.x = prevPosRef.current.x;
      currentPosition.x = prevPosRef.current.x;
    }

    const testZ = currentPosition.clone();

    if (checkCollision(testZ, doorStates)) {
      camera.position.z = prevPosRef.current.z;
    }

    prevPosRef.current.copy(camera.position);
  });

  return null;
}

useGLTF.preload(MODEL_PATH);