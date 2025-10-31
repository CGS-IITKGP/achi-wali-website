export const dynamic = "force-dynamic";

import createServiceOnlyHandler from "@/lib/handler";
import authValidator from "@/lib/validators/auth.validator";
import authService from "@/lib/services/auth.service";
import { cookieOptions } from "@/lib/utils/cookie";
import { SESSION_COOKIE_NAME } from "@/lib/config/constants";

const POST = createServiceOnlyHandler({
  requireAuth: false,
  validationSchema: authValidator.signIn,
  options: {
    service: authService.signIn,
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
      };
    },
  },
});

export { POST };
