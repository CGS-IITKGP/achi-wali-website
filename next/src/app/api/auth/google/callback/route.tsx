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
    onSuccess: (sDOut, req) => {
      const { searchParams } = new URL(req.url);
      const state = searchParams.get("state");
      
      return {
        responseData: {},
        cookies: [
          {
            name: SESSION_COOKIE_NAME,
            value: sDOut.token,
            options: cookieOptions.jwt,
          },
        ],
        redirectUrl: new URL(state || "/", req.url).toString(),
      };
    },
  },
});

export { GET };
