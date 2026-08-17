import { Types } from "mongoose";
import GenericRepository from "./generic.repo";
import ScoreModel from "@/lib/database/models/score.model";
import {
    IScore,
    IScoreExportable,
    ScoreCreateType,
    ScoreUpdateType,
} from "@/lib/types/index.types";
import AppError from "@/lib/utils/error";

class ScoreRepository extends GenericRepository<
    IScore,
    ScoreCreateType,
    ScoreUpdateType
> {
    constructor() {
        super(ScoreModel);
    }

    async getTopScores(
        gameId: string,
        limit: number = 10
    ): Promise<IScoreExportable[]> {
        await this.ensureDbConnection();

        try {
            return await ScoreModel.find({ gameId })
                .sort({ score: -1 })
                .limit(limit)
                .populate({ path: "player", select: "username" })
                .lean<IScoreExportable[]>();
        } catch (error) {
            throw new AppError("Failed to fetch leaderboard", { error });
        }
    }

    async getMyScore(
        playerId: Types.ObjectId,
        gameId: string
    ): Promise<IScoreExportable | null> {
        await this.ensureDbConnection();

        try {
            return await ScoreModel.findOne({ player: playerId, gameId })
                .populate({ path: "player", select: "username" })
                .lean<IScoreExportable>();
        } catch (error) {
            throw new AppError("Failed to fetch player score", { error });
        }
    }

    async getDistinctGameIds(): Promise<string[]> {
        await this.ensureDbConnection();

        try {
            return await ScoreModel.distinct("gameId");
        } catch (error) {
            throw new AppError("Failed to fetch distinct game IDs", { error });
        }
    }
}

const scoreRepository = new ScoreRepository();

export default scoreRepository;
