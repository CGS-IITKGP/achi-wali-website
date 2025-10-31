import { z } from "zod"
import { allIbDField } from "./core.validator";
import { APIControl } from "../types/api.types";

const projectValidator = {
    get: z.object({
        target: z.enum(APIControl.Project.Get.Target),
        portfolio: z.enum(APIControl.Project.Get.Portfolio),
    }),
    create: z.object({
        title: allIbDField.shortString,
        portfolio: allIbDField.projectPortfolio,
        description: allIbDField.longString,
        tags: allIbDField.tags,
        links: z.array(allIbDField.link),
    }),
    update: z.object({
        _id: allIbDField._id,
        title: allIbDField.shortString.optional(),
        description: allIbDField.longString.optional(),
        tags: allIbDField.tags.optional(),
        links: z.array(allIbDField.link).optional(),
        collaborators: z.array(allIbDField._id),
        coverImgMediaKey: allIbDField.mediaKey.optional(),
        media: z.array(allIbDField._id).optional(),
    }),
    remove: z.object({
        _id: allIbDField._id,
    }),
}

export default projectValidator;
