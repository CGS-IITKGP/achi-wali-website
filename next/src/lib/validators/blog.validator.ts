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
        slug: allIbDField.shortString,
        content: allIbDField.bigString,
        tags: z.array(allIbDField.shortString),
    }),
    update: z.object({
        _id: allIbDField._id,
        title: allIbDField.shortString.optional(),
        slug: allIbDField.shortString.optional(),
        content: allIbDField.longString.optional(),
        tags: z.array(allIbDField.shortString).optional(),
        coverImgMediaKey: allIbDField.mediaKey.optional(),
    }),
    remove: z.object({
        _id: allIbDField._id,
    }),
}

export default blogValidator;
