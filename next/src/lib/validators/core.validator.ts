import { Types } from "mongoose";
import { boolean, z, ZodObject, ZodSchema } from "zod";
import { EUserRole } from "../types/domain.types";

type ValidatedRequest<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: string[]
};

const validator = async <T>(
    incomingData: any,
    schema: ZodSchema<any>
): Promise<ValidatedRequest<T>> => {
    try {
        if (schema instanceof ZodObject) {
            schema = schema.strip();
        }

        const result = schema.safeParse(incomingData);

        if (!result.success) {
            return {
                success: false,
                error: result.error.issues.map(issue => {
                    const path = issue.path.join('.') || 'form';
                    return `${path}$ ${issue.message}`;
                })
            };
        }

        return {
            success: true,
            data: result.data,
        };
    } catch (e) {
        return {
            success: false,
            error: ["Invalid JSON."]
        };
    }
}

namespace __internal__ {
    export const isValidObjectId = (id: string): boolean => {
        return (
            typeof id === 'string' &&
            /^[a-fA-F0-9]{24}$/.test(id) &&
            Types.ObjectId.isValid(id)
        );
    };
}

const allIbDField = {
    _id: z.string()
        .refine((val) => __internal__.isValidObjectId(val), {
            message: "Invalid MongoDB ObjectId",
        })
        .transform((val) => new Types.ObjectId(val)),
    shortString: z.string().trim().max(255),
    longString: z.string().trim().max(4095),
    boolean: z.boolean(),
    email: z.email().max(255).toLowerCase(),
    password: z.string().max(255),
    otp: z.string().regex(new RegExp("^\\d{6}$")),
    token: z.string().regex(new RegExp("^[a-f0-9]{64}$")),
    roles: z.array(z.enum(EUserRole)),
    mediaKey: z.string().max(255).nullable(),
    phoneNumber: z.string().trim().max(20),
    link: z.object({
        label: z.string().trim().max(255),
        url: z.string().url().max(2048),
    }),
}


export default validator;
export { allIbDField }

