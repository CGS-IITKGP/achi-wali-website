import { Schema, model, models } from 'mongoose';
import { ILeaderboard } from '@/lib/types/index.types';


const LeaderboardSchema = new Schema<ILeaderboard>({
    username: {
        type: Schema.Types.String,
        required: true,
        trim: true,
        lowercase: true,
    },
    gameName: {
        type: Schema.Types.String,
        required: true,
        trim: true,
        lowercase: true,
    },
    score: {
        type: Schema.Types.Number,
        required: true,
        min: 0,
    },
}, {
    timestamps: true,
});

LeaderboardSchema.index(
    {
        username: 1,
        gameName: 1,
    },
    {
        unique: true,
    }
);

const LeaderboardModel =
    models.Leaderboard ||
    model<ILeaderboard>('Leaderboard', LeaderboardSchema);

export default LeaderboardModel;