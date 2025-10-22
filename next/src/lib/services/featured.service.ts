import featuredRepository from "../database/repos/featured.repo";
import {
    ESECs,
    ServiceSignature,
    EUserRole,
    SDOut,
    SDIn,
    APIControl,
} from "@/lib/types/index.types";
import AppError from "../utils/error";
import projectRepository from "../database/repos/project.repo";

const get: ServiceSignature<
    SDIn.Featured.Get,
    SDOut.Featured.Get,
    false
> = async (data, session) => {
    const featured = await featuredRepository.findAll({
        contentType: APIControl.Featured.Get.Target
    });

    const featuredContents = await projectRepository.findAllExportable({
        _id: {
            $in: featured.map(featured => featured.contentId)
        }
    });

    return {
        success: true,
        data: featuredContents.map(featureContent => {
            return {
                _id: featureContent._id.toHexString(),
                title: featureContent.title,
                tags: featureContent.tags,
                links: featureContent.links,
                coverImgMediaKey: featureContent.coverImgMediaKey,
            }
        }),
    };

    throw new AppError(
        "APIControl.Featured.Get is something other than GAME and PROJECT",
        { data, session }
    );
};

const create: ServiceSignature<
    SDIn.Featured.Create,
    SDOut.Featured.Create,
    true
> = async (data, session) => {
    if (!session.userRoles.includes(EUserRole.ADMIN)) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only admin can add a featured content."
        }
    }

    const existingFeatured = await featuredRepository.findOne({
        contentId: data.contentId
    });
    if (existingFeatured) {
        return {
            success: false,
            errorCode: ESECs.ALREADY_FEATURED,
            errorMessage: "This content is already featured"
        }
    }

    await featuredRepository.insert({
        contentType: data.contentType,
        contentId: data.contentId,
    });

    return {
        success: true,
        data: {},
    };
};

const remove: ServiceSignature<
    SDIn.Featured.Remove,
    SDOut.Featured.Remove,
    true
> = async (data, session) => {
    const featured = await featuredRepository.findById(data._id);
    if (!featured) {
        return {
            success: false,
            errorCode: ESECs.FEATURED_NOT_FOUND,
            errorMessage: "Featured content not found.",
        };
    }

    if (!session.userRoles.includes(EUserRole.ADMIN)) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only admin remove a featured content."
        }
    }

    await featuredRepository.removeById(data._id);

    return {
        success: true,
        data: {},
    };
};


const featuredServices = {
    get,
    create,
    remove
};


export default featuredServices;
