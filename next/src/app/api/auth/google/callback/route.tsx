export const dynamic = "force-dynamic";

import createHandler from "@/lib/handler";
import authValidator from "@/lib/validators/auth.validator";
import authService from "@/lib/services/auth.service";
import { SESSION_COOKIE_NAME } from "@/lib/config/constants";
import { cookieOptions } from "@/lib/utils/cookie";
import getEnvVariable from "@/lib/utils/envVariable";

const GET = createHandler({
    validationSchema: authValidator.googleOAuth,
    dataUnifier: (req) => {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");
        const scope = searchParams.get("scope");

        return {
            code,
            scope,
        };
    },
    requireAuth: false,
    options: {
        service: authService.googleOAuth,
        onSuccess: (sDOut) => {
            return {
                responseData: {},
                cookies: [
                    {
                        name: SESSION_COOKIE_NAME,
                        value: sDOut.token,
                        options: cookieOptions.jwt,
                    },
                ],
                redirectUrl: getEnvVariable(
                    "GOOGLE_OAUTH_SUCCESSFUL_REDIRECT",
                    true
                ),
            };
        },
    },
});

export { GET };
