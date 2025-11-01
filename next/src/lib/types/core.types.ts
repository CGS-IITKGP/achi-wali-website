import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { Types } from "mongoose";
import { EUserRole, ESECs, SuccessResponseCodesEnum, ISetCookie } from "./index.types";

export enum ELogLevel {
    FATAL = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4,
}

export interface ISession {
    userId: Types.ObjectId;
    userEmail: string;
    userRoles: EUserRole[]
}

export interface IEmail {
    to: string;
    subject: string;
    text: string;
    html: string;
}

export type ControllerSignature<IbD> = (
    req: NextRequest,
    parsedData: IbD,
    session: ISession | null,
) => Promise<NextResponse>;

export type IServiceResolve<SDOut> =
    | {
        success: true,
        data: SDOut
    }
    | {
        success: false;
        errorCode: ESECs;
        errorMessage?: string;
    }

export type ServiceSignature<
    SDIn,
    SDOut,
    RequireSession extends boolean = false,
> = (data: SDIn, session: RequireSession extends true ? ISession : ISession | null)
        => Promise<IServiceResolve<SDOut>>;

export type ControllerConfig<IbD> = {
    controller: ControllerSignature<IbD>;
    service?: never;
    successCode?: never;
    onSuccess?: never;
}

export type ServiceConfig<SDIn, SDOut, ObD, RequireAuth extends boolean> = {
    service: ServiceSignature<SDIn, SDOut, RequireAuth>;
    successCode?: SuccessResponseCodesEnum;
    onSuccess?: (sDOut: SDOut) => {
        responseData: ObD;
        cookies?: ISetCookie[];
    };
    controller?: never;
};

export type HandlerConfig<
    IbD,
    SDIn,
    SDOut,
    ObD,
    RequireAuth extends boolean = false
> = {
    requireAuth: RequireAuth;
    dataUnifier?: (req: NextRequest, parsedBody: object) => unknown;
    validationSchema: ZodSchema<IbD>;
    options:
    | ControllerConfig<IbD>
    | ServiceConfig<SDIn, SDOut, ObD, RequireAuth>;
}

export interface PaginationOptions {
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
