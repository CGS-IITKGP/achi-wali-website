import { Schema, model, models } from 'mongoose';
import { EProjectPortfolio, IProject } from '@/lib/types/index.types';


const ProjectSchema = new Schema<IProject>({
    portfolio: {
        type: Schema.Types.String,
        enum: Object.values(EProjectPortfolio),
        required: true,
    },
    title: {
        type: Schema.Types.String,
        required: true,
        trim: true,
    },
    description: {
        type: Schema.Types.String,
        required: true,
        trim: true,
    },
    tags: [{
        type: Schema.Types.String,
        trim: true,
    }],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    collaborators: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    links: [{
        text: {
            type: Schema.Types.String,
            required: true,
            trim: true,
        },
        url: {
            type: Schema.Types.String,
            required: true,
            trim: true,
        }
    }],
    coverImgMediaKey: {
        type: Schema.Types.String,
        default: null,
    },
    media: [{
        type: Schema.Types.ObjectId,
        ref: 'Media',
    }],
}, {
    timestamps: true,
});

const ProjectModel = models.Project || model<IProject>("Project", ProjectSchema);

export default ProjectModel;
