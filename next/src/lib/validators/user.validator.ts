import { z } from "zod"
import { allIbDField } from "./core.validator";
import { APIControl } from "../types/api.types";

const userValidator = {
    get: z
        .object({
            target: z.nativeEnum(APIControl.User.Get.Target),
            _id: allIbDField._id.optional(),
            page: allIbDField.paginationPage.optional(),
            limit: allIbDField.paginationLimit.optional(),
        })
        .refine((data) => {
            if (data.target === APIControl.User.Get.Target.ALL || data.target === APIControl.User.Get.Target.PUBLIC_ALL) {
                return data.page != undefined && data.limit != undefined;
            }
            if (data.target === APIControl.User.Get.Target.SUMMARY) {
                return true;
            }
            if (data.target === APIControl.User.Get.Target.PUBLIC_SINGLE) {
                return data._id != undefined;
            }
            return false;
        }, {
            message:
                "Invalid combination: if target is ALL or PUBLIC_ALL, provide page & limit; if PUBLIC_SINGLE, _id is required; other targets follow specific rules.",
        }),
    update: z.object({
        name: allIbDField.shortString.optional(),
        phoneNumber: allIbDField.phoneNumber.optional(),
        links: z.array(allIbDField.link).optional(),
        profileImgMediaKey: allIbDField.mediaKeyNotNullable.optional(),
    }),
    updateTeam: z.object({
        _id: allIbDField._id,
        teamId: allIbDField._id,
    }),
    updateAssignment: z.object({
        _id: allIbDField._id,
        roles: allIbDField.roles.optional(),
        designation: allIbDField.designation.optional(),
    }),
    remove: z.object({
        _id: allIbDField._id,
    }),
}

export default userValidator;
