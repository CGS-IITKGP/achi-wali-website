import { ICookieOptions } from "../types/response.types";
import getEnvVariable from "./envVariable";

const getJWTCookieOptions = (): ICookieOptions => {
    const httpsEnforced = getEnvVariable("HTTPS_ENFORCED", false);

    const options: ICookieOptions = {
        maxAge: 2700000,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/"
    };

    if (httpsEnforced === "true" || process.env.NODE_ENV === "production") {
        options.secure = true;
    }

    return options;
};

const cookieOptions = {
    get jwt(): ICookieOptions {
        return getJWTCookieOptions();
    },
};

export { cookieOptions };
