import { Schema, model, models } from "mongoose";
import { IGameAuthCode } from "@/lib/types/index.types";

const GameAuthCodeSchema = new Schema<IGameAuthCode>(
    {
        code: {
            type: Schema.Types.String,
            required: true,
            unique: true,
            index: true,
        },
        gameUserId: {
            type: Schema.Types.ObjectId,
            ref: "GameUser",
            required: true,
        },
        gameId: {
            type: Schema.Types.String,
            required: true,
        },
        used: {
            type: Schema.Types.Boolean,
            default: false,
        },
        expiresAt: {
            type: Schema.Types.Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// TTL index — MongoDB will automatically delete documents after expiresAt
GameAuthCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const GameAuthCodeModel =
    models.GameAuthCode || model<IGameAuthCode>("GameAuthCode", GameAuthCodeSchema);

export default GameAuthCodeModel;
