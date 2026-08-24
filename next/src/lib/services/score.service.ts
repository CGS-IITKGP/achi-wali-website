import crypto from "crypto";
import { unstable_cache } from "next/cache";
import { Types } from "mongoose";
import scoreRepository from "@/lib/database/repos/score.repo";
import { validateJWToken } from "@/lib/services/core/jwt.core.service";
import { getGameSecretKey } from "@/lib/utils/secret";
import {
    ESECs,
    ServiceSignature,
    SDIn,
    SDOut,
    APIControl,
} from "@/lib/types/index.types";
import gameUserRepository from "@/lib/database/repos/gameUser.repo";

const create: ServiceSignature<
    SDIn.GameScore.Create,
    SDOut.GameScore.Create,
    false
> = async (data) => {
    // Step A: Verify and decode gameToken
    const decodedPlayer = await validateJWToken(data.gameToken, getGameSecretKey());
    if (!decodedPlayer || !decodedPlayer._id) {
        return {
            success: false,
            errorCode: ESECs.INVALID_GAME_TOKEN,
            errorMessage: "Invalid or expired game session.",
        };
    }

    // Step B: Reconstruct signature
    const gameSecret = process.env.GAME_SECRET ?? "";
    const calculatedSignature = crypto
        .createHash("sha256")
        .update(
            `${decodedPlayer._id}:${data.score}:${data.timestamp}:${gameSecret}`
        )
        .digest("hex");

    // Step C: Compare signatures
    if (calculatedSignature !== data.signature) {
        return {
            success: false,
            errorCode: ESECs.INVALID_SCORE_SIGNATURE,
            errorMessage: "Anti-cheat signature validation failed.",
        };
    }

    // Rate limit check using GameUser DB record
    const playerId = new Types.ObjectId(decodedPlayer._id);
    const gameUser = await gameUserRepository.findById(playerId);

    if (gameUser) {
        const submitBlockedTill = gameUser.lastAttemptAt ? gameUser.lastAttemptAt.getTime() + 3 * 1000 : 0;
        if (Date.now() < submitBlockedTill) {
            return {
                success: false,
                errorCode: ESECs.TOO_MANY_REQUESTS,
                errorMessage: "Please wait a moment before trying again.",
            };
        }
        await gameUserRepository.updateById(playerId, { lastAttemptAt: new Date() });
    }

    // Step D: Always insert — append-only history
    await scoreRepository.insert({
        player: playerId,
        gameId: data.gameId,
        score: data.score,
        scoreStr: data.scoreStr,
        seed: data.seed,
    });

    return {
        success: true,
        data: {},
    };
};

const get: ServiceSignature<
    SDIn.GameScore.Get,
    SDOut.GameScore.Get,
    false
> = async (data) => {
    if (data.target === APIControl.GameScore.Get.Target.MY_SCORES) {
        if (!data.gameToken) {
            return {
                success: false,
                errorCode: ESECs.INVALID_GAME_TOKEN,
                errorMessage: "gameToken is required to fetch my scores.",
            };
        }

        const decodedPlayer = await validateJWToken(data.gameToken, getGameSecretKey());
        if (!decodedPlayer || !decodedPlayer._id) {
            return {
                success: false,
                errorCode: ESECs.INVALID_GAME_TOKEN,
                errorMessage: "Invalid or expired game session.",
            };
        }

        const playerId = new Types.ObjectId(decodedPlayer._id);
        const myScore = await scoreRepository.getMyScore(playerId, data.gameId);

        const formattedScores = myScore
            ? [{
                _id: myScore._id.toHexString(),
                player: {
                    _id: myScore.player._id.toHexString(),
                    username: myScore.player.username,
                },
                gameId: myScore.gameId,
                score: myScore.score,
                scoreStr: myScore.scoreStr,
                seed: myScore.seed,
                createdAt: myScore.createdAt,
                updatedAt: myScore.updatedAt,
            }]
            : [];

        return {
            success: true,
            data: formattedScores,
        };
    }

    // target === LEADERBOARD
    // Query freshly from repository for real-time live polling
    const rawScores = await scoreRepository.getTopScores(data.gameId);
    const formattedScores = rawScores.map((score: any) => ({
        _id: typeof score._id === "string" ? score._id : score._id?.toHexString?.() || String(score._id),
        player: {
            _id: typeof score.player?._id === "string" ? score.player._id : score.player?._id?.toHexString?.() || String(score.player?._id || ""),
            username: score.player?.username || "Anonymous",
        },
        gameId: score.gameId,
        score: score.score,
        scoreStr: score.scoreStr,
        seed: score.seed,
        createdAt: score.createdAt,
        updatedAt: score.updatedAt,
    }));

    return {
        success: true,
        data: formattedScores,
    };
};

const scoreServices = {
    create,
    get,
};

export default scoreServices;
