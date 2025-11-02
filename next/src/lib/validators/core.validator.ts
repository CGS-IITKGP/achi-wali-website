import { Types } from "mongoose";
import { z, ZodSchema } from "zod";
import { EProjectPortfolio, EUserDesignation, EUserRole } from "../types/domain.types";

type ValidatedRequest<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: string[]
};

const validator = async <IbD>(
    incomingData: unknown,
    schema: ZodSchema<IbD>
): Promise<ValidatedRequest<IbD>> => {
    try {
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
    } catch (_) {
        return {
            success: false,
            error: ["Invalid JSON."]
        };
    }
}

const _isValidObjectId = (id: string): boolean => {
    return (
        typeof id === 'string' &&
        /^[a-fA-F0-9]{24}$/.test(id) &&
        Types.ObjectId.isValid(id)
    );
};


const allIbDField = {
    _id: z.string()
        .refine((val) => _isValidObjectId(val), {
            message: "Invalid MongoDB ObjectId",
        })
        .transform((val) => new Types.ObjectId(val)),
    teamId: z
        .string()
        .nullable()
        .refine((val) => val === null || _isValidObjectId(val), {
            message: "Invalid MongoDB ObjectId",
        })
        .transform((val) => (val === null ? null : new Types.ObjectId(val))),
    shortString: z.string().trim().max(255),
    longString: z.string().trim().max(4095),
    bigString: z.string().trim().max(32767),
    boolean: z.boolean(),
    email: z.email().max(255).toLowerCase(),
    password: z.string().max(255),
    otp: z.string().regex(new RegExp("^\\d{6}$")),
    token: z.string().regex(new RegExp("^[a-f0-9]{64}$")),
    roles: z.array(z.enum(EUserRole)),
    designation: z.enum(EUserDesignation),
    mediaKey: z.string().max(255).nullable(),
    mediaKeyNotNullable: z.string().max(255),
    phoneNumber: z.string().trim().max(20),
    projectPortfolio: z.enum(EProjectPortfolio),
    url: z.string().url().max(2048),
    link: z.object({
        text: z.string().trim().max(255),
        url: z.string().url().max(2048),
    }),
    tags: z.array(z.string().max(31).transform((str) => str.toLowerCase())),
    slug: z.string().trim().max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: "Slug must be URL-friendly (lowercase letters, numbers, and hyphens only)",
    }),
    paginationPage: z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().int().min(1)),
    paginationLimit: z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().int().min(1).max(20)),
}


export default validator;
export { allIbDField }

