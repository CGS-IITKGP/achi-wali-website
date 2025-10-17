interface IResponseAffirmative {
    action: true;
    data: object;
    statusCode: number;
}

interface IResponseNegative {
    action: false;
    message: string;
    errors: object;
    statusCode: number;
}

interface IResponseFailure {
    action: null;
    statusCode: number;
}

export type IResponse =
    | IResponseAffirmative
    | IResponseNegative
    | IResponseFailure

