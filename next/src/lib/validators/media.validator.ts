import { z } from "zod"
import { allIbDField } from "./core.validator";

const mediaValidator = {
    get: z.object({}),
    sign: z.object(),
    create: z.object({
        publicId: allIbDField.shortString,
        url: allIbDField.url
    }),
    remove: z.object({
        _id: allIbDField._id,
    }),
}

export default mediaValidator;
