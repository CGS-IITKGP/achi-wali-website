"use client";

import React, { useEffect, useMemo, useState } from "react";
import { righteousFont, robotoFont } from "@/app/fonts";
import PodiumCard from "./PodiumCard";
import "./style/Leaderboard.css";
import { formatValue } from "./utils/formatValue";
import api from "../../axiosApi";
import { SDOut } from "@/lib/types/index.types";
import { GAMES } from "@/app/games/sample-data/leaderboard-data";

// We default to the first game in the list once it's fetched, or a known ID
const DEFAULT_GAME_ID = "tyagi-uchalo";

const Leaderboard: React.FC = () => {
  // --- Leaderboard scores state ---
  const [scores, setScores] = useState<SDOut.GameScore.Get>([]);
  const [scoresLoading, setScoresLoading] = useState<boolean>(true);
  const [scoresError, setScoresError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // --- Game list state (fetched from backend) ---
  const [gameIds, setGameIds] = useState<string[]>([]);
  const [gamesLoading, setGamesLoading] = useState<boolean>(true);

  // --- Game switcher UI state ---
  const [selectedGameId, setSelectedGameId] = useState<string>(DEFAULT_GAME_ID);
  const [gameSearch, setGameSearch] = useState<string>("");
  const [isGameDropdownOpen, setIsGameDropdownOpen] = useState<boolean>(false);
  const [recentGames, setRecentGames] = useState<string[]>([DEFAULT_GAME_ID]);

  // Restore recent games from localStorage on mount
  useEffect(() => {
    const storedGames = localStorage.getItem("recentGames");
    if (storedGames) {
      try {
        const parsed = JSON.parse(storedGames);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentGames(parsed);
        }
      } catch (err) {
      }
    }
  }, []);

  // Fetch distinct game IDs from the backend on mount
  useEffect(() => {
    const fetchGameList = async () => {
      const response = await api("GET", "/game/list");
      if (response.action === true && Array.isArray(response.data)) {
        const fetched = response.data as string[];
        setGameIds(fetched);
        if (fetched.length > 0) {
          // If selectedGameId is not in the list or is default, switch to the first active game with scores
          setSelectedGameId((current) => {
            if (!current || !fetched.includes(current)) {
              return fetched[0];
            }
            return current;
          });
          setRecentGames((prev) => {
            const combined = Array.from(new Set([...fetched, ...prev]));
            return combined.slice(0, 5);
          });
        }
      }
      setGamesLoading(false);
    };

    fetchGameList();
  }, []);

  const handleGameSelect = (id: string): void => {
    setSelectedGameId(id);

    if (recentGames.includes(id)) return;

    const updatedGames = [...recentGames, id].slice(-5);
    setRecentGames(updatedGames);
    localStorage.setItem("recentGames", JSON.stringify(updatedGames));
  };

  // Fetch leaderboard scores (live polling every 5 seconds)
  useEffect(() => {
    if (!selectedGameId) return;

    const fetchScores = async (isInitial = false) => {
      if (isInitial) setScoresLoading(true);
      try {
        const response = await api("GET", "/game/score", {
          query: {
            target: "leaderboard",
            gameId: selectedGameId,
          },
        });

        if (response.action === true) {
          setScores(response.data as SDOut.GameScore.Get);
          setScoresError(null);
        } else if (response.action === false) {
          setScoresError(response.message);
        } else if (response.action === null) {
          setScoresError("Failed to fetch leaderboard. Please try again.");
        }
      } catch (e) {
      } finally {
        if (isInitial) setScoresLoading(false);
      }
    };

    fetchScores(true);

    const interval = setInterval(() => fetchScores(false), 5000);
    return () => clearInterval(interval);
  }, [selectedGameId]);

  // Build a lookup from gameId → metadata (name, tag) using the static GAMES array.
  // The backend only returns game IDs; GAMES provides display names for known games.
  const gameMetaById = useMemo(() => {
    const map = new Map(GAMES.map((g) => [g.id, g]));
    return map;
  }, []);

  // Display name for a game ID — fall back to a formatted title if not in static GAMES
  const gameName = (id: string) => {
    if (!id) return "";
    const known = gameMetaById.get(id)?.name;
    if (known) return known;
    return id
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };
  const gameTag = (id: string) => gameMetaById.get(id)?.tag ?? "arcade";

  // Games visible in the search dropdown — filtered by the search input
  const filteredGameIds = useMemo(() => {
    if (!gameSearch.trim()) return gameIds;
    return gameIds.filter((id) =>
      gameName(id).toLowerCase().includes(gameSearch.toLowerCase())
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameIds, gameSearch]);

  // Tabs shown below the search bar — only games that appear in the fetched list
  const recentGameIds = useMemo(() => {
    return recentGames.filter((id) => gameIds.includes(id));
  }, [recentGames, gameIds]);

  const podium = useMemo(() => scores.slice(0, 3), [scores]);

  const filteredRows = useMemo(() => {
    return scores.filter((entry) =>
      entry.player.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [scores, searchTerm]);

  return (
    <div
      data-testid="leaderboard-root"
      className={`${robotoFont.className} leaderboard-root w-full overflow-hidden rounded-3xl text-white`}
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

            <h1 className={`${righteousFont.className} title text-pink-500`}>
              Leaderboard
            </h1>

            <p className="mt-2 max-w-xl text-sm text-white/55 md:text-base">
              Top players ranked by performance across CGS-Lab games.
              <span className="ml-2 text-white/80">
                {gameName(selectedGameId)}
              </span>
              {gameTag(selectedGameId) && (
                <>
                  {" · "}
                  {gameTag(selectedGameId)}
                </>
              )}
            </p>
          </div>
        </header>

        {/* Game Search */}
        <div className="mb-4">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder={gamesLoading ? "Loading games..." : "Search games..."}
              disabled={gamesLoading}
              value={gameSearch}
              onFocus={() => setIsGameDropdownOpen(true)}
              onBlur={() => setIsGameDropdownOpen(false)}
              onChange={(e) => {
                setGameSearch(e.target.value);
                setIsGameDropdownOpen(true);
              }}
              className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white placeholder-white/40 backdrop-blur-md transition-all focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 disabled:opacity-50"
            />

            {gameSearch && (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setGameSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                ×
              </button>
            )}

            {isGameDropdownOpen && !gamesLoading && (
              <div className="absolute z-10 mt-2 max-h-[200px] w-full overflow-y-auto rounded-lg border border-white/10 bg-[#121212] shadow-lg">
                {filteredGameIds.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-white/40">
                    No games found
                  </p>
                ) : (
                  filteredGameIds.map((id) => (
                    <button
                      key={id}
                      onMouseDown={() => {
                        handleGameSelect(id);
                        setGameSearch("");
                        setIsGameDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-pink-500/20"
                    >
                      {gameName(id)}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Game Selector Tabs — only shows games with backend data */}
        <div className="mb-10 flex flex-wrap gap-2">
          {gamesLoading ? (
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-9 w-28 animate-pulse rounded-md border border-white/10 bg-white/[0.05]"
                />
              ))}
            </div>
          ) : recentGameIds.length === 0 ? (
            <p className="text-sm text-white/40">
              {gameIds.length === 0
                ? "No games have scores yet."
                : "Select a game from the search to pin it here."}
            </p>
          ) : (
            recentGameIds.map((id) => {
              const active = id === selectedGameId;
              return (
                <button
                  key={id}
                  onClick={() => handleGameSelect(id)}
                  className={`game-button ${active ? "game-button-active" : ""}
                    rounded-md border px-4 py-2.5 text-[13px] font-medium transition-all duration-200 hover:-translate-y-[1px]`}
                >
                  <span className="mr-2 opacity-60">/</span>
                  {gameName(id)}
                </button>
              );
            })
          )}
        </div>

        {/* Loading / Error / Content */}
        {scoresLoading ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.025] px-6 py-24 text-center text-white/50 animate-pulse">
            Loading leaderboard...
          </div>
        ) : scoresError ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-24 text-center text-red-400">
            {scoresError}
          </div>
        ) : (
          <>
            {/* Podium */}
            {podium.length > 0 && (
              <section className="mb-10 flex items-end justify-center gap-2 md:gap-4">
                {podium.length > 1 && (
                  <div className="w-1/3 order-1 mb-4 md:mb-8">
                    <PodiumCard
                      key={podium[1]._id}
                      player={{ username: podium[1].player.username, score: podium[1].score, scoreStr: podium[1].scoreStr }}
                      place={2}
                      unit="pts"
                    />
                  </div>
                )}
                {podium.length > 0 && (
                  <div className="w-1/3 order-2 z-10">
                    <PodiumCard
                      key={podium[0]._id}
                      player={{ username: podium[0].player.username, score: podium[0].score, scoreStr: podium[0].scoreStr }}
                      place={1}
                      unit="pts"
                    />
                  </div>
                )}
                {podium.length > 2 && (
                  <div className="w-1/3 order-3 mb-8 md:mb-16">
                    <PodiumCard
                      key={podium[2]._id}
                      player={{ username: podium[2].player.username, score: podium[2].score, scoreStr: podium[2].scoreStr }}
                      place={3}
                      unit="pts"
                    />
                  </div>
                )}
              </section>
            )}

            {/* Player Search Bar */}
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

            <section className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.025] backdrop-blur-xl">
            <div className="grid grid-cols-12 border-b border-white/10 px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-white/45">
              <div className="col-span-2">#</div>
              <div className="col-span-7">Player</div>
              <div className="col-span-3 text-right">Score</div>
            </div>

            <div className="leaderboard-scroll max-h-[400px] overflow-y-auto">
              <ul>
                {filteredRows.length === 0 ? (
                  <li className="px-5 py-8 text-center text-white/50">
                    {scores.length === 0
                      ? "No scores yet, be the first to play!"
                      : "No players found"}
                  </li>
                ) : (
                  filteredRows.map((r) => {
                    const rank = scores.findIndex((s) => s._id === r._id) + 1;
                    return (
                      <li
                        key={r._id}
                        className="grid grid-cols-12 items-center border-b border-white/[0.06] px-5 py-3.5 transition-colors hover:bg-[linear-gradient(160deg,rgba(255,61,139,0.28)_0%,rgba(20,8,24,0.7)_70%)]
                                  hover:border-[rgba(255,61,139,0.6)]
                                  hover:shadow-[0_0_0_1px_rgba(255,61,139,0.25),0_6px_18px_-10px_rgba(255,61,139,0.25)]"
                      >
                        <div className="col-span-2 text-white/50">
                          {String(rank).padStart(2, "0")}
                        </div>

                        <div className="col-span-7 flex min-w-0 items-center gap-3">
                          <img
                            src={r.player.profileImgUrl || "/default-fallback-image.png"}
                            alt={r.player.username}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <div className="truncate text-[14px] text-white">
                              {r.player.username}
                            </div>
                          </div>
                        </div>

                        <div className="col-span-3 text-right font-semibold tabular-nums text-pink-300">
                          {formatValue(r.score, r.scoreStr)}
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;