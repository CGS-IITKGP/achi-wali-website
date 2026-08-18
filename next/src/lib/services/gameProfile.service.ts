import { Types } from "mongoose";
import gameUserRepository from "@/lib/database/repos/gameUser.repo";
import userRepository from "@/lib/database/repos/user.repo";
import {
    hashString,
} from "@/lib/services/core/hash.core.service";
import {
    ESECs,
    ServiceSignature,
    SDIn,
    SDOut,
} from "@/lib/types/index.types";
import AppError from "@/lib/utils/error";


const upsert: ServiceSignature<
    SDIn.GameProfile.Upsert,
    SDOut.GameProfile.Upsert,
    true
> = async (data, session) => {
    const websiteUserId = session.userId;
    const usernameLower = data.username.toLowerCase().trim();

    // Step A: Load the website User record to get the canonical email.
    // We do NOT trust email from the client — email must come from the session.
    const websiteUser = await userRepository.findById(websiteUserId);
    if (!websiteUser) {
        // Should not happen if requireAuth is respected, but guard anyway.
        throw new AppError("Session user not found in database.", { websiteUserId });
    }

    // Step B: Check whether this website user already has a linked GameUser.
    const existingGameUser = await gameUserRepository.findOne({
        websiteUserId: new Types.ObjectId(websiteUserId),
    });

    if (existingGameUser) {
        // === UPDATE path ===

        // Step B1: Username uniqueness check — only query if the username changed.
        if (existingGameUser.username !== usernameLower) {
            const usernameTaken = await gameUserRepository.findOne({
                username: usernameLower,
            });
            if (usernameTaken) {
                return {
                    success: false,
                    errorCode: ESECs.GAME_USERNAME_TAKEN,
                    errorMessage: "That username is already taken.",
                };
            }
        }

        // Step B2: Hash new password and update.
        const passwordHash = await hashString(data.password);

        await gameUserRepository.updateById(existingGameUser._id, {
            username: usernameLower,
            passwordHash,
        });

        return {
            success: true,
            data: { message: "Game profile updated successfully." },
        };
    }

    // === CREATE path ===

    // Step C: Username uniqueness check before insert.
    const usernameTaken = await gameUserRepository.findOne({
        username: usernameLower,
    });
    if (usernameTaken) {
        return {
            success: false,
            errorCode: ESECs.GAME_USERNAME_TAKEN,
            errorMessage: "That username is already taken.",
        };
    }

    // Step D: Hash password and insert new GameUser.
    const passwordHash = await hashString(data.password);

    await gameUserRepository.insert({
        username: usernameLower,
        email: websiteUser.email,
        passwordHash,
        websiteUserId: new Types.ObjectId(websiteUserId),
    });

    return {
        success: true,
        data: { message: "Game profile created successfully." },
    };
};


const get: ServiceSignature<
    SDIn.GameProfile.Get,
    SDOut.GameProfile.Get,
    true
> = async (_data, session) => {
    const existingGameUser = await gameUserRepository.findOne({
        websiteUserId: new Types.ObjectId(session.userId),
    });

    if (!existingGameUser) {
        return {
            success: true,
            data: { linked: false },
        };
    }

    return {
        success: true,
        data: {
            linked: true,
            username: existingGameUser.username,
        },
    };
};


const gameProfileServices = {
    upsert,
    get,
};

export default gameProfileServices;
