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
import { Types } from "mongoose";
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
    if (data.target === APIControl.User.Get.Target.RESTRICTED) {
        return getRestricted(data, session);
    }

    if (data.target === APIControl.User.Get.Target.UNRESTRICTED) {
        return getUnrestricted(data, session);
    }

    if (data.target === APIControl.User.Get.Target.ALL) {
        return getAll(data, session);
    }

    throw new AppError(
        "APIControl.User.Get is something other than RESTRICTED, UNRESTRICTED, and ALL",
        { data, session }
    );
};

const getRestricted: ServiceSignature<
    SDIn.User.GetRestricted,
    SDOut.User.GetRestricted,
    true
> = async (data) => {
    const user = await userRepository.findById(new Types.ObjectId(data._id));

    if (!user) {
        return {
            success: false,
            errorCode: ESECs.USER_NOT_FOUND,
            errorMessage: "User not found.",
        };
    }

    return {
        success: true,
        data: _userExportLimitedInfo(user),
    };
};

const getUnrestricted: ServiceSignature<
    SDIn.User.GetUnrestricted,
    SDOut.User.GetUnrestricted,
    true
> = async (data, session) => {
    if (!session.userRoles.includes(EUserRole.ADMIN)) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only admin can see all info about users.",
        };
    }

    const user = await userRepository.findById(new Types.ObjectId(data._id));

    if (!user) {
        return {
            success: false,
            errorCode: ESECs.USER_NOT_FOUND,
            errorMessage: "User not found.",
        };
    }

    return {
        success: true,
        data: _userExportUnrestrictedInfo(user),
    };
};

const getAll: ServiceSignature<
    SDIn.User.GetAll,
    SDOut.User.GetAll,
    true
> = async (_) => {
    const users = await userRepository.findAll({});

    return {
        success: true,
        data: users.map((user) => {
            return {
                _id: user._id.toHexString(),
                name: user.name,
                email: user.email,
                profileImgMediaKey: user.profileImgMediaKey,
                roles: user.roles,
                teamId: user.teamId?.toHexString() ?? null,
            };
        }),
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

const updateAssignment: ServiceSignature<
    SDIn.User.UpdateAssignment,
    SDOut.User.UpdateAssignment,
    true
> = async (data, session) => {
    if (!session.userRoles.includes(EUserRole.ADMIN)) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only Admin can modify user roles.",
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
    updateRoles: updateAssignment,
    remove,
};

export default userService;
