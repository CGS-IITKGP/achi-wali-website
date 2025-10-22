import { z } from "zod"
import { allIbDField } from "./core.validator";
import { APIControl } from "../types/api.types";

const teamValidator = {
    get: z.object({
        target: z.enum([
            APIControl.Team.Get.Target.ONE,
            APIControl.Team.Get.Target.ALL,
        ]),
        _id: allIbDField._id.optional(),
    }).refine((data) => {
        if (data.target === APIControl.Team.Get.Target.ONE && !data._id) {
            return false;
        }
        return true;
    }, {
        message: 'Missing required fields or invalid _id.',
        path: ['_id'],
    }),
    create: z.object({
        name: allIbDField.shortString,
        description: allIbDField.longString,
    }),
    update: z.object({
        _id: allIbDField._id,
        name: allIbDField.shortString.optional(),
        description: allIbDField.longString.optional(),
        coverImageMediaKey: allIbDField.shortString.optional(),
    }),
    addMembers: z.object({
        _id: allIbDField._id,
        memberIds: z.array(allIbDField._id),
    }),
    remove: z.object({
        _id: allIbDField._id,
    }),
}

export default teamValidator;
