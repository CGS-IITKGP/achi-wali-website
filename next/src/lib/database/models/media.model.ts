import { Schema, model, models } from 'mongoose';
import { IMedia } from '@/lib/types/index.types';


const MediaSchema = new Schema<IMedia>({
    key: {
        type: Schema.Types.String,
        required: true,
        unique: true,
        trim: true,
    },
    url: {
        type: Schema.Types.String,
        required: true,
        trim: true,
    },
    sizeBytes: {
        type: Schema.Types.Number,
        required: true
    },
    format: {
        type: Schema.Types.String,
        required: true
    },
    resourceType: {
        type: Schema.Types.String,
        required: true
    },
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

const MediaModel = models.Media || model<IMedia>("Media", MediaSchema);

export default MediaModel;
