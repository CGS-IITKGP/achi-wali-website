import ResponseHandler from '@/lib/utils/responseHandler';
import validator from '@/lib/validators/core.validator';
import authService from '@/lib/services/auth.service';
import {
    ESECs,
    FailedResponseCodeEnum,
    FailureResponseCodesEnum,
    HandlerConfig,
    IServiceResolve,
    ISession,
    SuccessResponseCodesEnum,
    ServiceSignature,
} from '@/lib/types/index.types';
import log, { ELogLevel } from './utils/logger';
import { NextRequest, NextResponse } from 'next/server';
import AppError from './utils/error';
import { safeJSONStringify } from './utils/serialize';


function createHandler<
    IbD extends object,
    SDIn extends object,
    SDOut extends object,
    ObD extends object,
    RequireAuth extends boolean
>(
    {
        requireAuth,
        dataUnifier,
        validationSchema,
        options: config,
    }: HandlerConfig<IbD, SDIn, SDOut, ObD, RequireAuth>
) {
    return async (req: NextRequest): Promise<NextResponse> => {
        let session: ISession | null = null;
        let data: IbD;
        const responseHandler = new ResponseHandler();

        const defaultDataUnifier = (
            _req: NextRequest,
            parsedBody: object,
        ): IbD => {
            return parsedBody as IbD;
        }
        const defaultOnSuccess = (sData: SDOut) => {
            return {
                responseData: sData,
                cookies: [],
                redirectUrl: undefined,
            };
        }

        try {
            session = await authService.extractSession(req);
            if (requireAuth) {
                if (!session) {
                    return responseHandler.sendFailed(
                        FailedResponseCodeEnum.UNAUTHORIZED,
                        "Authentication required."
                    );
                }
            }

            const parsedBody = await parseRequestBodyMiddleware(req);
            if (parsedBody instanceof NextResponse) return parsedBody;

            const rawData = (dataUnifier ?? defaultDataUnifier)(req, parsedBody);

            const validationResult = await validator(rawData, validationSchema);
            if (!validationResult.success) {
                return responseHandler.sendFailed(
                    FailedResponseCodeEnum.BAD_REQUEST,
                    validationResult.error
                );
            }

            data = validationResult.data;

            if (config.controller) {
                return await config.controller(req, data, session);
            }
            else {
                let serviceResponse: IServiceResolve<SDOut>;

                if (requireAuth) {
                    const service = config.service as ServiceSignature<SDIn, SDOut, true>;
                    serviceResponse = await service(data as unknown as SDIn, session as ISession);
                }
                else {
                    const service = config.service as ServiceSignature<SDIn, SDOut, false>;
                    serviceResponse = await service(data as unknown as SDIn, session);
                }

                if (!serviceResponse.success) {
                    return serviceErrorCodeHandler(
                        responseHandler,
                        serviceResponse.errorCode,
                        serviceResponse.errorMessage
                    );
                }

                const {
                    responseData,
                    cookies,
                    redirectUrl
                } = (config.onSuccess ?? defaultOnSuccess)(
                    serviceResponse.data
                );

                if (cookies) {
                    cookies.forEach((cookie) =>
                        responseHandler.setCookie(
                            cookie.name,
                            cookie.value,
                            cookie.options
                        )
                    );
                }

                if (redirectUrl) {
                    responseHandler.setRedirect(redirectUrl);
                }

                return responseHandler.sendSuccess(
                    config.successCode ?? SuccessResponseCodesEnum.OK,
                    responseData
                );
            }
        } catch (error) {
            return errorHandler(req, error);
        }
    };
}

const parseRequestBodyMiddleware = async (req: NextRequest): Promise<object | NextResponse> => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
        const rawBody = await req.text();
        if (!rawBody) {
            return new ResponseHandler().sendFailed(
                FailedResponseCodeEnum.BAD_REQUEST,
                "Request body is missing."
            );
        }

        try {
            return JSON.parse(rawBody);
        } catch (_error) {
            return new ResponseHandler().sendFailed(
                FailedResponseCodeEnum.BAD_REQUEST,
                "Invalid JSON format."
            );
        }
    }

    return {};
}

const serviceErrorCodeHandler = (
    responseHandler: ResponseHandler,
    errorCode: ESECs,
    errorMessage?: string,
): NextResponse => {
    switch (errorCode) {
        case ESECs.USER_NOT_FOUND:
        case ESECs.SIGNUP_REQUEST_NOT_FOUND:
        case ESECs.TEAM_NOT_FOUND:
        case ESECs.PROJECT_NOT_FOUND:
        case ESECs.BLOG_NOT_FOUND:
        case ESECs.SLUG_NOT_FOUND:
        case ESECs.FEATURED_NOT_FOUND:
        case ESECs.MEDIA_NOT_FOUND:
            return responseHandler.sendFailed(FailedResponseCodeEnum.NOT_FOUND, errorMessage);

        case ESECs.INVALID_CREDENTIALS:
        case ESECs.INVALID_JWT:
        case ESECs.INVALID_OTP:
        case ESECs.UNAUTHORIZED:
        case ESECs.GOOGLE_OAUTH_FAILED:
            return responseHandler.sendFailed(FailedResponseCodeEnum.UNAUTHORIZED, errorMessage);

        case ESECs.FORBIDDEN:
        case ESECs.NOT_TEAM_MEMBER:
            return responseHandler.sendFailed(FailedResponseCodeEnum.FORBIDDEN, errorMessage);

        case ESECs.EMAIL_TAKEN:
        case ESECs.TEAM_NAME_TAKEN:
        case ESECs.SLUG_ALREADY_IN_USE:
        case ESECs.ALREADY_FEATURED:
        case ESECs.MEDIA_PUBLIC_ID_ALREADY_EXISTS:
            return responseHandler.sendFailed(FailedResponseCodeEnum.CONFLICT, errorMessage);

        case ESECs.TOO_MANY_REQUESTS:
            return responseHandler.sendFailed(FailedResponseCodeEnum.TOO_MANY_REQUESTS, errorMessage);

        default:
            log(ELogLevel.ERROR, `Unhandled ESECs code in ServiceErrorCodeHandler: ${ESECs[errorCode]} (${errorCode})`);
            throw new AppError("Unhandled service client error code.", { errorCode });
    }
};

const errorHandler = (req: NextRequest, error: unknown): NextResponse => {
    if (error instanceof AppError) {
        log(ELogLevel.ERROR, 'AppError: While resolving API response.', {
            url: req.url,
            body: req.body,
            error: {
                name: error.name,
                message: error.message,
                peek: safeJSONStringify((error as AppError).peek),
                cause: error.cause,
                stack: error.stack,
            }
        });
    }
    else if (error instanceof Error) {
        log(ELogLevel.ERROR, 'GenericError: While resolving API response.', {
            url: req.url,
            body: req.body,
            error: {
                name: error.name,
                message: error.message,
                cause: error.cause,
                stack: error.stack,
            }
        });
    }
    else {
        log(ELogLevel.ERROR, 'AppError: While resolving API response.', {
            url: req.url,
            body: req.body,
            error: safeJSONStringify(error),
        });
    }

    return new ResponseHandler().sendFailure(
        FailureResponseCodesEnum.INTERNAL_SERVER_ERROR
    );
}

export default createHandler;
