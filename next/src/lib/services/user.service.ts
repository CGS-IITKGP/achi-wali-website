import userRepository from "@/lib/database/repos/user.repo";
import teamRepository from "@/lib/database/repos/team.repo";
import {
    ESECs,
    ServiceSignature,
    EUserRole,
    IUser,
    SDOut,
    SDIn,
    APIControl,
} from "@/lib/types/index.types";
import { withSession } from "../database/db";
import AppError from "../utils/error";

const _userExportLimitedInfo = (user: IUser) => {
    return {
        _id: user._id.toHexString(),
        name: user.name,
        email: user.email,
        profileImgMediaKey: user.profileImgMediaKey,
        roles: user.roles,
        teamId: user.teamId?.toHexString() ?? null,
        links: user.links,
        createdAt: user.createdAt,
    };
};

const _userExportUnrestrictedInfo = (user: IUser) => {
    return {
        _id: user._id.toHexString(),
        name: user.name,
        email: user.email,
        profileImgMediaKey: user.profileImgMediaKey,
        phoneNumber: user.phoneNumber,
        roles: user.roles,
        teamId: user.teamId?.toHexString() ?? null,
        links: user.links,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }
}

const get: ServiceSignature<
    SDIn.User.Get,
    SDOut.User.Get,
    true
> = async (data, session) => {
    if (!session.userRoles.includes(EUserRole.ADMIN)) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only Admin can view aggregated user data.",
        };
    }

    if (data.target === APIControl.User.Get.Target.ALL) {
        return getAll(data, session);
    }

    throw new AppError(
        "APIControl.User.Get.Target is something other than SUMMARY and ALL",
        { data, session }
    );
};

const getAll: ServiceSignature<
    SDIn.User.GetAll,
    SDOut.User.GetAll,
    true
> = async (data) => {
    const paginatedUsers = await userRepository.findAllPaginated({}, {
        page: data.page,
        limit: data.limit,
    });

    return {
        success: true,
        data: {
            users: paginatedUsers.data.map((user) => {
                return {
                    _id: user._id.toHexString(),
                    name: user.name,
                    email: user.email,
                    roles: user.roles,
                    designation: user.designation,
                    teamId: user.teamId?.toHexString() ?? null,
                };
            }),
            total: paginatedUsers.total,
            page: paginatedUsers.page,
            limit: paginatedUsers.limit,
            totalPages: paginatedUsers.totalPages,
        },
    };
};

const update: ServiceSignature<
    SDIn.User.Update,
    SDOut.User.Update,
    true
> = async (data, session) => {
    const user = await userRepository.findById(session.userId);
    if (!user) {
        return {
            success: false,
            errorCode: ESECs.USER_NOT_FOUND,
            errorMessage: "User not found.",
        };
    }

    await userRepository.updateById(session.userId, { ...data });

    return {
        success: true,
        data: {},
    };
};

const updateTeam: ServiceSignature<
    SDIn.User.UpdateTeam,
    SDOut.User.UpdateTeam,
    true
> = async (data, session) => {
    if (!session.userRoles.includes(EUserRole.ADMIN)) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only Admin can modify user's team.",
        };
    }

    const user = await userRepository.findById(data._id);
    if (!user) {
        return {
            success: false,
            errorCode: ESECs.USER_NOT_FOUND,
            errorMessage: "User not found.",
        };
    }

    // TODO: Wrap all in a database transaction.
    await withSession(async (_dbSession) => {
        const updates: Promise<unknown>[] = [];

        if (user.teamId && data.teamId !== null && user.teamId.toString() !== data.teamId.toString()) {
            updates.push(
                teamRepository.updateById(
                    user.teamId,
                    { $pull: { members: user._id } },
                    //dbSession
                )
            );
        }

        if (data.teamId) {
            updates.push(
                teamRepository.updateById(
                    data.teamId,
                    { $addToSet: { members: user._id } },
                    // dbSession
                )
            );

            updates.push(
                userRepository.updateById(
                    user._id,
                    { $set: { teamId: data.teamId } },
                    // dbSession
                )
            );
        }
        else {
            updates.push(
                userRepository.updateById(
                    user._id,
                    { $set: { teamId: null } },
                    // dbSession
                )
            );
        }

        await Promise.all(updates);
    });

    return {
        success: true,
        data: {},
    };
};


const updateAssignment: ServiceSignature<
    SDIn.User.UpdateAssignment,
    SDOut.User.UpdateAssignment,
    true
> = async (data, session) => {
    if (!session.userRoles.includes(EUserRole.ADMIN)) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only Admin can modify user assignment.",
        };
    }

    const user = await userRepository.findById(data._id);
    if (!user) {
        return {
            success: false,
            errorCode: ESECs.USER_NOT_FOUND,
            errorMessage: "User not found.",
        };
    }

    await userRepository.updateById(data._id, {
        roles: data.roles,
        designation: data.designation
    });

    return {
        success: true,
        data: {},
    };
};

const remove: ServiceSignature<
    SDIn.User.Remove,
    SDOut.User.Remove,
    true
> = async (data, session) => {
    if (!session.userRoles.includes(EUserRole.ADMIN)) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only admin can remove a user.",
        };
    }

    const user = await userRepository.findById(data._id);
    if (!user) {
        return {
            success: false,
            errorCode: ESECs.USER_NOT_FOUND,
            errorMessage: "User not found.",
        };
    }

    await withSession(async (dbSession) => {
        if (user.teamId) {
            await teamRepository.updateById(
                user.teamId,
                {
                    $pull: {
                        memberIds: data._id,
                    },
                },
                dbSession
            );
        }

        await userRepository.removeById(data._id, dbSession);
    });

    return {
        success: true,
        data: {},
    };
};

const userService = {
    get,
    update,
    updateTeam,
    updateAssignment,
    remove,
};

export default userService;
