import crypto from "crypto";
import { Types } from "mongoose";
import GenericRepository from "./generic.repo";
import GameAuthCodeModel from "@/lib/database/models/gameAuthCode.model";
import {
    IGameAuthCode,
    GameAuthCodeCreateType,
    GameAuthCodeUpdateType,
} from "@/lib/types/index.types";

class GameAuthCodeRepository extends GenericRepository<
    IGameAuthCode,
    GameAuthCodeCreateType,
    GameAuthCodeUpdateType
> {
    constructor() {
        super(GameAuthCodeModel);
    }

    /***
     * Generate a short-lived, single-use auth code for a game session.
     * Code is 32 random bytes, base64url-encoded (high entropy).
     * Expires in 60 seconds.
     */
    async createCode(
        gameUserId: Types.ObjectId,
        gameId: string
    ): Promise<IGameAuthCode> {
        await this.ensureDbConnection();

        const code = crypto.randomBytes(32).toString("base64url");
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

        return await this.insert({
            code,
            gameUserId,
            gameId,
            expiresAt,
        });
    }

    /**
     * Atomically find a valid (unused, non-expired) code and mark it as used.
     * This MUST be a single atomic operation to prevent race conditions where
     * the same code could be exchanged twice concurrently.
     */
    async findValidAndConsume(code: string): Promise<IGameAuthCode | null> {
        await this.ensureDbConnection();

        const result = await this.model.findOneAndUpdate(
            {
                code,
                used: false,
                expiresAt: { $gt: new Date() },
            },
            { $set: { used: true } },
            { new: true }
        );

        return result ? (result.toObject() as IGameAuthCode) : null;
    }
}

const gameAuthCodeRepository = new GameAuthCodeRepository();

export default gameAuthCodeRepository;
