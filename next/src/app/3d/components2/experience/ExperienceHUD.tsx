"use client";

type ExperienceHUDProps = {
  visible: boolean;
  interactionText: string | null;
};

export default function ExperienceHUD({
  visible,
  interactionText,
}: ExperienceHUDProps) {
  if (!visible) {
    return null;
  }

  return (
    <>
      {/* Center crosshair */}
      <div
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.95)",
          boxShadow:
            "0 0 8px rgba(255,255,255,0.75)",
          pointerEvents: "none",
          zIndex: 100,
        }}
      />

      {/* Interaction prompt */}
      {interactionText && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            top: "calc(50% + 38px)",
            transform: "translateX(-50%)",
            padding: "9px 16px",
            borderRadius: "9px",
            background: "rgba(0,0,0,0.72)",
            border:
              "1px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 500,
            letterSpacing: "0.2px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 101,
            boxShadow:
              "0 6px 24px rgba(0,0,0,0.4)",
          }}
        >
          {interactionText}
        </div>
      )}
    </>
  );
}