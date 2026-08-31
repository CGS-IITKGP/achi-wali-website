import { Types } from "mongoose";
import createHandler from "@/lib/handler";
import gameValidator from "@/lib/validators/game.validator";
import gameAuthCodeRepository from "@/lib/database/repos/gameAuthCode.repo";
import gameUserRepository from "@/lib/database/repos/gameUser.repo";
import { NextResponse } from "next/server";
import {
    ESECs,
    ServiceSignature,
    SDIn,
    SDOut,
} from "@/lib/types/index.types";

// OPTIONS preflight handler.
export function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST",
            "Access-Control-Allow-Headers": "Content-Type, Accept, X-Requested-With",
            "Access-Control-Max-Age": "86400",
        },
    });
}

type GenerateCodeInput = {
    gameId: string;
};

type GenerateCodeOutput = {
    code: string;
};

const generateCode: ServiceSignature<
    GenerateCodeInput,
    GenerateCodeOutput,
    true
> = async (data, session) => {
    // Find the GameUser linked to this website user
    const gameUser = await gameUserRepository.findOne({
        websiteUserId: new Types.ObjectId(session.userId),
    });

    if (!gameUser) {
        return {
            success: false,
            errorCode: ESECs.INVALID_GAME_TOKEN,
            errorMessage: "No game profile found. Please set up a game username first.",
        };
    }

    // Generate a fresh, short-lived auth code
    const authCode = await gameAuthCodeRepository.createCode(
        gameUser._id,
        data.gameId
    );

    return {
        success: true,
        data: {
            code: authCode.code,
        },
    };
};

import { z } from "zod";
import { allIbDField } from "@/lib/validators/core.validator";

const generateCodeValidator = z.object({
    gameId: allIbDField.shortString,
});

const POST = createHandler({
    requireAuth: true,
    validationSchema: generateCodeValidator,
    options: {
        service: generateCode,
    },
});

export { POST };
