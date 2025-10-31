import GenericRepository from "./generic.repo";
import BlogModel from "@/lib/database/models/blog.model";
import { IBlog, IBlogExportable, IBlogOfListExportable } from "@/lib/types/index.types";
import AppError from "@/lib/utils/error";
import { ClientSession, FilterQuery } from "mongoose";


class BlogRepository extends GenericRepository<
    IBlog,
    Pick<IBlog, "title" | "slug" | "content" | "tags" | "author"
        | "coverImgMediaKey"
    >,
    Pick<IBlog, "title" | "slug" | "content" | "tags" | "collaborators"
        | "coverImgMediaKey"
    >
> {
    constructor() {
        super(BlogModel);
    }

    async findAllOfListExportable(filter: FilterQuery<IBlog> = {}, session?: ClientSession):
        Promise<IBlogOfListExportable[]> {
        await this.ensureDbConnection();

        try {
            return await this.model.find(filter).select('-content').populate({
                path: "author",
                select: "name",
            }).session(session || null).lean<IBlogOfListExportable[]>().exec();
        } catch (error) {
            throw new AppError('Failed to find document.', {
                error
            });
        }
    }

    async findExportable(filter: FilterQuery<IBlog> = {}, session?: ClientSession):
        Promise<IBlogExportable | null> {
        await this.ensureDbConnection();

        try {
            return await this.model.findOne(filter).populate({
                path: "author",
                select: "name",
            }).session(session || null).lean<IBlogExportable>().exec();
        } catch (error) {
            throw new AppError('Failed to find document.', {
                error
            });
        }
    }

    async findAllExportable(filter: FilterQuery<IBlog> = {}, session?: ClientSession):
        Promise<IBlogExportable[]> {
        await this.ensureDbConnection();

        try {
            return await this.model.find(filter).populate({
                path: "author",
                select: "name",
            }).session(session || null).lean<IBlogExportable[]>().exec();
        } catch (error) {
            throw new AppError('Failed to find document.', {
                error
            });
        }
    }
}

const blogRepository = new BlogRepository();

export default blogRepository;
