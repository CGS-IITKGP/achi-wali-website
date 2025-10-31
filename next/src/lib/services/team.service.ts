import teamRepository from "@/lib/database/repos/team.repo";
import userRepository from "@/lib/database/repos/user.repo";
import {
    ESECs,
    ServiceSignature,
    EUserRole,
    SDOut,
    SDIn,
    APIControl,
} from "@/lib/types/index.types";
import { withSession } from "../database/db";
import AppError from "../utils/error";


const get: ServiceSignature<
    SDIn.Team.Get,
    SDOut.Team.Get,
    false
> = async (data) => {
    if (data.target === APIControl.Team.Get.Target.ONE) {
        const team = await teamRepository.findExportable({
            teamId: data._id
        });
        if (!team) {
            return {
                success: false,
                errorCode: ESECs.TEAM_NOT_FOUND,
                errorMessage: "Cannot find the team."
            };
        }

        return {
            success: true,
            data: {
                ...team,
                _id: team._id.toHexString(),
                members: team.members.map(member => {
                    return {
                        ...member,
                        _id: member._id.toHexString(),
                    }
                })
            }
        };
    }
    else if (data.target === APIControl.Team.Get.Target.ALL) {
        const teams = await teamRepository.findAllExportable();

        return {
            success: true,
            data: teams.map(team => {
                return {
                    ...team,
                    _id: team._id.toHexString(),
                    members: team.members.map(member => {
                        return {
                            ...member,
                            _id: member._id.toHexString(),
                        }
                    })
                }
            })
        };
    }

    throw new AppError(
        "APIControl.Team.Get is something other than ONE and ALL",
        { data }
    );
};

const create: ServiceSignature<
    SDIn.Team.Create,
    SDOut.Team.Create,
    true
> = async (data, session) => {
    if (!session.userRoles.includes(EUserRole.ADMIN)) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only admin can create a new team.",
        };
    }

    const existingTeam = await teamRepository.findOne({
        name: data.name,
    });

    if (existingTeam) {
        return {
            success: false,
            errorCode: ESECs.TEAM_NAME_TAKEN,
            errorMessage: "A team with this name already exists.",
        };
    }

    await teamRepository.insert({
        name: data.name,
        description: data.description,
    });

    return {
        success: true,
        data: {},
    };
};

const editMembers: ServiceSignature<
    SDIn.Team.EditMembers,
    SDOut.Team.EditMembers,
    true
> = async (data, session) => {
    if (!session.userRoles.includes(EUserRole.ADMIN)) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only admin can add team members.",
        };
    }

    const team = await teamRepository.findById(data._id);
    if (!team) {
        return {
            success: false,
            errorCode: ESECs.TEAM_NOT_FOUND,
            errorMessage: "Team not found.",
        };
    }

    await withSession(async (dbSession) => {
        const teamUpdate =
            data.action === APIControl.Team.EditMembers.Target.ADD
                ? { $addToSet: { members: { $each: data.memberIds } } }
                : { $pull: { members: { $in: data.memberIds } } };

        const userUpdate =
            data.action === APIControl.Team.EditMembers.Target.ADD
                ? { $set: { teamId: data._id } }
                : { $unset: { teamId: "" } };

        await Promise.all([
            teamRepository.updateById(data._id, teamUpdate, dbSession),
            userRepository.updateMany({ _id: { $in: data.memberIds } }, userUpdate, dbSession),
        ]);
    });

    return {
        success: true,
        data: {},
    };
};

const update: ServiceSignature<
    SDIn.Team.Update,
    SDOut.Team.Update,
    true
> = async (data, session) => {
    if (!session.userRoles.includes(EUserRole.ADMIN)) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only admin can update team's details.",
        };
    }

    const team = await teamRepository.findById(data._id);
    if (!team) {
        return {
            success: false,
            errorCode: ESECs.TEAM_NOT_FOUND,
            errorMessage: "Team not found.",
        };
    }

    await teamRepository.updateById(data._id, {
        name: data.name,
        description: data.description,
        coverImageMediaKey: data.coverImageMediaKey,
    });

    return {
        success: true,
        data: {},
    };
};

const remove: ServiceSignature<
    SDIn.Team.Remove,
    SDOut.Team.Remove,
    true
> = async (data, session) => {
    if (!session.userRoles.includes(EUserRole.ADMIN)) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only admin can update team's details.",
        };
    }

    const team = await teamRepository.findById(data._id);
    if (!team) {
        return {
            success: false,
            errorCode: ESECs.TEAM_NOT_FOUND,
            errorMessage: "Team not found.",
        };
    }

    await withSession(async (dbSession) => {
        await teamRepository.removeById(data._id, dbSession);
        await userRepository.updateMany(
            {
                _id: data._id,
            },
            {
                $set: {
                    teamId: null,
                },
            },
            dbSession
        );
    });

    return {
        success: true,
        data: {},
    };
};

const teamServices = {
    get,
    create,
    update,
    addMembers: editMembers,
    remove
};

export default teamServices;
