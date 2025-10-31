import createServiceOnlyHandler from '@/lib/handler';
import userValidator from '@/lib/validators/user.validator';
import userService from '@/lib/services/user.service';

const PATCH = createServiceOnlyHandler({
    validationSchema: userValidator.updateAssignment,
    requireAuth: true,
    options: {
        service: userService.updateRoles,
    }
});

export { PATCH };
