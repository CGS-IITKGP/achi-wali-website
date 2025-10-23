import { NextResponse } from 'next/server';
import { serialize } from 'cookie';
import {
    ICookieOptions,
    SuccessResponseCodesEnum,
    FailedResponseCodeEnum,
    FailureResponseCodesEnum,
    DefaultFailedResponseMessagesEnum,
} from '@/lib/types/index.types';

class ResponseHandler {
    private data?: object;
    private errors?: object;
    private message?: string;
    private statusCode:
        | SuccessResponseCodesEnum
        | FailedResponseCodeEnum
        | FailureResponseCodesEnum;
    private action: boolean | null;
    private cookies: Record<
        string,
        {
            value: string;
            options?: ICookieOptions;
        }
    > = {};

    constructor() {
        this.statusCode = FailureResponseCodesEnum.INTERNAL_SERVER_ERROR;
        this.message = 'Internal Server Error!';
        this.action = null;
        this.cookies = {};
    }

    public sendSuccess(statusCode: SuccessResponseCodesEnum, data: object = {}) {
        this.statusCode = statusCode;
        this.data = data;
        this.action = true;
        return this.build();
    }

    public sendFailed(
        statusCode: FailedResponseCodeEnum,
        messageOrErrors?: string | object,
        errors?: object
    ) {
        this.statusCode = statusCode;

        if (typeof messageOrErrors === 'string') {
            this.message = messageOrErrors.trim();
            this.errors = errors;
        } else {
            this.message =
                DefaultFailedResponseMessagesEnum[statusCode] ?? 'Client Error.';
            this.errors = messageOrErrors;
        }

        this.action = false;

        return this.build();
    }

    public sendFailure(statusCode: FailureResponseCodesEnum) {
        this.statusCode = statusCode;
        this.action = null;
        return this.build();
    }

    public setCookie(name: string, value: string, options?: ICookieOptions) {
        this.cookies[name] = { value, options };
        return this;
    }

    private build() {
        const payload: Record<string, unknown> = {
            action: this.action,
        };

        if (this.action === true && this.data !== undefined) {
            payload.data = this.data;
        }

        if (this.action === false) {
            payload.message = this.message;

            if (this.errors && Object.keys(this.errors).length > 0) {
                payload.errors = this.errors;
            }
        }

        const cookieHeaders: string[] = [];
        for (const [name, { value, options }] of Object.entries(this.cookies)) {
            cookieHeaders.push(serialize(name, value, options));
        }

        const headers = new Headers();
        if (cookieHeaders.length > 0) {
            for (const cookie of cookieHeaders) {
                headers.append('Set-Cookie', cookie);
            }
        }

        return NextResponse.json(payload, {
            status: this.statusCode,
            headers,
        });
    }
}

export default ResponseHandler;
