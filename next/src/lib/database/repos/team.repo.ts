import GenericRepository from "./generic.repo";
import TeamModel from "@/lib/database/models/team.model";
import { ITeam, ITeamExportable, ITeamOfListExportable } from "@/lib/types/index.types";
import AppError from "@/lib/utils/error";
import { ClientSession, FilterQuery } from "mongoose";


class TeamRepository extends GenericRepository<
    ITeam,
    Pick<ITeam, "name" | "description">,
    Pick<ITeam, "name" | "description" | "members" | "coverImageMediaKey">
> {
    constructor() {
        super(TeamModel);
    }

    async findExportable(filter: FilterQuery<ITeam> = {}, session?: ClientSession):
        Promise<ITeamExportable | null> {
        await this.ensureDbConnection();

        try {
            return await this.model.findOne(filter).populate({
                path: "authors",
                select: "name links profileImgMediaKey",
            }).session(session || null).lean<ITeamExportable>().exec();
        } catch (error) {
            throw new AppError('Failed to find document.', {
                error
            });
        }
    }

    async findAllExportable(filter: FilterQuery<ITeam> = {}, session?: ClientSession):
        Promise<ITeamExportable[]> {
        await this.ensureDbConnection();

        try {
            return await this.model.find(filter).populate({
                path: "members",
                select: "name links profileImgMediaKey",
            }).session(session || null).lean<ITeamExportable[]>().exec();
        } catch (error) {
            throw new AppError('Failed to find document.', {
                error
            });
        }
    }

    async findAllOfListExportable(filter: FilterQuery<ITeam> = {}, session?: ClientSession):
        Promise<ITeamOfListExportable[]> {
        await this.ensureDbConnection();

        try {
            return await this.model.find(filter).populate({
                path: "members",
                select: "name links profileImgMediaKey",
            }).session(session || null).lean<ITeamOfListExportable[]>().exec();
        } catch (error) {
            throw new AppError('Failed to find document.', {
                error
            });
        }
    }
}

const teamRepository = new TeamRepository();

export default teamRepository;
