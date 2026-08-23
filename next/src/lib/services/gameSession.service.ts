import gameAuthCodeRepository from "@/lib/database/repos/gameAuthCode.repo";
import gameUserRepository from "@/lib/database/repos/gameUser.repo";
import { generateJWToken } from "@/lib/services/core/jwt.core.service";
import { getGameSecretKey } from "@/lib/utils/secret";
import {
    ESECs,
    ServiceSignature,
    SDIn,
    SDOut,
} from "@/lib/types/index.types";

const exchange: ServiceSignature<
    SDIn.GameSession.Exchange,
    SDOut.GameSession.Exchange,
    false
> = async (data) => {
    // Step A: Atomically find and consume the code (single-use, not expired)
    const consumedCode = await gameAuthCodeRepository.findValidAndConsume(
        data.gameAuthCode
    );

    if (!consumedCode) {
        return {
            success: false,
            errorCode: ESECs.INVALID_GAME_TOKEN,
            errorMessage: "Invalid, expired, or already-used game auth code.",
        };
    }

    // Step B: Look up the linked GameUser
    const player = await gameUserRepository.findById(consumedCode.gameUserId);

    if (!player) {
        return {
            success: false,
            errorCode: ESECs.INVALID_GAME_TOKEN,
            errorMessage: "Game user not found for this auth code.",
        };
    }

    // Step C: Generate a gameToken (same shape as the old login used to produce)
    // Payload: { _id, username } — signed with the game secret key
    const gameToken = await generateJWToken(
        {
            _id: player._id.toHexString(),
            username: player.username,
        },
        getGameSecretKey()
    );

    // Step D: Return the same shape the old login endpoint used to return
    return {
        success: true,
        data: {
            userId: player._id.toHexString(),
            username: player.username,
            gameToken,
        },
    };
};

const gameSessionServices = {
    exchange,
};

export default gameSessionServices;
