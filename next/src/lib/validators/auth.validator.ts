import { z } from "zod"
import { allIbDField } from "./core.validator";
import { APIControl } from "../types/api.types";

const authValidator = {
    me: z.object({}),
    signIn: z.object({
        email: allIbDField.email,
        password: allIbDField.password,
    }),
    signOut: z.object({}),
    signUp: z.object({
        target: z.enum(APIControl.Auth.SignUp.Target),
        name: z.string().optional(),
        email: allIbDField.email,
        password: allIbDField.password.optional(),
        otp: allIbDField.otp.optional(),
    }).refine((data) => {
        if (data.target === APIControl.Auth.SignUp.Target.REQUEST && !data.name) {
            return false;
        }
        if (data.target === APIControl.Auth.SignUp.Target.RESEND_OTP && !data.otp) {
            return false;
        }
        if (data.target === APIControl.Auth.SignUp.Target.VERIFY && !data.otp) {
            return false;
        }
        return true;
    }, {
        message: "Missing required fields based on action type",
        path: ['name', 'otp']
    }),
    changePassword: z.object({
        password: allIbDField.password,
        newPassword: allIbDField.password,
    }),
}

export default authValidator;
