"use client";

import { useEffect } from "react";

type ExperienceInteractionsProps = {
  enabled: boolean;
  onDoorInteract?: () => void;
  onVideoInteract?: () => void;
};

export default function ExperienceInteractions({
  enabled,
  onDoorInteract,
  onVideoInteract,
}: ExperienceInteractionsProps) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.repeat) {
        return;
      }

      const key = event.key.toLowerCase();

      /*
       * Door interaction
       *
       * DoorInteraction itself performs
       * the actual target-door validation.
       */
      if (key === "o") {
        onDoorInteract?.();
        return;
      }

      /*
       * Video interaction
       *
       * The actual TV/video component owns
       * the playback state.
       */
      if (key === "d") {
        onVideoInteract?.();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    enabled,
    onDoorInteract,
    onVideoInteract,
  ]);

  return null;
}