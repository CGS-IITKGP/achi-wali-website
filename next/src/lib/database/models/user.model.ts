import { Schema, model, models } from 'mongoose';
import { IUser, EUserRole, EUserDesignation } from '@/lib/types/index.types';


const UserSchema = new Schema<IUser>({
    name: {
        type: Schema.Types.String,
        required: true,
        trim: true,
    },
    email: {
        type: Schema.Types.String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: Schema.Types.String,
        required: true,
    },
    profileImgMediaKey: {
        type: Schema.Types.String,
        default: null,
    },
    phoneNumber: {
        type: Schema.Types.String,
        default: null,
        trim: true,
    },
    links: [{
        label: {
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
    teamId: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        default: null,
    },
    roles: [{
        type: Schema.Types.String,
        enum: Object.values(EUserRole),
        default: [EUserRole.GUEST],
        required: true,
    }],
    designation: {
        type: Schema.Types.String,
        enum: Object.values(EUserDesignation),
        default: EUserDesignation.NONE,
        required: true,
    },
}, {
    timestamps: true,
});

const UserModel = models.User || model<IUser>('User', UserSchema);

export default UserModel;
