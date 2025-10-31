export const dynamic = "force-dynamic";

import createServiceOnlyHandler from '@/lib/handler';
import authValidator from '@/lib/validators/auth.validator';
import authService from '@/lib/services/auth.service';

const POST = createServiceOnlyHandler({
    validationSchema: authValidator.signUp,
    requireAuth: false,
    options: {
        service: authService.signUp,
    }
});

export { POST };
