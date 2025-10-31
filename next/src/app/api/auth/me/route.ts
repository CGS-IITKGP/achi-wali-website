export const dynamic = "force-dynamic";

import createHandler from '@/lib/handler';
import authValidator from '@/lib/validators/auth.validator';
import authService from '@/lib/services/auth.service';


const GET = createHandler({
    requireAuth: true,
    validationSchema: authValidator.me,
    options: {
        service: authService.me,
    }
});

export { GET };
