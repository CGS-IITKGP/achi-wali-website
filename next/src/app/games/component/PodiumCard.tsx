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
        relative overflow-hidden rounded-xl border p-3 md:p-5 backdrop-blur-xl
        ${isFirst ? "podium-card-first md:scale-[1.03]" : ""}
      `}
    >
      <div className="mb-3 md:mb-5 flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-0">
        <span
          className="rounded-full border px-1.5 py-0.5 md:px-2.5 md:py-1 text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] self-start md:self-auto text-center"
          style={{
            borderColor: s.ring,
            color: s.accent,
          }}
        >
          {s.label} PLACE
        </span>

        <span
          className={`${righteousFont.className} place-number text-lg md:text-3xl`}
          style={{
            color: s.accent,
          }}
        >
          #{place}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4">
        <img
          src="/default-fallback-image.png"
          alt={player.username}
          className="h-10 w-10 md:h-14 md:w-14 rounded-full object-cover"
          style={{
            boxShadow: `0 0 0 2px ${s.ring}`,
          }}
        />
        <div className="min-w-0 text-center md:text-left">
          <div
            className={`${righteousFont.className} truncate text-xs md:text-xl font-semibold text-white`}
          >
            {player.username}
          </div>
        </div>
      </div>

      <div className="mt-4 md:mt-6 text-center md:text-left">
        <div className="text-[8px] md:text-[10px] uppercase tracking-[0.22em] text-white/40">
          Score
        </div>

        <div
          className={`${righteousFont.className} score-value tabular-nums text-sm md:text-2xl`}
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