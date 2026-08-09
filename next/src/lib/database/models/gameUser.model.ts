import { Schema, model, models } from "mongoose";
import { IGameUser } from "@/lib/types/index.types";

const GameUserSchema = new Schema<IGameUser>(
    {
        username: {
            type: Schema.Types.String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        email: {
            type: Schema.Types.String,
            required: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: Schema.Types.String,
            required: true,
        },
        websiteUserId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

const GameUserModel =
    models.GameUser || model<IGameUser>("GameUser", GameUserSchema);

export default GameUserModel;
