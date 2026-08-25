"use client";

import React from "react";
import { righteousFont } from "@/app/fonts";
import { formatValue } from "./utils/formatValue";

interface PlayerRow {
  username: string;
  score: number;
  scoreStr: string;
  profileImgUrl?: string;
}

const PodiumCard: React.FC<{
  player: PlayerRow;
  place: number;
  unit?: string;
}> = ({ player, place, unit = "pts" }) => {
  const styles: Record<
    number,
    {
      ring: string;
      accent: string;
      label: string;
      cardHeight: string;
      padding: string;
      avatar: string;
      name: string;
      score: string;
      placeNo: string;
    }
  > = {
    1: {
      ring: "#ff3d8b",
      accent: "#ffd1e3",
      label: "1ST",
      cardHeight: "h-[185px] md:h-[240px]",
      padding: "p-3 md:p-5",
      avatar: "h-12 w-12 md:h-16 md:w-16",
      name: "text-sm md:text-xl",
      score: "text-xl md:text-3xl",
      placeNo: "text-2xl md:text-4xl",
    },
    2: {
      ring: "rgba(255,255,255,0.35)",
      accent: "#e8e8ee",
      label: "2ND",
      cardHeight: "h-[165px] md:h-[210px]",
      padding: "p-3 md:p-4",
      avatar: "h-10 w-10 md:h-14 md:w-14",
      name: "text-xs md:text-lg",
      score: "text-lg md:text-2xl",
      placeNo: "text-xl md:text-3xl",
    },
    3: {
      ring: "rgba(255,170,90,0.65)",
      accent: "#ffd2a8",
      label: "3RD",
      cardHeight: "h-[145px] md:h-[185px]",
      padding: "p-2.5 md:p-4",
      avatar: "h-9 w-9 md:h-12 md:w-12",
      name: "text-xs md:text-base",
      score: "text-base md:text-xl",
      placeNo: "text-lg md:text-2xl",
    },
  };

  const s = styles[place];
  const isFirst = place === 1;

  return (
    <div
      className={`
        podium-card
        relative w-full overflow-hidden rounded-xl border backdrop-blur-xl
        ${s.cardHeight}
        ${s.padding}
        ${isFirst ? "podium-card-first" : ""}
      `}
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className="
            rounded-full border
            px-1.5 py-0.5
            text-[7px] uppercase tracking-[0.18em]
            md:px-2.5 md:py-1 md:text-[10px] md:tracking-[0.3em]
          "
          style={{
            borderColor: s.ring,
            color: s.accent,
          }}
        >
          {s.label} PLACE
        </span>

        <span
          className={`${righteousFont.className} place-number ${s.placeNo}`}
          style={{
            color: s.accent,
          }}
        >
          #{place}
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <img
          src={player.profileImgUrl || "/default-fallback-image.png"}
          alt={player.username}
          className={`${s.avatar} shrink-0 rounded-full object-cover`}
          style={{
            boxShadow: `0 0 0 2px ${s.ring}`,
          }}
        />

        <div className="min-w-0">
          <div
            className={`
              ${righteousFont.className}
              ${s.name}
              truncate font-semibold text-white
            `}
          >
            {player.username}
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 right-3 md:bottom-5 md:left-5 md:right-5">
        <div className="text-[8px] uppercase tracking-[0.22em] text-white/40 md:text-[10px]">
          Score
        </div>

        <div
          className={`
            ${righteousFont.className}
            score-value tabular-nums
            ${s.score}
          `}
          style={{
            color: isFirst ? "#ff3d8b" : "#fff",
          }}
        >
          {formatValue(player.score, player.scoreStr)} {unit}
        </div>
      </div>
    </div>
  );
};

export default PodiumCard;