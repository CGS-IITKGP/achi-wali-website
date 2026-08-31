"use client";

import { robotoFont, righteousFont } from "../../fonts";
import Image from "next/image";
import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Github,
  Gamepad2,
  X,
  Trophy,
  ExternalLink,
} from "lucide-react";
import { IProject } from "@/app/types/index.types";
import { prettySafeImage } from "@/app/utils/pretty";
import api from "../../axiosApi";

// Defined constants for fallback URLs to keep logic clean.
// ⭐️ CHANGE: Added a default image path. MAKE SURE THIS FILE EXISTS IN /public
const DEFAULT_GAME_IMAGE = "/placeholder-game.png"; 
// How long to wait for the iframe to actually load before assuming the host
// blocked framing (e.g. itch.io's frame-ancestors CSP) and showing a fallback.
// NOTE: Unity/WebGL builds served through itch.io's embed wrapper commonly
// take 8-15+ seconds to fire `onLoad` (itch's own loader scripts + analytics
// run before the game's document finishes) — this must stay generous or
// slow-but-working embeds get misclassified as "blocked".
const EMBED_TIMEOUT_MS = 20000;
// After this much time, we let the user know it's still working rather than
// leaving them staring at a bare spinner with no explanation.
const EMBED_SLOW_HINT_MS = 7000;

