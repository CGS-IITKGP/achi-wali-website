import { z } from "zod"
import { allIbDField } from "./core.validator";
import { APIControl } from "../types/api.types";

const userValidator = {
    get: z
        .object({
            target: z.enum(APIControl.User.Get.Target),
            _id: allIbDField._id.optional(),
            page: allIbDField.paginationPage.optional(),
            limit: allIbDField.paginationLimit.optional(),
        })
        .refine((data) => {
            if (data.target === APIControl.User.Get.Target.ALL) {
                return data.page != undefined && data.limit != undefined;
            }
            if (data.target === APIControl.User.Get.Target.SUMMARY) {
                return true;
            }
            return false;
        }, {
            message:
                "Invalid combination: if target is ALL, provide page & limit; if not ALL or SUMMARY, _id is required",
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
