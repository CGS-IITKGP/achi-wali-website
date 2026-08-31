"use client";

/*
 * ========================================
 * DEPRECATED - DO NOT USE
 * ========================================
 *
 * This component has been merged into
 * ExperienceMode.tsx.
 *
 * Rendering this alongside ExperienceMode
 * was causing duplicate DoorInteraction
 * and FirstPersonController instances to
 * fight over the same scene objects and
 * camera every frame - that was why doors
 * detected but would not visually open,
 * and why WASD felt locked to one
 * direction.
 *
 * ACTION REQUIRED:
 * Find wherever <ExperienceScene ... />
 * is rendered (likely your main page.tsx
 * or a layout component) and replace it
 * with <ExperienceMode enabled={...} />.
 *
 * Then delete this file.
 * ========================================
 */

export default function ExperienceScene() {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[ExperienceScene] DEPRECATED: this component is disabled. " +
        "Use ExperienceMode.tsx instead. See comment at top of this file."
    );
  }

  return null;
}