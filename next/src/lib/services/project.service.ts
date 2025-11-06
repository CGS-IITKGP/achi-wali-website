import projectRepository from "../database/repos/project.repo";
import {
    ESECs,
    ServiceSignature,
    EUserRole,
    SDOut,
    SDIn,
    IProjectExportable,
    APIControl,
} from "@/lib/types/index.types";
import AppError from "../utils/error";

const get: ServiceSignature<
    SDIn.Project.Get,
    SDOut.Project.Get,
    false
> = async (data, session) => {
    if (data.target === APIControl.Project.Get.Target.ALL_AS_LIST) {
        return await getAsList({}, null);
    }

    let projects: IProjectExportable[] = [];

    if (data.target === APIControl.Project.Get.Target.MY) {
        if (session === null) {
            return {
                success: false,
                errorCode: ESECs.UNAUTHORIZED,
                errorMessage: "Must be signed-in to see your projects.",
            };
        }

        projects = await projectRepository.findAllExportable({
            author: session.userId
        });
    } else if (data.target === APIControl.Project.Get.Target.ALL) {
        const filter = data.portfolio === APIControl.Project.Get.Portfolio.ANY
            ? {}
            : { portfolio: data.portfolio?.toUpperCase() }

        projects = await projectRepository.findAllExportable(filter);
    } else {
        throw new AppError(
            "APIControl.Project.Get is something other than MY, ALL, and ALL_AS_LIST",
            { data, session }
        );
    }

    return {
        success: true,
        data: projects.map((project) => {
            return {
                ...project,
                _id: project._id.toHexString(),
                author: {
                    ...project.author,
                    _id: project.author._id.toHexString(),
                },
                collaborators: project.collaborators.map(collaborator => {
                    return {
                        ...collaborator,
                        _id: collaborator._id.toHexString(),
                    }
                }),
                media: project.media.map((media) => media.toHexString()),
            };
        }),
    };
};

const getAsList: ServiceSignature<
    SDIn.Project.GetAsList,
    SDOut.Project.GetAsList,
    false
> = async (_data, _session) => {
    const projects = await projectRepository.findAllExportable();

    return {
        success: true,
        data: projects.map((project) => {
            return {
                _id: project._id.toHexString(),
                title: project.title,
                portfolio: project.portfolio,
            };
        }),
    };
};

const create: ServiceSignature<
    SDIn.Project.Create,
    SDOut.Project.Create,
    true
> = async (data, session) => {
    if (!session.userRoles.includes(EUserRole.MEMBER)) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only members can create a new project.",
        };
    }

    await projectRepository.insert({
        portfolio: data.portfolio,
        title: data.title,
        description: data.description,
        tags: data.tags,
        author: session.userId,
        collaborators: [],
        links: data.links,
        coverImgMediaKey: data.coverImgMediaKey,
        media: [],
    });

    return {
        success: true,
        data: {},
    };
};

const update: ServiceSignature<
    SDIn.Project.Update,
    SDOut.Project.Update,
    true
> = async (data, session) => {
    const project = await projectRepository.findById(data._id);
    if (!project) {
        return {
            success: false,
            errorCode: ESECs.PROJECT_NOT_FOUND,
            errorMessage: "Project not found;",
        };
    }

    if (
        !session.userRoles.includes(EUserRole.ADMIN) &&
        !!(project._id.toHexString() === session.userId.toHexString())
    ) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only admin or author can remove a project.",
        };
    }

    const { _id, ...updateDoc } = data;

    await projectRepository.updateById(data._id, updateDoc);

    return {
        success: true,
        data: {},
    };
};

const remove: ServiceSignature<
    SDIn.Project.Remove,
    SDOut.Project.Remove,
    true
> = async (data, session) => {
    const project = await projectRepository.findById(data._id);
    if (!project) {
        return {
            success: false,
            errorCode: ESECs.PROJECT_NOT_FOUND,
            errorMessage: "Project not found;",
        };
    }

    if (
        !session.userRoles.includes(EUserRole.ADMIN) &&
        !(project.author._id.toHexString() === session.userId.toHexString())
    ) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only admin or author can remove a project.",
        };
    }

    await projectRepository.removeById(data._id);

    return {
        success: true,
        data: {},
    };
};

const projectServices = {
    get,
    create,
    update,
    remove,
};

export default projectServices;
