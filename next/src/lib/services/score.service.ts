import crypto from "crypto";
import { Types } from "mongoose";
import scoreRepository from "@/lib/database/repos/score.repo";
import { validateJWToken } from "@/lib/services/core/jwt.core.service";
import { getGameSecretKey } from "@/lib/utils/secret";
import {
    ESECs,
    ServiceSignature,
    SDIn,
    SDOut,
} from "@/lib/types/index.types";

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

    // Step D: High-score check & Database operation
    const playerId = new Types.ObjectId(decodedPlayer._id);
    const existingRecord = await scoreRepository.findOne({
        player: playerId,
        gameId: data.gameId,
    });

    if (existingRecord) {
        if (data.score > existingRecord.score) {
            await scoreRepository.updateById(existingRecord._id, {
                score: data.score,
            });
        }
    } else {
        await scoreRepository.insert({
            player: playerId,
            gameId: data.gameId,
            score: data.score,
        });
    }

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
    const scores = await scoreRepository.getTopScores(data.gameId);

    const formattedScores = scores.map((score) => ({
        _id: score._id.toHexString(),
        player: {
            _id: score.player._id.toHexString(),
            username: score.player.username,
        },
        gameId: score.gameId,
        score: score.score,
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
