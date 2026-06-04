"use client";

import React, { useMemo, useState } from "react";
import { fredokaFont, jetbrainsMonoFont } from "@/app/fonts";
import { GAMES, NAMES } from "@/app/games/sample-data/leaderboard-data";
import  PodiumCard  from "./PodiumCard";
import "./style/Leaderboard.css";
import { formatValue } from "./utils/formatValue";
/*for now going with assumption that timewise: is a number*/

interface PlayerRow {
  rank: number;
  name: string;
  handle: string;
  value: number;
}

function buildBoard(type: "points" | "time"): PlayerRow[] {
  return NAMES.map((name, index) => ({
    rank: index + 1,
    name,
    handle: "@" + name.toLowerCase(),

    value:
      type === "time"
        ? 720 + index * 18
        : 12000 - index * 450,
  }));
}

const Leaderboard: React.FC = () => {
  const [gameId, setGameId] = useState<string>(GAMES[0].id);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const game = useMemo(
    () => GAMES.find((g) => g.id === gameId)!,
    [gameId]
  );
  
  const rows = useMemo(
    () => buildBoard(game.type),
    [game.type]
  );
  const sortedRows = [...rows].sort((a, b) =>
    game.type === "time"
      ? a.value - b.value
      : b.value - a.value
  );
  
  const podium = sortedRows.slice(0, 3);
  //const rest = sortedRows.slice(3);
  const rest = sortedRows;

  const filteredRows = useMemo(() => {
    return rest.filter((player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.handle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rest, searchTerm]);
  
  return (
    <div
      data-testid="leaderboard-root"
      className={`${jetbrainsMonoFont.className} leaderboard-root w-full overflow-hidden rounded-3xl text-white`}
    >
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
        
        {/* Header */}
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_12px_#ff3d8b]" />

              <span className="text-[11px] uppercase tracking-[0.25em] text-white/60">
                CGS · LIVE BOARD
              </span>
            </div>

            <h1
              className={`${fredokaFont.className} title text-pink-500`}
            >
              Leaderboard
            </h1>

            <p className="mt-2 max-w-xl text-sm text-white/55 md:text-base">
              Top players ranked by performance across CGS-Lab games.
              <span className="ml-2 text-white/80">
                {game.name}
              </span>
              {" · "}
              {game.tag}
            </p>
          </div>
        </header>

        {/* Game Selector */}
        <div className="mb-10 flex flex-wrap gap-2">
          {GAMES.map((g) => {
            const active = g.id === gameId;

            return (
              <button
                key={g.id}
                onClick={() => setGameId(g.id)}
                className={`game-button ${active ? "game-button-active" : ""}
                  rounded-md border px-4 py-2.5 text-[13px] font-medium transition-all duration-200 hover:-translate-y-[1px]`}
              >
                <span className="mr-2 opacity-60">/</span>
                {g.name}
              </button>
            );
          })}
        </div>

        {/* Podium */}
        <section className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {podium.map((p, idx) => (
            <PodiumCard
              key={p.handle}
              player={p}
              place={idx + 1}
              unit={game.unit}
              type={game.type}
            />
          ))}
        </section>

        {/* Search Bar Container */}
        <div className="mb-6 flex justify-end">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search player..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white placeholder-white/40 backdrop-blur-md transition-all focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <section className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.025] backdrop-blur-xl">
          <div className="grid grid-cols-12 border-b border-white/10 px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-white/45">
            <div className="col-span-2">#</div>
            <div className="col-span-7">Player</div>
            <div className="col-span-3 text-right">Score</div>
          </div>
          
          <div className="leaderboard-scroll max-h-[400px] overflow-y-auto">
          <ul>
            {/* No players found display */}
            {filteredRows.length === 0 ? (
              <li className="px-5 py-8 text-center text-white/50">
                No players found
              </li>
            ) : (
             filteredRows.map((r) => (
              <li
                key={r.handle}
                className="grid grid-cols-12 items-center border-b border-white/[0.06] px-5 py-3.5 transition-colors hover:bg-[linear-gradient(160deg,rgba(255,61,139,0.28)_0%,rgba(20,8,24,0.7)_70%)]
                          hover:border-[rgba(255,61,139,0.6)]
                          hover:shadow-[0_0_0_1px_rgba(255,61,139,0.25),0_6px_18px_-10px_rgba(255,61,139,0.25)]"
              >
                <div className="col-span-2 text-white/50">
                  {String(r.rank).padStart(2, "0")}
                </div>

                <div className="col-span-7 flex min-w-0 items-center gap-3">
                  <img
                    src="/default-fallback-image.png"
                    alt={r.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />

                  <div className="min-w-0">
                    <div className="truncate text-[14px] text-white">
                      {r.name}
                    </div>

                    <div className="truncate text-[11px] text-white/40">
                      {r.handle}
                    </div>
                  </div>
                </div>

                <div className="col-span-3 text-right font-semibold tabular-nums text-pink-300">
                  {formatValue(r.value, game.type)}

                  <span className="ml-1 text-[11px] font-normal text-white/35">
                    {game.unit}
                  </span>
                </div>
              </li>
            )))}
          </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Leaderboard;