import { z } from "zod"
import { allIbDField } from "./core.validator";
import { APIControl } from "../types/api.types";

const userValidator = {
    get: z.object({
        target: z.enum(APIControl.User.Get.Target),
        _id: allIbDField._id.optional(),
    }).refine((data) => {
        if (data.target === APIControl.User.Get.Target.RESTRICTED && !data._id) {
            return false;
        }
        if (data.target === APIControl.User.Get.Target.UNRESTRICTED && !data._id) {
            return false;
        }
        return true;
    }, {
        message: "Missing required fields based on target",
        path: ['_id'],
    }),
    update: z.object({
        name: allIbDField.shortString.optional(),
        profileImgMediaKey: allIbDField.mediaKey.optional(),
        phoneNumber: allIbDField.phoneNumber.optional(),
        links: z.array(allIbDField.link).optional(),
    }),
    updateRoles: z.object({
        _id: allIbDField._id,
        roles: allIbDField.roles,
    }),
    remove: z.object({
        _id: allIbDField._id,
    }),
}

export default userValidator;
