import { Schema, model, models } from 'mongoose';
import { IFeatured, EFeaturedType } from '@/lib/types/index.types';

const FeaturedSchema = new Schema<IFeatured>({
    contentType: {
        type: Schema.Types.String,
        enum: Object.values(EFeaturedType),
        required: true,
    },
    contentId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
}, {
    timestamps: true,
});

const FeaturedModel = models.Featured || model<IFeatured>('Featured', FeaturedSchema);

export default FeaturedModel;
