import GenericRepository from "./generic.repo";
import FeaturedModel from "../models/featured.model";
import { EmptyObject, IFeatured } from "@/lib/types/index.types";
import { ClientSession, FilterQuery } from "mongoose";
import AppError from "@/lib/utils/error";


class FeaturedRepository extends GenericRepository<
    IFeatured,
    Pick<IFeatured, "contentId" | "contentType">,
    EmptyObject
> {
    constructor() {
        super(FeaturedModel);
    }

    async findRecent(limit: number, session?: ClientSession): Promise<IFeatured[]> {
        await this.ensureDbConnection();

        try {
            return await this.model
                .find()
                .session(session || null)
                .sort({ updatedAt: -1, createdAt: -1 })
                .limit(limit)
                .lean<IFeatured[]>()
                .exec();
        } catch (error) {
            throw new AppError("Failed to find all documents.", {
                error,
            });
        }
    }

}

const featuredRepository = new FeaturedRepository();

export default featuredRepository;
