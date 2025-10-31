import { EUserRole } from "./domain.types";

export enum SuccessResponseCodesEnum {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
}

export enum FailedResponseCodeEnum {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    TOO_MANY_REQUESTS = 429,
}

export enum FailureResponseCodesEnum {
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503,
}

export const DefaultFailedResponseMessagesEnum: Record<
    FailedResponseCodeEnum,
    string
> = {
    [FailedResponseCodeEnum.BAD_REQUEST]: "Bad Request.",
    [FailedResponseCodeEnum.UNAUTHORIZED]: "Unauthorized.",
    [FailedResponseCodeEnum.FORBIDDEN]: "Forbidden.",
    [FailedResponseCodeEnum.NOT_FOUND]: "Not Found.",
    [FailedResponseCodeEnum.CONFLICT]: "Conflict.",
    [FailedResponseCodeEnum.TOO_MANY_REQUESTS]: "Too Many Requests.",
};

export interface ICookieOptions {
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
    path?: string;
}

export interface ISetCookie {
    name: string;
    value: string;
    options: ICookieOptions;
}

export interface JWTPayload {
    [key: string]: string | EUserRole[];
    _id: string;
    roles: EUserRole[];
}
