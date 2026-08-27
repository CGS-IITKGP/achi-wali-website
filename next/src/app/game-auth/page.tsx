"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "../axiosApi";
import { useAuth } from "../context/authContext";

/**
 * /game-auth page — handles the full redirect-based game login flow:
 *
 * 1. Reads gameId and returnTo from query params (or from cookie fallback).
 * 2. Checks login status via GET /api/auth/me.
 * 3. If not logged in → sets game_auth_pending cookie → redirects to Google OAuth.
 * 4. If logged in → checks game profile via GET /api/game/profile.
 * 5. If no username → shows username form → calls POST /api/game/profile.
 * 6. Once linked → generates code → redirects to returnTo?gameAuthCode=<code>.
 */

type FlowStep =
    | "loading"
    | "checking_login"
    | "redirecting_to_login"
    | "checking_profile"
    | "username_form"
    | "generating_code"
    | "redirecting_to_game"
    | "error";

function GameAuthFlow() {
    const searchParams = useSearchParams();

    const [step, setStep] = useState<FlowStep>("loading");
    const [gameId, setGameId] = useState<string>("");
    const [returnTo, setReturnTo] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const { user, isLoading } = useAuth();
    const router = useRouter();


    // Helper: set a short-lived cookie storing gameId/returnTo
    const setGameAuthCookie = useCallback((gId: string, rTo: string) => {
        const payload = JSON.stringify({ gameId: gId, returnTo: rTo });
        document.cookie = `game_auth_pending=${encodeURIComponent(payload)}; path=/; max-age=300; SameSite=Lax`;
    }, []);

    // Helper: read and clear the game auth cookie
    const readAndClearGameAuthCookie = useCallback((): { gameId: string; returnTo: string } | null => {
        const match = document.cookie.match(/(?:^|;\s*)game_auth_pending=([^;]*)/);
        if (!match) return null;

        // Clear the cookie
        document.cookie = "game_auth_pending=; path=/; max-age=0; SameSite=Lax";

        try {
            return JSON.parse(decodeURIComponent(match[1]));
        } catch {
            return null;
        }
    }, []);

    // Step 1: Read params and determine state
    useEffect(() => {
        let gId = searchParams.get("gameId") || "";
        let rTo = searchParams.get("returnTo") || "";

        // Fallback: check cookie (set before Google OAuth redirect)
        if (!gId || !rTo) {
            const cookieData = readAndClearGameAuthCookie();
            if (cookieData) {
                gId = cookieData.gameId || gId;
                rTo = cookieData.returnTo || rTo;
            }
        }

        if (!gId || !rTo) {
            setErrorMessage("Missing gameId or returnTo parameters. Please start the login from the game.");
            setStep("error");
            return;
        }

        setGameId(gId);
        setReturnTo(rTo);
        setStep("checking_login");
    }, [searchParams, readAndClearGameAuthCookie]);

    // Step 2: Check login status
    useEffect(() => {
        if (step !== "checking_login") return;

        const checkLogin = async () => {
            const meResponse = await api("GET", "auth/me");

            if (meResponse.action === true) {
                // Logged in — proceed to profile check
                setStep("checking_profile");
            } else {
                // Not logged in — save state in cookie and redirect to standard login
                setGameAuthCookie(gameId, returnTo);
                setStep("redirecting_to_login");
                const currentUrl = window.location.pathname + window.location.search;
                window.location.href = `/auth/sign-in?redirect=${encodeURIComponent(currentUrl)}`;
            }
        };

        checkLogin();
    }, [step, gameId, returnTo, setGameAuthCookie]);

    // Step 3: Check game profile
    useEffect(() => {
        if (step !== "checking_profile") return;

        const checkProfile = async () => {
            const profileResponse = await api("GET", "/game/profile");

            if (profileResponse.action === true) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data = profileResponse.data as any;

                if (data.linked) {
                    // Already linked — generate code
                    setStep("generating_code");
                } else {
                    // Not linked — show username form
                    setStep("username_form");
                }
            } else {
                setErrorMessage("Failed to check game profile status. Please try again.");
                setStep("error");
            }
        };

        checkProfile();
    }, [step]);

    // Step 4: Generate code and redirect
    useEffect(() => {
        if (step !== "generating_code") return;

        const generateAndRedirect = async () => {
            const codeResponse = await api("POST", "/game/session/generate-code", {
                body: { gameId },
            });

            if (codeResponse.action === true) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const code = (codeResponse.data as any).code;
                setStep("redirecting_to_game");

                // Build the redirect URL
                try {
                  // 1. Ensure returnTo is a valid string, fallback to /games if not
                  let safeReturnTo = (returnTo && typeof returnTo === "string") ? returnTo : "/games";
                  
                  // 2. Strip out any hash (like #mini-games) that breaks query parameters
                  safeReturnTo = safeReturnTo.split("#")[0];
                  
                  // 3. Figure out if we need a '?' or '&'
                  const separator = safeReturnTo.includes("?") ? "&" : "?";
                  
                  // 4. Build the final URL
                  const finalRedirectUrl = `${safeReturnTo}${separator}gameAuthCode=${code}`;
                  
                  // 5. Hard redirect (bypasses Next.js router bugs)
                  window.location.replace(finalRedirectUrl);
                } catch (error) {
                  // Absolute worst-case fallback
                  window.location.replace(`/games?gameAuthCode=${code}`);
                }
            } else {
                setErrorMessage(
                    (codeResponse.action === false ? codeResponse.message : null) ||
                    "Failed to generate game auth code. Please try again."
                );
                setStep("error");
            }
        };

        generateAndRedirect();
    }, [step, gameId, returnTo]);

    // Handle username form submission
    const handleUsernameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUsernameError(null);

        if (!username.trim()) {
            setUsernameError("Username is required.");
            return;
        }

        setIsSubmitting(true);

        const profileResponse = await api("POST", "/game/profile", {
            body: { username: username.trim() },
        });

        if (profileResponse.action === true) {
            // Profile created — generate code
            setStep("generating_code");
        } else if (profileResponse.action === false) {
            // Handle 409 conflict (username taken)
            if (
                profileResponse.message === "That username is already taken." ||
                profileResponse.message?.toLowerCase().includes("taken")
            ) {
                setUsernameError(profileResponse.message);
            } else if (profileResponse.errors && Array.isArray(profileResponse.errors)) {
                const userErr = profileResponse.errors.find((err: string) =>
                    err.startsWith("username$")
                );
                if (userErr) {
                    setUsernameError(userErr.split("$")[1].trim());
                } else {
                    setUsernameError(profileResponse.message || "Invalid username.");
                }
            } else {
                setUsernameError(profileResponse.message || "Failed to create profile.");
            }
        } else {
            setUsernameError("Something went wrong. Please try again.");
        }

        setIsSubmitting(false);
    };

    // Render based on current step
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Loading / Checking states */}
                {(step === "loading" || step === "checking_login" || step === "checking_profile") && (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-gray-400 text-lg">
                            {step === "loading" && "Initializing..."}
                            {step === "checking_login" && "Checking login status..."}
                            {step === "checking_profile" && "Checking game profile..."}
                        </p>
                    </div>
                )}

                {/* Redirecting to login */}
                {step === "redirecting_to_login" && (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-gray-400 text-lg">
                            Redirecting to Google Sign-In...
                        </p>
                    </div>
                )}

                {/* Username form */}
                {step === "username_form" && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent mb-3">
                                Choose Your Username
                            </h1>
                            <p className="text-gray-400">
                                Pick a unique in-game username to get started.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-gray-900/50 border border-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.15)] backdrop-blur-xl">
                            <form onSubmit={handleUsernameSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        id="game-auth-username"
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            if (usernameError) setUsernameError(null);
                                        }}
                                        className={`w-full bg-black/50 border rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 transition-all ${
                                            usernameError
                                                ? "border-red-500/50 focus:ring-red-500/50"
                                                : "border-gray-700 focus:border-pink-500/50 focus:ring-pink-500/20"
                                        }`}
                                        placeholder="Enter a unique username"
                                        maxLength={255}
                                        autoFocus
                                        required
                                    />
                                    {usernameError && (
                                        <p className="mt-2 text-sm text-red-400 font-medium">
                                            {usernameError}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    id="game-auth-submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-lg shadow-pink-500/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex justify-center items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Continue to Game"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Generating code */}
                {step === "generating_code" && (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-gray-400 text-lg">
                            Generating game session...
                        </p>
                    </div>
                )}

                {/* Redirecting to game */}
                {step === "redirecting_to_game" && (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-gray-400 text-lg">
                            Redirecting back to the game...
                        </p>
                    </div>
                )}

                {/* Error state */}
                {step === "error" && (
                    <div className="text-center space-y-6">
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold text-red-400">
                            Something went wrong
                        </h2>
                        <p className="text-gray-400">{errorMessage}</p>
                        <button
                            onClick={() => {
                                setStep("checking_login");
                                setErrorMessage("");
                            }}
                            className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-lg shadow-pink-500/25 transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Wrap in Suspense boundary as required by Next.js for useSearchParams
export default function GameAuthPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-black text-white flex items-center justify-center">
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-gray-400 text-lg">Loading...</p>
                    </div>
                </div>
            }
        >
            <GameAuthFlow />
        </Suspense>
    );
}
