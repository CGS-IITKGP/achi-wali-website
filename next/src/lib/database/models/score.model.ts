import { Schema, model, models } from "mongoose";
import { IScore } from "@/lib/types/index.types";

const ScoreSchema = new Schema<IScore>(
    {
        player: {
            type: Schema.Types.ObjectId,
            ref: "GameUser",
            required: true,
        },
        gameId: {
            type: Schema.Types.String,
            required: true,
            trim: true,
        },
        score: {
            type: Schema.Types.Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const ScoreModel = models.Score || model<IScore>("Score", ScoreSchema);

export default ScoreModel;