// A fully separate component, rendered via a portal directly into
// document.body (see the createPortal call in GameClient below). This is
// what actually solves the "hidden behind the navbar" problem: any
// motion.div ancestor with a CSS transform creates a new containing block,
// which silently breaks `position: fixed` for anything nested inside it —
// the fixed element ends up positioned relative to that ancestor instead of
// the real viewport. Portaling straight to <body> sidesteps that entirely.
function GamePlayerOverlay({
  playingEmbedUrl,
  gameId,
  title,
  embedBlocked,
  embedLoading,
  embedSlow,
  embedRetryCount,
  onRetry,
  onClose,
  onIframeLoad,
}: {
  playingEmbedUrl: string | null;
  gameId: string;
  title: string;
  embedBlocked: boolean;
  embedLoading: boolean;
  embedSlow: boolean;
  embedRetryCount: number;
  onRetry: () => void;
  onClose: () => void;
  onIframeLoad: () => void;
}) {
  const [leaderboardScores, setLeaderboardScores] = useState<any[]>([]);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Fetch scores when the overlay opens or gameId changes
  useEffect(() => {
    if (!playingEmbedUrl || !gameId) {
      setLeaderboardScores([]);
      setIsLeaderboardOpen(false);
      return;
    }

    const fetchScores = async () => {
      setLoadingLeaderboard(true);
      try {
        const response = await api("GET", "/game/score", {
          query: { target: "leaderboard", gameId },
        });
        if (response.action === true) {
          setLeaderboardScores((response.data as any[]) || []);
        }
      } catch (error) {
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchScores();
  }, [playingEmbedUrl, gameId]);

  return (
    <AnimatePresence>
      {playingEmbedUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-[1600px] aspect-video max-h-[88vh] rounded-2xl overflow-hidden shadow-2xl border border-pink-500/20 bg-black flex flex-col"
          >
            <div className="px-4 py-3 bg-gray-950 border-b border-gray-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3 truncate pr-4">
                <h3 className={`text-lg sm:text-xl font-bold text-white truncate ${righteousFont.className}`}>
                  Playing: {title}
                </h3>
                {playingEmbedUrl && !embedBlocked && (
                  <button
                    onClick={() => setIsLeaderboardOpen(!isLeaderboardOpen)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all duration-300 ${
                      isLeaderboardOpen
                        ? "bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/25"
                        : "bg-gray-900 border-gray-800 text-gray-300 hover:text-white hover:border-gray-700"
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5 fill-current" />
                    Leaderboard
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
                Close Game
              </button>
            </div>

            <div className="relative w-full flex-1 bg-black flex overflow-hidden">
              <div className="relative flex-1 h-full">
                {embedBlocked ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6">
                    <Gamepad2 className="w-12 h-12 text-gray-600" />
                    <div className="space-y-2">
                      <p className={`text-white text-lg font-semibold ${righteousFont.className}`}>
                        This game didn&apos;t load
                      </p>
                      <p className={`text-gray-400 text-sm max-w-md ${robotoFont.className}`}>
                        Either the host blocks in-page embedding for this
                        link, or something (like a browser extension)
                        interrupted the load. Try again, or open it
                        directly.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={onRetry}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 border border-gray-700"
                      >
                        Retry
                      </button>
                      <a
                        href={playingEmbedUrl ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                      >
                        <Play className="w-4 h-4" />
                        Open Game
                      </a>
                    </div>
                  </div>
                ) : (
                  <>
                    {embedLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400 px-6 text-center z-10 bg-black">
                        <div className="w-6 h-6 border-2 border-gray-600 border-t-pink-500 rounded-full animate-spin" />
                        <span className={robotoFont.className}>Loading game…</span>
                        {embedSlow && (
                          <div className="space-y-2 mt-2">
                            <p className={`text-gray-500 text-sm max-w-sm ${robotoFont.className}`}>
                              This is taking a while — larger games can take
                              a bit to load. Still waiting, or you can open
                              it directly instead.
                            </p>
                            {playingEmbedUrl && (
                              <a
                                href={playingEmbedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-400 hover:text-pink-300 text-sm underline underline-offset-2"
                              >
                                Open in a new tab
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <iframe
                      key={`${playingEmbedUrl}-${embedRetryCount}`}
                      src={playingEmbedUrl ?? undefined}
                      title={`Playing ${title}`}
                      className="w-full h-full border-none"
                      onLoad={onIframeLoad}
                      allow="autoplay; fullscreen; gamepad"
                      allowFullScreen
                    ></iframe>
                  </>
                )}
              </div>

              {/* Glassmorphic Slide-out Leaderboard Panel */}
              <AnimatePresence>
                {isLeaderboardOpen && !embedBlocked && (
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute right-0 top-0 bottom-0 w-80 bg-gray-950/80 backdrop-blur-xl border-l border-gray-800 z-20 flex flex-col shadow-2xl"
                  >
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0">
                      <h4 className={`text-md font-bold text-white flex items-center gap-2 ${righteousFont.className}`}>
                        <Trophy className="w-4 h-4 text-pink-500 fill-pink-500" />
                        Top Scores
                      </h4>
                      <button
                        onClick={() => setIsLeaderboardOpen(false)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                      {loadingLeaderboard ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
                          <div className="w-5 h-5 border-2 border-gray-600 border-t-pink-500 rounded-full animate-spin" />
                          <span className="text-xs">Loading scores…</span>
                        </div>
                      ) : leaderboardScores.length === 0 ? (
                        <div className="text-center text-gray-500 py-10 text-sm">
                          No scores submitted yet. Be the first!
                        </div>
                      ) : (
                        leaderboardScores.map((score, index) => (
                          <div
                            key={score._id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                              index === 0
                                ? "bg-pink-500/10 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                                : index === 1
                                ? "bg-purple-500/10 border-purple-500/20"
                                : index === 2
                                ? "bg-fuchsia-500/10 border-fuchsia-500/20"
                                : "bg-white/5 border-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  index === 0
                                    ? "bg-pink-500 text-white"
                                    : index === 1
                                    ? "bg-purple-500 text-white"
                                    : index === 2
                                    ? "bg-fuchsia-500 text-white"
                                    : "bg-gray-800 text-gray-400"
                                }`}
                              >
                                {index + 1}
                              </span>
                              <span className="text-sm font-semibold text-white truncate max-w-[120px]">
                                {score.player?.username || "Anonymous"}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-pink-400">
                              {score.scoreStr}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface GameClientProps {
  games?: IProject[];
  featuredGames?: IProject[];
}

// ─────────────────────────────────────────────────────────────────────────────
// All-Time High Scores — permanent section on the games page (Vishal's request)
// Fetches active game IDs from GET /api/game/list and shows top-10 per game.
// ─────────────────────────────────────────────────────────────────────────────
function AllTimeLeaderboard() {
  const [gameIds, setGameIds] = useState<string[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingScores, setLoadingScores] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available game IDs on mount
  useEffect(() => {
    const fetchGameList = async () => {
      setLoadingGames(true);
      try {
        const res = await api("GET", "/game/list");
        if (res.action === true) {
          const ids = (res.data as string[]) || [];
          setGameIds(ids);
          if (ids.length > 0) setSelectedGameId(ids[0]);
        } else {
          setError("Failed to load game list.");
        }
      } catch {
        setError("Failed to load game list.");
      } finally {
        setLoadingGames(false);
      }
    };
    fetchGameList();
  }, []);

  // Fetch leaderboard whenever selected game changes
  useEffect(() => {
    if (!selectedGameId) return;
    const fetchScores = async () => {
      setLoadingScores(true);
      setScores([]);
      try {
        const res = await api("GET", "/game/score", {
          query: { target: "leaderboard", gameId: selectedGameId },
        });
        if (res.action === true) {
          setScores((res.data as any[]) || []);
        }
      } catch {
        // silently ignore
      } finally {
        setLoadingScores(false);
      }
    };
    fetchScores();
  }, [selectedGameId]);

  // Don't render if no games have any scores yet
  if (!loadingGames && gameIds.length === 0) return null;

  return (
    <div id="leaderboard" className="flex flex-col pt-16 px-0 relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mb-10"
      >
        <h2
          className={`text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-400 via-pink-300 to-white bg-clip-text text-transparent ${righteousFont.className} mb-2 flex items-center gap-3`}
        >
          <Trophy className="w-9 h-9 text-pink-400 fill-pink-400 shrink-0" />
          All-Time High Scores
        </h2>
        <p className={`text-gray-400 text-lg ${robotoFont.className} max-w-2xl`}>
          Top players across all CGS games — updated live
        </p>
      </motion.div>

      {loadingGames ? (
        <div className="flex items-center justify-center p-16">
          <div className="w-6 h-6 border-2 border-gray-600 border-t-pink-500 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="text-gray-500 text-sm">{error}</p>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden mb-16"
        >
          {/* Game Tab Switcher */}
          <div className="flex overflow-x-auto border-b border-gray-800 px-4 pt-4 gap-2 pb-0">
            {gameIds.map((id) => (
              <button
                key={id}
                onClick={() => setSelectedGameId(id)}
                className={`px-4 py-2 text-sm font-semibold rounded-t-xl whitespace-nowrap transition-all duration-200 border-b-2 ${
                  selectedGameId === id
                    ? "border-pink-500 text-pink-400 bg-pink-500/10"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {id}
              </button>
            ))}
          </div>

          {/* Scores */}
          <div className="p-6">
            {loadingScores ? (
              <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
                <div className="w-5 h-5 border-2 border-gray-600 border-t-pink-500 rounded-full animate-spin" />
                <span className={`text-sm ${robotoFont.className}`}>Loading scores…</span>
              </div>
            ) : scores.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                No scores submitted yet. Be the first to play!
              </div>
            ) : (
              <div className="space-y-3">
                {scores.map((score, index) => (
                  <motion.div
                    key={score._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                      index === 0
                        ? "bg-pink-500/10 border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.15)]"
                        : index === 1
                        ? "bg-purple-500/10 border-purple-500/20"
                        : index === 2
                        ? "bg-fuchsia-500/10 border-fuchsia-500/20"
                        : "bg-white/5 border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          index === 0
                            ? "bg-pink-500 text-white shadow-lg shadow-pink-500/40"
                            : index === 1
                            ? "bg-purple-500 text-white"
                            : index === 2
                            ? "bg-fuchsia-500 text-white"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                      </span>
                      <span className={`font-semibold text-white ${robotoFont.className}`}>
                        {score.player?.username || "Anonymous"}
                      </span>
                    </div>
                    <span className={`font-bold text-pink-400 text-lg ${righteousFont.className}`}>
                      {score.scoreStr ?? score.score}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function GameClient({
  games = [],
  featuredGames = [],
}: GameClientProps) {
  const miniGames = games.filter((game) => game.isMinigame === true);
  const regularGames = games.filter((game) => !game.isMinigame);
  const [selectedGame, setSelectedGame] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [playingEmbedUrl, setPlayingEmbedUrl] = useState<string | null>(null);
  // Tracks which game object is actually being played, so the in-page player
  // shows the correct title/info regardless of whether the game came from the
  // featured carousel or the full collection grid below.
  const [playingGame, setPlayingGame] = useState<IProject | null>(null);
  // Many hosts (itch.io included) send a `frame-ancestors` CSP header that
  // silently blocks embedding in an iframe on another domain. The browser
  // won't fire a JS error for this, so we detect it with a load timeout:
  // if `onLoad` hasn't fired within EMBED_TIMEOUT_MS, we assume the host
  // refused to be framed and fall back to an "open externally" prompt.
  const [embedLoading, setEmbedLoading] = useState(false);
  const [embedBlocked, setEmbedBlocked] = useState(false);
  const [embedSlow, setEmbedSlow] = useState(false);
  // Bumped to force a fresh iframe remount when the user hits "Retry" —
  // needed because a browser extension (e.g. MetaMask) injecting into the
  // itch.io frame can trip Unity's error handler and stall the load even
  // though the embed itself isn't actually blocked.
  const [embedRetryCount, setEmbedRetryCount] = useState(0);
  // React Portals need `document` to exist, which isn't available during
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handshake bridge: checks play and gameAuthCode parameters on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    const playId = searchParams.get("play");
    const code = searchParams.get("gameAuthCode");

    if (playId && code) {
      const targetGame = games.find((g) => g._id === playId);
      if (targetGame) {
        const liveDemoLinkObj = targetGame.links?.find((link) => link.text === "live-demo");
        if (liveDemoLinkObj && liveDemoLinkObj.url && liveDemoLinkObj.url.trim() !== "") {
          let originalUrl = liveDemoLinkObj.url;
          let finalUrl = originalUrl;
          try {
            const urlObj = new URL(originalUrl);
            urlObj.searchParams.set("gameAuthCode", code);
            finalUrl = urlObj.toString();
          } catch (e) {
            // Fallback for relative URLs
            if (originalUrl.includes("?")) {
              finalUrl = `${originalUrl}&gameAuthCode=${encodeURIComponent(code)}`;
            } else {
              finalUrl = `${originalUrl}?gameAuthCode=${encodeURIComponent(code)}`;
            }
          }

          setIsAutoPlaying(false);
          setPlayingEmbedUrl(finalUrl);
          setPlayingGame(targetGame);
          window.scrollTo({ top: 0, behavior: "smooth" });

          // Clean up search parameters from url
          searchParams.delete("play");
          searchParams.delete("gameAuthCode");
          const newSearch = searchParams.toString();
          const cleanUrl = `${window.location.pathname}${newSearch ? "?" + newSearch : ""}${window.location.hash}`;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      }
    }
  }, [games]);
  // Refs (not state) so the iframe's onLoad handler can directly cancel the
  // pending timers below. Without this, a successful load doesn't stop the
  // block-detection timer from still firing later and wrongly booting the
  // player out of an already-working, in-progress game.
  const embedSlowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const embedBlockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Define how many featured games exist once.
  const numFeatured = featuredGames.length;

  useEffect(() => {
    // Stop autoplay if user is playing a game or there are fewer than 2 games.
    if (!isAutoPlaying || playingEmbedUrl || numFeatured < 2) return;

    const interval = setInterval(() => {
      setSelectedGame((prev) => (prev + 1) % numFeatured);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, numFeatured, playingEmbedUrl]);

  // Reset the retry counter only when the *game* changes (not on every retry
  // click, which would otherwise immediately undo the increment below).
  useEffect(() => {
    setEmbedRetryCount(0);
  }, [playingEmbedUrl]);

  // Lock page scroll while the full-screen game overlay is open.
  useEffect(() => {
    if (playingEmbedUrl) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [playingEmbedUrl]);

  // Let users close the overlay with Escape as well as the button.
  useEffect(() => {
    if (!playingEmbedUrl) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseGame();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playingEmbedUrl]);

  useEffect(() => {
    if (!playingEmbedUrl) {
      setEmbedLoading(false);
      setEmbedBlocked(false);
      setEmbedSlow(false);
      return;
    }

    setEmbedLoading(true);
    setEmbedBlocked(false);
    setEmbedSlow(false);

    embedSlowTimeoutRef.current = setTimeout(() => {
      setEmbedSlow(true);
    }, EMBED_SLOW_HINT_MS);

    embedBlockTimeoutRef.current = setTimeout(() => {
      // If onLoad hasn't fired by now, the host almost certainly blocked
      // framing (frame-ancestors CSP) rather than the game being slow.
      setEmbedLoading(false);
      setEmbedBlocked(true);
    }, EMBED_TIMEOUT_MS);

    return () => {
      if (embedSlowTimeoutRef.current) clearTimeout(embedSlowTimeoutRef.current);
      if (embedBlockTimeoutRef.current) clearTimeout(embedBlockTimeoutRef.current);
    };
  }, [playingEmbedUrl, embedRetryCount]);

  // Handle setting safe index when clicking or autoplaying
  const updateSelectedGame = (index: number) => {
    setSelectedGame(index);
    setIsAutoPlaying(false);
    setPlayingEmbedUrl(null); // Close game if navigating
    setPlayingGame(null);
  };

  const nextGame = () => {
    const nextIndex = (selectedGame + 1) % numFeatured;
    updateSelectedGame(nextIndex);
  };

  const prevGame = () => {
    const prevIndex = (selectedGame - 1 + numFeatured) % numFeatured;
    updateSelectedGame(prevIndex);
  };

  const selectGame = (index: number) => {
    updateSelectedGame(index);
  };

  // ⭐️ SYSTEMIC FIX 1: Ensure helper strictly checks for non-empty string URLs.
  // This helper is now robust against the DB returning "".
  // NOTE: live-demo → iframe embed only. live-link → new tab only. No fallback between them
  // to avoid itch.io redirect games being incorrectly embedded in an iframe.
  const getSelectedGameLinkUrl = (linkText: string): string | null => {
    if (selectedGame >= 0 && selectedGame < numFeatured) {
      const linkFound = featuredGames[selectedGame].links?.find((link) => {
        return link.text === linkText;
      });
      // Explicitly check that url exists AND is not an empty string after trimming.
      if (linkFound && linkFound.url && linkFound.url.trim() !== "") {
        return linkFound.url;
      }
    }
    return null;
  };

  const handlePlayGame = (url: string, game?: IProject) => {
    // The conditional logic in the UI already ensures url is valid, 
    // but we check again here just to be absolutely sure.
    if (!url || url.trim() === "") return;

    if (game?.isMinigame) {
      window.location.href = `/game-auth?gameId=${game._id}&returnTo=${encodeURIComponent(`/games?play=${game._id}#mini-games`)}`;
      return;
    }

    setIsAutoPlaying(false);
    setPlayingEmbedUrl(url);
    // Remember which game this is so the player header/title is correct
    // whether it came from the featured carousel or the collection grid.
    setPlayingGame(game ?? null);
    // Smooth scroll to top so player sees the game
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseGame = () => {
    setPlayingEmbedUrl(null);
    setPlayingGame(null);
  };

  // Safe retrieval of the current game object
  const currentGame = featuredGames[selectedGame] || {
    _id: "",
    title: "No Game Selected",
    description: "No game available at the moment.",
    coverImgUrl: "",
    tags: [],
    links: [],
  };

  // Show a message if no games are available from the API
  if (!games.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-400">
          <h2 className="text-2xl font-bold mb-2">No Games Available</h2>
          <p>Please check back later for our game collection.</p>
        </div>
      </div>
    );
  }

  // Pre-calculate URLs to keep rendering clean
  // live-demo → iframe embed; live-link → open in new tab. Strictly separate.
  const liveDemoUrl = getSelectedGameLinkUrl("live-demo");
  const liveUrl = getSelectedGameLinkUrl("live-link");
  const githubUrl = getSelectedGameLinkUrl("github");

  // Helper for rendering image src safely with fallback
  // ⭐️ SYSTEMIC FIX 2: Creates a safe URL for <Image src>. Never returns "".
  const getSafeImageSrc = (url: string | undefined | null): string => {
    if (!url || url.trim() === "") {
      return DEFAULT_GAME_IMAGE;
    }
    // Utility might need adjustment if it doesn't handle "", but this check 
    // handles the missing case correctly.
    return prettySafeImage(url); 
  };

  return (
    <div className="relative z-10 pt-16 sm:pt-20 lg:pt-24 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 2xl:px-64 min-h-screen flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              className={`text-4xl lg:text-6xl font-bold bg-gradient-to-r from-pink-400 via-pink-300 to-white bg-clip-text text-transparent ${righteousFont.className} mb-2`}
            >
              Game Gallery
            </h1>
            <p className={`text-gray-400 text-lg ${robotoFont.className}`}>
              Featured Games by CGS
            </p>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        <div className="lg:col-span-3 relative group">
          <motion.div
            key={selectedGame}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative h-[400px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-pink-500/20 bg-black"
          >
            <AnimatePresence mode="wait">
              {/* STANDARD INFO VIEW (the hero card always shows this now —
                 the game player renders in its own full-screen overlay
                 below so it gets proper room and a locked aspect ratio
                 instead of being squeezed into this card). */}
              <motion.div key="info" exit={{ opacity: 0 }} className="relative w-full h-full">
                {/* FEATURED MAIN IMAGE */}
                <Image
                  // ⭐️ SAFE SOURCE USE
                  src={getSafeImageSrc(currentGame.coverImgUrl)}
                  alt={currentGame.title || "Game image"}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  // Optimization: preload featured image
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw"
                />

                <div className={`absolute inset-0 bg-gradient-to-t from-pink-600 via-rose-500 to-orange-400 opacity-20`}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  {/* Navigation Arrows - Only show when NOT playing and >1 game */}
                  {numFeatured > 1 && (
                    <>
                      <button
                        onClick={prevGame}
                        className="absolute left-4 top-1/2 transform -translate-y-[15vh] lg:-translate-y-1/2 z-20 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 border border-pink-500/30 hover:border-pink-500/60"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>

                      <button
                        onClick={nextGame}
                        className="absolute right-4 top-1/2 transform -translate-y-[15vh] lg:-translate-y-1/2 z-20 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 border border-pink-500/30 hover:border-pink-500/60"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                    <div className="space-y-4">
                      <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-2xl ${righteousFont.className} leading-tight`}
                      >
                        {currentGame.title}
                      </motion.h2>

                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className={`text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl ${robotoFont.className} line-clamp-3 sm:line-clamp-none`}
                      >
                        {currentGame.description}
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-wrap gap-2"
                      >
                        {currentGame.tags?.map((tech, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-800/60 backdrop-blur-sm rounded-full text-gray-300 text-sm border border-gray-600/40"
                          >
                            {tech}
                          </span>
                        ))}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex gap-4 mt-6 flex-wrap"
                      >
                        {/* FEATURED PLAY BUTTON - only shows when live-demo (iframe) URL exists */}
                        {liveDemoUrl ? (
                          <button
                            onClick={() => handlePlayGame(liveDemoUrl, currentGame)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-pink-500/25"
                          >
                            <Play className="w-5 h-5" />
                            Play Now
                          </button>
                        ) : null}

                        {/* LIVE LINK BUTTON - opens in new tab (for itch.io / external games) */}
                        {liveUrl ? (
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                          >
                            <ExternalLink className="w-5 h-5" />
                            Visit Game
                          </a>
                        ) : null}

                        {/* If neither demo nor live-link, show disabled state */}
                        {!liveDemoUrl && !liveUrl && (
                          <span className="flex items-center gap-2 px-6 py-3 bg-gray-700/50 text-gray-400 font-semibold rounded-xl cursor-not-allowed shadow-lg">
                            <Play className="w-5 h-5" />
                            Live Demo N/A
                          </span>
                        )}

                        {githubUrl ? (
                          <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-3 bg-gray-800/60 hover:bg-gray-700/60 backdrop-blur-sm text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 border border-gray-600/40 hover:border-gray-500/60"
                          >
                            <Github className="w-5 h-5" />
                            View Code
                          </a>
                        ) : (
                          <span className="flex items-center gap-2 px-6 py-3 bg-gray-800/30 text-gray-500 font-semibold rounded-xl cursor-not-allowed border border-gray-800">
                            <Github className="w-5 h-5" />
                            Code N/A
                          </span>
                        )}
                      </motion.div>
                    </div>
                  </div>

                  {/* Autoplay Progress Bar - Only show when NOT playing */}
                  {isAutoPlaying && (
                    <div className="absolute top-4 left-4 right-4 z-10">
                      <div className="w-full h-1 bg-gray-800/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-pink-500 to-pink-400"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 6, ease: "linear" }}
                          key={selectedGame}
                        />
                      </div>
                    </div>
                  )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Thumbnail Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex lg:flex-col gap-3 sm:gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 px-2 -mx-2 snap-x snap-mandatory sm:snap-none">
            {featuredGames.map((game, index) => (
              <motion.div
                key={game._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => selectGame(index)}
                className={`relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 lg:w-full lg:h-[120px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 snap-center ${
                  selectedGame === index
                    ? "border-pink-500 shadow-lg shadow-pink-500/25 scale-105"
                    : "border-gray-700/50 hover:border-pink-500/50 hover:scale-102"
                }`}
              >
                {/* SIDEBAR THUMBNAIL */}
                <Image
                  // ⭐️ SAFE SOURCE USE
                  src={getSafeImageSrc(game.coverImgUrl)}
                  alt={game.title}
                  fill
                  className="object-cover transition-all duration-300"
                  sizes="(max-width: 768px) 100px, 250px"
                />

                <div
                  className={`absolute inset-0 transition-all duration-300 ${
                    selectedGame === index
                      ? "bg-pink-500/20"
                      : "bg-black/40 hover:bg-black/20"
                  }`}
                ></div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2">
                  <div
                    className={`mb-1 transition-all duration-300 ${
                      selectedGame === index
                        ? "text-pink-300 scale-110"
                        : "text-white/80"
                    }`}
                  >
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-xs font-semibold text-center leading-tight ${
                      selectedGame === index
                        ? "text-pink-300"
                        : "text-white/80"
                    }`}
                  >
                    {game.title}
                  </span>
                </div>

                {selectedGame === index && (
                  <motion.div
                    layoutId="activeGameIndicator"
                    className="absolute -top-1 -left-1 -right-1 -bottom-1 border-2 border-pink-400 rounded-2xl"
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.6,
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      {numFeatured > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex justify-center gap-2 pb-8"
        >
          {featuredGames.map((_, index) => (
            <button
              key={`game-dot-${index}`}
              onClick={() => selectGame(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                selectedGame === index
                  ? "bg-pink-500 scale-125"
                  : "bg-gray-600 hover:bg-gray-500"
              }`}
            />
          ))}
        </motion.div>
      )}

      {/* MINI GAMES SECTION */}
      <div id="mini-games" className="flex flex-col pt-16 px-0 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2
            className={`text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-400 via-pink-300 to-white bg-clip-text text-transparent ${righteousFont.className} mb-4`}
          >
            Mini Games
          </h2>
          <p
            className={`text-gray-400 text-lg ${robotoFont.className} max-w-2xl`}
          >
            Quick-to-play interactive mini-games and experiments
          </p>
        </motion.div>

        {miniGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-16">
            {miniGames.map((game, index) => {
              // live-demo → iframe embed (via handlePlayGame auth flow)
              const liveDemoLinkObj = game.links?.find((link) => link.text === "live-demo");
              const isLiveDemoValid = liveDemoLinkObj && liveDemoLinkObj.url && liveDemoLinkObj.url.trim() !== "";
              // live-link → open in new tab
              const liveLinkObj = game.links?.find((link) => link.text === "live-link");
              const isLiveLinkValid = liveLinkObj && liveLinkObj.url && liveLinkObj.url.trim() !== "";
              const githubLinkObj = game.links?.find((link) => link.text === "github");
              const isGithubValid = githubLinkObj && githubLinkObj.url && githubLinkObj.url.trim() !== "";

              return (
                <motion.div
                  key={game._id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => {
                    if (isLiveDemoValid) {
                      handlePlayGame(liveDemoLinkObj.url, game);
                    }
                  }}
                  role={isLiveDemoValid ? "button" : undefined}
                  aria-label={isLiveDemoValid ? `Play ${game.title}` : undefined}
                  className={`group relative bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-700/30 hover:border-pink-500/40 shadow-xl hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 flex flex-col h-full ${
                    isLiveDemoValid ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div className="relative h-48 lg:h-56 overflow-hidden">
                    <Image
                      src={getSafeImageSrc(game.coverImgUrl)}
                      alt={game.title || "Game image"}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-600 via-rose-500 to-orange-400 opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                      <div className="flex gap-3">
                        {isLiveDemoValid && (
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayGame(liveDemoLinkObj.url, game);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-12 h-12 bg-pink-500/90 hover:bg-pink-500 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
                          >
                            <Play className="w-5 h-5 fill-white" />
                          </motion.button>
                        )}
                      </div>
                      {isLiveDemoValid && (
                        <span className="text-white text-xs font-semibold tracking-wide drop-shadow">
                          Click to Play
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className={`text-xl lg:text-2xl font-bold text-white mb-2 group-hover:text-pink-300 transition-colors duration-300 ${righteousFont.className} h-16`}>
                          {game.title}
                        </h3>
                        <p className={`text-gray-400 text-sm leading-relaxed ${robotoFont.className} line-clamp-4 h-24`}>
                          {game.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {game.tags?.slice(0, 2).map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-2 py-1 bg-gray-800/60 text-gray-300 text-xs rounded-full border border-gray-600/40 hover:border-pink-500/40 hover:text-pink-300 transition-all duration-300"
                          >
                            {tech}
                          </span>
                        ))}
                        {(game.tags?.length ?? 0) > 2 && (
                          <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full border border-pink-500/40">
                            +{(game.tags?.length ?? 0) - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Image
                            src={game.author?.profileImgUrl && game.author.profileImgUrl.trim() !== ""
                                  ? prettySafeImage(game.author.profileImgUrl)
                                  : DEFAULT_GAME_IMAGE}
                            alt="Author Profile"
                            className="w-6 h-6 rounded-full object-cover border border-pink-500/20"
                            width={24}
                            height={24}
                          />
                          <span>{game.author?.name || "Anonymous"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Live link → open in new tab */}
                        {isLiveLinkValid && (
                          <motion.a
                            href={liveLinkObj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-8 h-8 bg-gray-800/60 hover:bg-purple-500/20 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-300 transition-all duration-300"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </motion.a>
                        )}
                        {isGithubValid && (
                          <motion.a
                            href={githubLinkObj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-8 h-8 bg-gray-800/60 hover:bg-pink-500/20 rounded-lg flex items-center justify-center text-gray-400 hover:text-pink-300 transition-all duration-300"
                          >
                            <Github className="w-4 h-4" />
                          </motion.a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-pink-500/5 blur-xl"></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-gray-900/40 border border-gray-800 rounded-3xl text-center mb-16">
            <Gamepad2 className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-gray-400 text-sm">No mini games available right now. Check back soon!</p>
          </div>
        )}
      </div>

      {/* ALL-TIME HIGH SCORES SECTION */}
      <AllTimeLeaderboard />

      {/* COMPLETE COLLECTION SECTION */}
      <div className="min-h-screen flex flex-col pt-24 px-0 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2
                className={`text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-400 via-pink-300 to-white bg-clip-text text-transparent ${righteousFont.className} mb-4`}
              >
                Complete Collection
              </h2>
              <p
                className={`text-gray-400 text-lg ${robotoFont.className} max-w-2xl`}
              >
                Explore the complete set of games designed and developed by
                members of CGS
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-16 sm:mb-20">
          {regularGames.map((game, index) => {
            // live-demo → iframe embed via handlePlayGame
            const liveDemoLinkObj = game.links?.find((link) => link.text === "live-demo");
            const isLiveDemoValid = liveDemoLinkObj && liveDemoLinkObj.url && liveDemoLinkObj.url.trim() !== "";
            // live-link → open in new tab (itch.io redirects, etc.)
            const liveLinkObj = game.links?.find((link) => link.text === "live-link");
            const isLiveLinkValid = liveLinkObj && liveLinkObj.url && liveLinkObj.url.trim() !== "";

            const githubLinkObj = game.links?.find((link) => link.text === "github");
            const isGithubValid = githubLinkObj && githubLinkObj.url && githubLinkObj.url.trim() !== "";

            return (
              <motion.div
                key={game._id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                onClick={() => {
                  // live-demo → open in iframe player on site
                  if (isLiveDemoValid) {
                    handlePlayGame(liveDemoLinkObj.url, game);
                  // live-link → open in new tab
                  } else if (isLiveLinkValid) {
                    window.open(liveLinkObj.url, "_blank", "noopener,noreferrer");
                  }
                }}
                role={isLiveDemoValid || isLiveLinkValid ? "button" : undefined}
                aria-label={isLiveDemoValid ? `Play ${game.title}` : isLiveLinkValid ? `Open ${game.title}` : undefined}
                className={`group relative bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-700/30 hover:border-pink-500/40 shadow-xl hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 flex flex-col h-full ${
                  isLiveDemoValid || isLiveLinkValid ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <div className="relative h-48 lg:h-56 overflow-hidden">
                  {/* COLLECTION CARD IMAGE */}
                  <Image
                    // ⭐️ SAFE SOURCE USE
                    src={getSafeImageSrc(game.coverImgUrl)}
                    alt={game.title || "Game image"}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw, 25vw"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-pink-600 via-rose-500 to-orange-400 opacity-20 group-hover:opacity-30 transition-opacity duration-500`}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Hover Play / Visit Button overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <div className="flex gap-3">
                      {isLiveDemoValid && (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayGame(liveDemoLinkObj.url, game);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-12 h-12 bg-pink-500/90 hover:bg-pink-500 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
                          title="Play in-browser"
                        >
                          <Play className="w-5 h-5 fill-white" />
                        </motion.button>
                      )}
                      {isLiveLinkValid && (
                        <motion.a
                          href={liveLinkObj.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-12 h-12 bg-purple-500/90 hover:bg-purple-500 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </motion.a>
                      )}
                    </div>
                    {(isLiveDemoValid || isLiveLinkValid) && (
                      <span
                        className={`text-white text-xs font-semibold tracking-wide drop-shadow ${robotoFont.className}`}
                      >
                        {isLiveDemoValid ? "Click to Play" : "Click to Visit"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3
                        className={`text-xl lg:text-2xl font-bold text-white mb-2 group-hover:text-pink-300 transition-colors duration-300 ${righteousFont.className} h-16`}
                      >
                        {game.title}
                      </h3>
                      <p
                        className={`text-gray-400 text-sm leading-relaxed ${robotoFont.className} line-clamp-4 h-24`}
                      >
                        {game.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {game.tags?.slice(0, 2).map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-2 py-1 bg-gray-800/60 text-gray-300 text-xs rounded-full border border-gray-600/40 hover:border-pink-500/40 hover:text-pink-300 transition-all duration-300"
                        >
                          {tech}
                        </span>
                      ))}
                      {(game.tags?.length ?? 0) > 2 && (
                        <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full border border-pink-500/40">
                          +{(game.tags?.length ?? 0) - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Image
                          // ⭐️ AUTHOR IMAGE: Need same robustness for user profiles
                          src={game.author?.profileImgUrl && game.author.profileImgUrl.trim() !== ""
                                ? prettySafeImage(game.author.profileImgUrl)
                                : DEFAULT_GAME_IMAGE} // Use general placeholder if user img is missing
                          alt="Author Profile"
                          className="w-6 h-6 rounded-full object-cover border border-pink-500/20"
                          width={24}
                          height={24}
                        />
                        <span>{game.author?.name || "Anonymous"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Live link → permanent footer icon, opens new tab */}
                      {isLiveLinkValid && (
                        <motion.a
                          href={liveLinkObj.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 bg-gray-800/60 hover:bg-purple-500/20 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-300 transition-all duration-300"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </motion.a>
                      )}
                      {isGithubValid && (
                        <motion.a
                          href={githubLinkObj.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 bg-gray-800/60 hover:bg-pink-500/20 rounded-lg flex items-center justify-center text-gray-400 hover:text-pink-300 transition-all duration-300"
                        >
                          <Github className="w-4 h-4" />
                        </motion.a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-pink-500/5 blur-xl"></div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* FULL-SCREEN GAME PLAYER OVERLAY
          Portaled directly into document.body (not rendered here in the
          normal tree) so it's never trapped inside a transformed ancestor
          and always covers the true viewport, above the navbar. */}
      {isMounted &&
        createPortal(
          <GamePlayerOverlay
            playingEmbedUrl={playingEmbedUrl}
            gameId={playingGame?._id ?? ""}
            title={playingGame?.title ?? currentGame.title}
            embedBlocked={embedBlocked}
            embedLoading={embedLoading}
            embedSlow={embedSlow}
            embedRetryCount={embedRetryCount}
            onRetry={() => setEmbedRetryCount((c) => c + 1)}
            onClose={handleCloseGame}
            onIframeLoad={() => {
              // Cancel any pending timers now that the game has genuinely
              // loaded — otherwise the block-detection timer set earlier
              // would still fire later and incorrectly boot the player
              // mid-game.
              if (embedSlowTimeoutRef.current) clearTimeout(embedSlowTimeoutRef.current);
              if (embedBlockTimeoutRef.current) clearTimeout(embedBlockTimeoutRef.current);
              setEmbedLoading(false);
              setEmbedBlocked(false);
              setEmbedSlow(false);
            }}
          />,
          document.body
        )}
    </div>
  );
}