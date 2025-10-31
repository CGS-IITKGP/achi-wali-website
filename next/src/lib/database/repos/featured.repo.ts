import GenericRepository from "./generic.repo";
import FeaturedModel from "../models/featured.model";
import { EmptyObject, IFeatured, IFeaturedExportableAsList } from "@/lib/types/index.types";
import { FilterQuery } from "mongoose";
import AppError from "@/lib/utils/error";

class FeaturedRepository extends GenericRepository<
    IFeatured,
    Pick<IFeatured, "contentId" | "contentType" | "isHighlight">,
    EmptyObject
> {
    constructor() {
        super(FeaturedModel);
    }

    async findAllExportableAsList(_filter: FilterQuery<IFeatured> = {}, _session?: undefined):
        Promise<IFeaturedExportableAsList[]> {
        await this.ensureDbConnection();

        try {
            return await this.model.aggregate([
                {
                    $lookup: {
                        from: "blogs",
                        localField: "contentId",
                        foreignField: "_id",
                        as: "blogData"
                    }
                },
                {
                    $lookup: {
                        from: "projects",
                        localField: "contentId",
                        foreignField: "_id",
                        as: "projectData"
                    }
                },
                {
                    $addFields: {
                        contentTitle: {
                            $switch: {
                                branches: [
                                    {
                                        case: { $eq: ["$contentType", "BLOG"] },
                                        then: { $arrayElemAt: ["$blogData.title", 0] }
                                    },
                                    {
                                        case: {
                                            $in: ["$contentType", ["GAME", "GRAPHICS", "RND"]]
                                        },
                                        then: { $arrayElemAt: ["$projectData.title", 0] }
                                    }
                                ],
                                default: null
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        contentType: 1,
                        contentTitle: 1,
                        isHighlight: 1
                    }
                }
            ]);
        } catch (error) {
            throw new AppError('Failed to find document.', {
                error
            });
        }
    }
}

const featuredRepository = new FeaturedRepository();

export default featuredRepository;
