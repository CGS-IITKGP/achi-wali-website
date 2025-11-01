export const dynamic = "force-dynamic";

import createServiceOnlyHandler from '@/lib/handler';
import userValidator from '@/lib/validators/user.validator';
import userService from '@/lib/services/user.service';

const GET = createServiceOnlyHandler({
    validationSchema: userValidator.get,
    dataUnifier: (req) => {
        const { searchParams } = new URL(req.url);
        const target = searchParams.get('target');
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');

        return {
            target: target ?? "all",
            page,
            limit
        }
    },
    requireAuth: true,
    options: {
        service: userService.get,
    }
});

const PATCH = createServiceOnlyHandler({
    validationSchema: userValidator.update,
    requireAuth: true,
    options: {
        service: userService.update,
    }
});

const DELETE = createServiceOnlyHandler({
    validationSchema: userValidator.remove,
    requireAuth: true,
    options: {
        service: userService.remove,
    }
});

export { GET, PATCH, DELETE };
