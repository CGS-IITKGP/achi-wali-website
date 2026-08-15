"use client";

import FirstPersonController from "./FirstPersonController";
import DoorInteraction from "./DoorInteraction";
import VideoInteraction from "./VideoInteraction";
import SceneCollision from "./collision/SceneCollision";

type ExperienceModeProps = {
  enabled: boolean;

  onInteractionChange?: (
    text: string | null
  ) => void;

  onPointerLockChange?: (
    locked: boolean
  ) => void;
};

/*
 * ========================================
 * THIS IS THE ONLY EXPERIENCE WRAPPER.
 * Do NOT also render ExperienceScene.tsx.
 *
 * IMPORTANT: This component lives INSIDE
 * <Canvas> (it uses useFrame/useThree).
 * It must NOT render any DOM elements
 * (div, etc). The HUD is a DOM overlay
 * and must be rendered by the PARENT
 * (NewClient.tsx) OUTSIDE the <Canvas>,
 * using the onInteractionChange callback.
 * ========================================
 */

export default function ExperienceMode({
  enabled,
  onInteractionChange,
  onPointerLockChange,
}: ExperienceModeProps) {
  if (!enabled) {
    return null;
  }

  return (
    <>
      {/* 
        NOTE: Order matters! FirstPersonController moves the camera, 
        then SceneCollision corrects it immediately in the same frame. 
      */}
      <FirstPersonController
        enabled={enabled}
        onPointerLockChange={
          onPointerLockChange
        }
      />

      <SceneCollision enabled={enabled} />

      <DoorInteraction
        enabled={enabled}
        onInteractionChange={
          onInteractionChange
        }
      />

      <VideoInteraction
        enabled={enabled}
      />
    </>
  );
}