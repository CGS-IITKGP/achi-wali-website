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

    /**
     * Leaderboard query — computes "best score per player" at read time.
     * Uses an aggregation pipeline:
     * 1. Match documents for the given gameId.
     * 2. Sort by score descending (so $first in $group picks the best row).
     * 3. Group by player, taking the max score and carrying through all fields
     *    from the document that had the max score.
     * 4. Sort grouped results by maxScore descending.
     * 5. Limit to N.
     * 6. $lookup to join the player's username from the gameusers collection.
     */
    async getTopScores(
        gameId: string,
        limit: number = 10
    ): Promise<IScoreExportable[]> {
        await this.ensureDbConnection();

        try {
            const results = await ScoreModel.aggregate([
                // 1. Match by gameId
                { $match: { gameId } },

                // 2. Sort by score descending — ensures $first picks the best row
                { $sort: { score: -1 as const } },

                // 3. Group by player, take the best-scoring document's fields
                {
                    $group: {
                        _id: "$player",
                        docId: { $first: "$_id" },
                        gameId: { $first: "$gameId" },
                        score: { $max: "$score" },
                        scoreStr: { $first: "$scoreStr" },
                        seed: { $first: "$seed" },
                        createdAt: { $first: "$createdAt" },
                        updatedAt: { $first: "$updatedAt" },
                    },
                },

                // 4. Sort grouped results by max score descending
                { $sort: { score: -1 as const } },

                // 5. Limit to top N
                { $limit: limit },

                // 6. $lookup to join the player's username
                {
                    $lookup: {
                        from: "gameusers",
                        localField: "_id",
                        foreignField: "_id",
                        as: "playerDoc",
                    },
                },
                { $unwind: "$playerDoc" },

                // 7. Project into the expected IScoreExportable shape
                {
                    $project: {
                        _id: "$docId",
                        player: {
                            _id: "$playerDoc._id",
                            username: "$playerDoc.username",
                        },
                        gameId: 1,
                        score: 1,
                        scoreStr: 1,
                        seed: 1,
                        createdAt: 1,
                        updatedAt: 1,
                    },
                },
            ]);

            return results as IScoreExportable[];
        } catch (error) {
            throw new AppError("Failed to fetch leaderboard", { error });
        }
    }

    /**
     * My best score — finds the single highest score for a specific player+gameId.
     * With append-only history, a player may have many rows; we sort descending
     * and take the first.
     */
    async getMyScore(
        playerId: Types.ObjectId,
        gameId: string
    ): Promise<IScoreExportable | null> {
        await this.ensureDbConnection();

        try {
            const results = await ScoreModel.find({ player: playerId, gameId })
                .sort({ score: -1 })
                .limit(1)
                .populate({ path: "player", select: "username" })
                .lean<IScoreExportable[]>();

            return results.length > 0 ? results[0] : null;
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
