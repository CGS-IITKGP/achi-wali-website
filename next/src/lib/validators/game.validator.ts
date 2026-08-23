import { z } from "zod";
import { allIbDField } from "./core.validator";
import { APIControl } from "../types/api.types";

const gameValidator = {
    createScore: z.object({
        gameId: allIbDField.shortString,
        score: z.number().int(),
        scoreStr: allIbDField.shortString,
        seed: allIbDField.shortString,
        timestamp: z.number().int().positive(),
        gameToken: allIbDField.longString,
        signature: allIbDField.shortString,
    }),
    getScore: z.object({
        target: z.nativeEnum(APIControl.GameScore.Get.Target),
        gameId: allIbDField.shortString,
        gameToken: allIbDField.longString.optional(),
    }).refine((data) => {
        if (data.target === APIControl.GameScore.Get.Target.MY_SCORES && !data.gameToken) {
            return false;
        }
        return true;
    }, {
        message: "gameToken is required when target is MY_SCORES",
        path: ['gameToken']
    }),
    upsertProfile: z.object({
        username: allIbDField.shortString,
    }),
    getProfile: z.object({}),
    getGameList: z.object({}),
    exchangeCode: z.object({
        gameAuthCode: allIbDField.shortString,
    }),
};

export default gameValidator;
