import gameUserRepository from "@/lib/database/repos/gameUser.repo";
import { generateJWToken } from "@/lib/services/core/jwt.core.service";
import { verifyStringAndHash } from "@/lib/services/core/hash.core.service";
import { getGameSecretKey } from "@/lib/utils/secret";
import {
    ESECs,
    ServiceSignature,
    SDIn,
    SDOut,
} from "@/lib/types/index.types";

const login: ServiceSignature<
    SDIn.GameAuth.Login,
    SDOut.GameAuth.Login,
    false
> = async (data) => {
    const identifierLower = data.identifier.toLowerCase();

    const player = await gameUserRepository.findOne({
        $or: [{ username: identifierLower }, { email: identifierLower }],
    });

    if (!player || !player.passwordHash) {
        return {
            success: false,
            errorCode: ESECs.INVALID_CREDENTIALS,
            errorMessage: "Invalid credentials.",
        };
    }

    const isValid = await verifyStringAndHash(data.password, player.passwordHash);
    if (!isValid) {
        return {
            success: false,
            errorCode: ESECs.INVALID_CREDENTIALS,
            errorMessage: "Invalid credentials.",
        };
    }

    const gameToken = await generateJWToken(
        {
            _id: player._id.toHexString(),
            username: player.username,
        },
        getGameSecretKey()
    );

    return {
        success: true,
        data: {
            userId: player._id.toHexString(),
            username: player.username,
            gameToken,
        },
    };
};

const gameAuthServices = {
    login,
};

export default gameAuthServices;
