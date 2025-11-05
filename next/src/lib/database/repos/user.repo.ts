import { ClientSession } from "mongoose";
import GenericRepository from "./generic.repo";
import UserModel from "@/lib/database/models/user.model";
import { IUser } from "@/lib/types/index.types";
import AppError from "@/lib/utils/error";


class UserRepository extends GenericRepository<
    IUser,
    Pick<IUser, "name" | "email" | "passwordHash" | "designation" | "roles">,
    Pick<IUser, "name" | "passwordHash" | "profileImgMediaKey"
        | "designation" | "phoneNumber" | "links" | "teamId" | "roles"
    >
> {
    constructor() {
        super(UserModel);
    }

    async findByEmail(email: string, session?: ClientSession): Promise<IUser | null> {
        await this.ensureDbConnection();

        try {
            return await this.model.findOne({ email }).session(session || null).lean<IUser>().exec();
        } catch (error) {
            throw new AppError('Failed to find document.', {
                email,
                error
            });
        }
    }
}

const userRepository = new UserRepository();

export default userRepository;
