import { Schema, model, models } from 'mongoose';
import { ITeam } from '@/lib/types/index.types';


const TeamSchema = new Schema<ITeam>({
    name: {
        type: Schema.Types.String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: Schema.Types.String,
        required: true,
        trim: true,
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    coverImageUrl: {
        type: Schema.Types.String,
        default: null,
    },
}, {
    timestamps: true,
});

const TeamModel = models.Team || model<ITeam>("Team", TeamSchema);

export default TeamModel;
