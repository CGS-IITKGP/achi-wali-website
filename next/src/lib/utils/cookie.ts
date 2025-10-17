import { ICookieOptions } from "../types/response.types";
import getEnvVariable from "./envVariable";

const cookieOptions = {
    jwt: (() => {
        const httpsEnforced = getEnvVariable("HTTPS_ENFORCED", true);

        const options: ICookieOptions = {
            maxAge: 2700000,
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
        };

        if (httpsEnforced === "true") {
            options.secure = true;
        }

        return options;
    })(),
};

export { cookieOptions };
