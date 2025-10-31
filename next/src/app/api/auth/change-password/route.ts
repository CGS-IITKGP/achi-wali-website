export const dynamic = "force-dynamic";

import createServiceOnlyHandler from '@/lib/handler';
import authValidator from '@/lib/validators/auth.validator';
import authService from '@/lib/services/auth.service';

const PATCH = createServiceOnlyHandler({
    validationSchema: authValidator.changePassword,
    requireAuth: true,
    options: {
        service: authService.changePassword,
    }
});

export { PATCH };
