"use client";

import {
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  useCallback,
  useEffect,
  useRef,
} from "react";

import * as THREE from "three";

type FirstPersonControllerProps = {
  enabled: boolean;

  onPointerLockChange?: (
    locked: boolean
  ) => void;
};

const LOOK_SPEED = 0.0022;
const MAX_PITCH = THREE.MathUtils.degToRad(88);

export default function FirstPersonController({
  enabled,
  onPointerLockChange,
}: FirstPersonControllerProps) {
  const {
    camera,
    gl,
  } = useThree();

  const keysRef = useRef<Record<string, boolean>>({});
  const initializedRef = useRef(false);
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const startYRef = useRef(0);
  const pointerLockedRef = useRef(false);

  // --- NEW: DYNAMIC SPEED CONTROL ---
  const moveSpeedRef = useRef(8.25);
  const SPEED_STEP = 0.5; // Kitna speed badhega per scroll
  const MIN_SPEED = 2.0;
  const MAX_SPEED = 25.0;

  /*
   * ========================================
   * INITIALIZE FROM CURRENT NORMAL CAMERA
   * ========================================
   */
  const initializeCamera = useCallback(() => {
    if (initializedRef.current) {
      return;
    }

    const euler = new THREE.Euler(0, 0, 0, "YXZ");
    euler.setFromQuaternion(camera.quaternion);

    yawRef.current = euler.y;
    pitchRef.current = euler.x;
    startYRef.current = camera.position.y;
    camera.rotation.order = "YXZ";
    initializedRef.current = true;

    console.log(
      "[FirstPersonController] Experience start:",
      camera.position.toArray()
    );
    console.log(
      "[FirstPersonController] Experience rotation:",
      camera.rotation.toArray()
    );
  }, [camera]);

  /*
   * ========================================
   * REQUEST POINTER LOCK
   * ========================================
   */
  const requestPointerLock = useCallback(() => {
    if (!enabled) {
      return;
    }
    if (document.pointerLockElement === gl.domElement) {
      return;
    }
    gl.domElement.requestPointerLock();
  }, [enabled, gl.domElement]);

  /*
   * ========================================
   * CLICK CANVAS TO LOCK
   * ========================================
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const element = gl.domElement;
    const handlePointerDown = () => {
      requestPointerLock();
    };
    element.addEventListener("pointerdown", handlePointerDown);
    return () => {
      element.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [enabled, gl.domElement, requestPointerLock]);

  /*
   * ========================================
   * POINTER LOCK STATE
   * ========================================
   */
  useEffect(() => {
    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === gl.domElement;
      pointerLockedRef.current = locked;
      onPointerLockChange?.(locked);
    };
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    return () => {
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
    };
  }, [gl.domElement, onPointerLockChange]);

  /*
   * ========================================
   * MOUSE LOOK & SCROLL WHEEL SPEED
   * ========================================
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!pointerLockedRef.current) return;

      yawRef.current -= event.movementX * LOOK_SPEED;
      pitchRef.current -= event.movementY * LOOK_SPEED;
      pitchRef.current = THREE.MathUtils.clamp(
        pitchRef.current,
        -MAX_PITCH,
        MAX_PITCH
      );
    };

    // --- NEW: SPEED CONTROL LOGIC ---
    const handleWheel = (event: WheelEvent) => {
      if (!pointerLockedRef.current) return;

      if (event.deltaY < 0) {
        // Scroll Up -> Speed Increase
        moveSpeedRef.current = Math.min(MAX_SPEED, moveSpeedRef.current + SPEED_STEP);
      } else if (event.deltaY > 0) {
        // Scroll Down -> Speed Decrease
        moveSpeedRef.current = Math.max(MIN_SPEED, moveSpeedRef.current - SPEED_STEP);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [enabled]);

  /*
   * ========================================
   * KEYBOARD
   * ========================================
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      keysRef.current[event.key.toLowerCase()] = true;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysRef.current[event.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [enabled]);

  /*
   * ========================================
   * RESET
   * ========================================
   */
  useEffect(() => {
    if (enabled) {
      initializedRef.current = false;
      pointerLockedRef.current = document.pointerLockElement === gl.domElement;
      return;
    }

    Object.keys(keysRef.current).forEach((key) => {
      keysRef.current[key] = false;
    });

    if (document.pointerLockElement === gl.domElement) {
      document.exitPointerLock();
    }

    pointerLockedRef.current = false;
    initializedRef.current = false;
    onPointerLockChange?.(false);
  }, [enabled, gl.domElement, onPointerLockChange]);

  /*
   * ========================================
   * MOVEMENT
   * ========================================
   */
  useFrame((_, delta) => {
    if (!enabled) {
      return;
    }

    initializeCamera();

    camera.rotation.set(
      pitchRef.current,
      yawRef.current,
      0,
      "YXZ"
    );

    const keys = keysRef.current;
    const forward = new THREE.Vector3(
      -Math.sin(yawRef.current),
      0,
      -Math.cos(yawRef.current)
    );
    const right = new THREE.Vector3(
      Math.cos(yawRef.current),
      0,
      -Math.sin(yawRef.current)
    );

    const movement = new THREE.Vector3();

    if (keys["w"] || keys["arrowup"]) movement.add(forward);
    if (keys["s"] || keys["arrowdown"]) movement.sub(forward);
    if (keys["d"] || keys["arrowright"]) movement.add(right);
    if (keys["a"] || keys["arrowleft"]) movement.sub(right);

    // Sprint modifier: Double speed when Shift is held
    const isSprinting = Boolean(keys["shift"]);
    const speedMultiplier = isSprinting ? 2.0 : 1.0;

    if (movement.lengthSq() > 0) {
      movement.normalize();
      
      // Use dynamic speed value with sprint multiplier
      movement.multiplyScalar(moveSpeedRef.current * speedMultiplier * delta);
      camera.position.add(movement);
    }

    camera.position.y = startYRef.current;
  });

  return null;
}