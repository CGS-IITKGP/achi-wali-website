import { Schema, model, models } from 'mongoose';
import { IBlog } from '@/lib/types/index.types';


const BlogSchema = new Schema<IBlog>({
    title: {
        type: Schema.Types.String,
        required: true,
        trim: true,
    },
    slug: {
        type: Schema.Types.String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    content: {
        type: Schema.Types.String,
        required: true,
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
    coverImgMediaKey: {
        type: Schema.Types.String,
        default: null,
    },
}, {
    timestamps: true,
});

const BlogModel = models.Blog || model<IBlog>("Blog", BlogSchema);

export default BlogModel;
