import { z } from "zod"
import { allIbDField } from "./core.validator";
import { APIControl } from "../types/api.types";

const blogValidator = {
    get: z.object({
        target: z.enum(APIControl.Blog.Get.Target),
        slug: allIbDField.shortString.optional(),
    }).refine((data) => {
        if (data.target === APIControl.Blog.Get.Target.BY_SLUG && !data.slug) {
            return false;
        }
        if ((data.target === APIControl.Blog.Get.Target.ALL ||
            data.target === APIControl.Blog.Get.Target.MY) && data.slug) {
            return false;
        }
        return true;
    }, {
        message: 'Missing or extra fields based on target',
        path: ['slug'],
    }),
    create: z.object({
        title: allIbDField.shortString,
        slug: allIbDField.slug,
        content: allIbDField.bigString,
        tags: allIbDField.tags,
    }),
    update: z.object({
        _id: allIbDField._id,
        title: allIbDField.shortString.optional(),
        slug: allIbDField.slug.optional(),
        content: allIbDField.longString.optional(),
        tags: allIbDField.tags.optional(),
        collaborators: z.array(allIbDField._id),
        coverImgMediaKey: allIbDField.mediaKey.optional(),
    }),
    remove: z.object({
        _id: allIbDField._id,
    }),
}

export default blogValidator;
