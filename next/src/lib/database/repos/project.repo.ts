import GenericRepository from "./generic.repo";
import ProjectModel from "@/lib/database/models/project.model";
import { IProject, IProjectExportable } from "@/lib/types/index.types";
import AppError from "@/lib/utils/error";
import { ClientSession, FilterQuery } from "mongoose";


class ProjectRepository extends GenericRepository<
    IProject,
    Pick<IProject, "portfolio" | "title" | "description" | "tags" | "author"
        | "collaborators" | "links" | "coverImgMediaKey" | "media"
    >,
    Pick<IProject, "portfolio" | "title" | "description" | "tags" | "collaborators"
        | "links" | "coverImgMediaKey" | "media"
    >
> {
    constructor() {
        super(ProjectModel);
    }

    async findAllExportable(filter: FilterQuery<IProject> = {}, session?: ClientSession):
        Promise<IProjectExportable[]> {
        await this.ensureDbConnection();

        try {
            return await this.model.find(filter).populate({
                path: "author",
                select: "name",
            }).session(session || null).lean<IProjectExportable[]>().exec();
        } catch (error) {
            throw new AppError('Failed to find document.', {
                error
            });
        }
    }

}

const projectRepository = new ProjectRepository();

export default projectRepository;
