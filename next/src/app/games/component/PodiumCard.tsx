"use client";

import React from "react";
import { righteousFont } from "@/app/fonts";
import { formatValue } from "./utils/formatValue";

interface PlayerRow {
  username: string;
  score: number;
  scoreStr: string;
}

const PodiumCard: React.FC<{
  player: PlayerRow;
  place: number;
  unit?: string;
}> = ({ player, place, unit = "pts" }) => {
  const styles: Record<
    number,
    { ring: string; accent: string; label: string }
  > = {
    1: {
      ring: "#ff3d8b",
      accent: "#ffd1e3",
      label: "1ST",
    },
    2: {
      ring: "rgba(255,255,255,0.35)",
      accent: "#e8e8ee",
      label: "2ND",
    },
    3: {
      ring: "rgba(255,170,90,0.65)",
      accent: "#ffd2a8",
      label: "3RD",
    },
  };

  const s = styles[place];
  const isFirst = place === 1;

  return (
    <div
      className={`
        podium-card
        relative overflow-hidden rounded-xl border p-5 backdrop-blur-xl
        ${isFirst ? "podium-card-first scale-[1.03]" : ""}
      `}
    >
      <div className="mb-5 flex items-center justify-between">
        <span
          className="rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.3em]"
          style={{
            borderColor: s.ring,
            color: s.accent,
          }}
        >
          {s.label} PLACE
        </span>

        <span
          className={`${righteousFont.className} place-number`}
          style={{
            color: s.accent,
          }}
        >
          #{place}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <img
          src="/default-fallback-image.png"
          alt={player.username}
          className="h-14 w-14 rounded-full object-cover"
          style={{
            boxShadow: `0 0 0 2px ${s.ring}`,
          }}
        />
        <div className="min-w-0">
          <div
            className={`${righteousFont.className} truncate text-xl font-semibold text-white`}
          >
            {player.username}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
          Score
        </div>

        <div
          className={`${righteousFont.className} score-value tabular-nums`}
          style={{
            color: isFirst ? "#ff3d8b" : "#fff",
          }}
        >
          {formatValue(player.score, player.scoreStr)}
        </div>
      </div>
    </div>
  );
};

export default PodiumCard;