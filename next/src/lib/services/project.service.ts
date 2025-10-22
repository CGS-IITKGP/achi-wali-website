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
    let projects: IProjectExportable[] = [];

    if (data.target === APIControl.Project.Get.Target.MY) {
        if (session === null) {
            return {
                success: false,
                errorCode: ESECs.UNAUTHORIZED,
                errorMessage: "Must be signed-in to see your projects."
            }
        }

        projects = await projectRepository.findAllExportable({
            _id: session.userId,
            portfolio: data.portfolio
        });
    }
    else if (data.target === APIControl.Project.Get.Target.ALL) {
        projects = await projectRepository.findAllExportable({
            portfolio: data.portfolio
        });
    }
    else {
        throw new AppError(
            "APIControl.Project.Get is something other than MY and ALL",
            { data, session }
        );
    }

    return {
        success: true,
        data: projects.map(project => {
            return {
                ...project,
                _id: project._id.toHexString(),
                authors: project.authors.map(author => {
                    return {
                        ...author,
                        _id: author._id.toHexString(),
                    }
                }),
                media: project.media.map(media => media.toHexString()),
            }
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
            errorMessage: "Only members can create a new project."
        }
    }

    await projectRepository.insert({
        portfolio: data.portfolio,
        title: data.title,
        description: data.description,
        tags: data.tags,
        authors: [session.userId],
        links: data.links,
        coverImgMediaKey: null,
        media: []
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

    if (!session.userRoles.includes(EUserRole.ADMIN) &&
        !project.authors.some(id => id.toHexString() === session.userId.toHexString())) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only admin or author can remove a project."
        }
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

    if (!session.userRoles.includes(EUserRole.ADMIN) &&
        !project.authors.some(id => id.toHexString() === session.userId.toHexString())) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only admin or author can remove a project."
        }
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
    remove
};


export default projectServices;
