import { z } from "zod"
import { allIbDField } from "./core.validator";
import { APIControl, EFeaturedType } from "../types/index.types";

const featuredValidator = {
    get: z.object({
        target: z.enum(APIControl.Featured.Get.Target),
    }),
    create: z.object({
        contentType: z.enum(EFeaturedType),
        contentId: allIbDField._id,
    }),
    remove: z.object({
        _id: allIbDField._id,
    }),
}

export default featuredValidator;
