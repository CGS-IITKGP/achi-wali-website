import cloudinary from "@/lib/utils/cloudinary";
import { createId } from "@paralleldrive/cuid2";
import {
    ServiceSignature,
    EUserRole,
    SDOut,
    SDIn,
    ESECs,
} from "@/lib/types/index.types";
import getEnvVariable from "../utils/envVariable";
import mediaRepository from "../database/repos/media.repo";


const get: ServiceSignature<
    SDIn.Media.Get,
    SDOut.Media.Get,
    true
> = async (_data, session) => {
    const media = await mediaRepository.findAll({
        uploadedBy: session.userId
    });

    return {
        success: true,
        data: media.map(media => {
            return {
                _id: media._id.toHexString(),
                key: media.key,
                url: media.url,
                sizeBytes: media.sizeBytes,
                format: media.format,
                resourceType: media.resourceType
            }
        })
    }
}

const sign: ServiceSignature<
    SDIn.Media.Sign,
    SDOut.Media.Sign,
    true
> = async (_data, session) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "user-assets/" + session.userId.toHexString();
    const publicId = createId();

    // These should be alphabetically sorted for signature to match.
    // In cloudinary, final public_id will be concatenation of folder and public_id.
    const paramsToSign = {
        folder,
        public_id: publicId,
        timestamp: timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        getEnvVariable("CLOUDINARY_API_SECRET", true)
    );

    return {
        success: true,
        data: {
            signature,
            timestamp: timestamp.toString(),
            folder,
            publicId,
            cloudName: getEnvVariable("CLOUDINARY_CLOUD_NAME", true),
            apiKey: getEnvVariable("CLOUDINARY_API_KEY", true)
        }
    }
}

const create: ServiceSignature<
    SDIn.Media.Create,
    SDOut.Media.Create,
    true
> = async (data, session) => {
    if (!session.userRoles.includes(EUserRole.MEMBER)) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only members can add a new project."
        }
    }

    const media = await mediaRepository.findOne({ key: data.publicId });
    if (media) {
        return {
            success: false,
            errorCode: ESECs.MEDIA_PUBLIC_ID_ALREADY_EXISTS,
            errorMessage: "Media with this public id already exists."
        }
    }

    let sizeBytes = -1;
    let format = "unknown";
    let resourceType = "unknown";

    try {
        const cloudinaryResource = await cloudinary.api.resource(data.publicId);

        sizeBytes = cloudinaryResource.bytes ?? -1;
        format = cloudinaryResource.format ?? "unknown";
        resourceType = cloudinaryResource.resource_type ?? "unknown";
    } catch {
        // I will think about it later.
    }

    await mediaRepository.insert({
        key: data.publicId,
        url: data.url,
        sizeBytes,
        format,
        resourceType,
        uploadedBy: session.userId
    });

    return {
        success: true,
        data: {},
    };
}

const remove: ServiceSignature<
    SDIn.Media.Remove,
    SDOut.Media.Remove,
    true
> = async (data, session) => {
    const media = await mediaRepository.findById(data._id);
    if (!media) {
        return {
            success: false,
            errorCode: ESECs.MEDIA_NOT_FOUND,
            errorMessage: "Media not found.",
        };
    }

    if (!session.userRoles.includes(EUserRole.ADMIN) &&
        !(media.uploadedBy.toHexString() === session.userId.toHexString())) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only admin or uploader can remove a media."
        }
    }

    await cloudinary.uploader.destroy(media.key, {
        invalidate: true,
    });

    await mediaRepository.removeById(data._id);

    return {
        success: true,
        data: {},
    };
}

const mediaServices = {
    get,
    sign,
    create,
    remove
};

export default mediaServices;
