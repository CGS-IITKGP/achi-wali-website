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
     * Daily Leaderboard with Fallback:
     * - If scores exist for today (UTC), shows today's leaderboard.
     * - If no scores have been logged today yet (e.g. early morning), falls back to the
     *   most recent active day so the board is never blank before the first play of the day.
     */
    async getTopScores(
        gameId: string,
        limit: number = 100
    ): Promise<IScoreExportable[]> {
        await this.ensureDbConnection();

        try {
            // Determine start of today in UTC
            const now = new Date();
            const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

            // Handle a comma-separated string of possible identifiers
            const rawIds = gameId.split(',');
            const matchGameId = { $in: rawIds.map(id => Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id) };

            // Check if scores exist for today
            const hasScoresToday = await ScoreModel.exists({
                gameId: matchGameId,
                createdAt: { $gte: startOfToday },
            });

            let dateFilter: Record<string, any> = {};
            if (hasScoresToday) {
                dateFilter = { createdAt: { $gte: startOfToday } };
            } else {
                // Find the most recent date with scores for this game
                const latestDoc = await ScoreModel.findOne({ gameId: matchGameId })
                    .sort({ createdAt: -1 })
                    .select("createdAt")
                    .lean<{ createdAt?: Date } | null>();

                if (latestDoc && latestDoc.createdAt) {
                    const latestDate = new Date(latestDoc.createdAt);
                    const startOfLatestDay = new Date(Date.UTC(latestDate.getUTCFullYear(), latestDate.getUTCMonth(), latestDate.getUTCDate(), 0, 0, 0, 0));
                    dateFilter = { createdAt: { $gte: startOfLatestDay } };
                }
            }

            const results = await ScoreModel.aggregate([
                // 1. Match by gameId and date range (today or latest active day)
                { $match: { gameId: matchGameId, ...dateFilter } },

                // 2. Sort by score descending — ensures $first in $group picks the highest score
                { $sort: { score: -1 as const, createdAt: 1 as const } },

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
                {
                    $unwind: {
                        path: "$playerDoc",
                        preserveNullAndEmptyArrays: true,
                    },
                },

                // 6.5 $lookup to join the user's profile picture
                {
                    $lookup: {
                        from: "users",
                        localField: "playerDoc.websiteUserId",
                        foreignField: "_id",
                        as: "userDoc",
                    },
                },
                {
                    $unwind: {
                        path: "$userDoc",
                        preserveNullAndEmptyArrays: true,
                    },
                },

                // 7. Project into the expected IScoreExportable shape
                {
                    $project: {
                        _id: "$docId",
                        player: {
                            _id: { $ifNull: ["$playerDoc._id", "$_id"] },
                            username: { $ifNull: ["$playerDoc.username", "Anonymous"] },
                            profileImgUrl: { $ifNull: ["$userDoc.profileImgUrl", null] },
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
            const rawIds = gameId.split(',');
            const matchGameId = { $in: rawIds.map(id => Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id) };

            const results = await ScoreModel.find({ player: playerId, gameId: matchGameId })
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
