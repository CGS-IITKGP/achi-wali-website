export const dynamic = "force-dynamic";

import createServiceOnlyHandler from '@/lib/handler';
import userValidator from '@/lib/validators/user.validator';
import userService from '@/lib/services/user.service';

const PATCH = createServiceOnlyHandler({
    validationSchema: userValidator.updateTeam,
    requireAuth: true,
    options: {
        service: userService.updateTeam,
    }
});

export { PATCH };
