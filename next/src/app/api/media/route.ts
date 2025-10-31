export const dynamic = "force-dynamic";

import createHandler from '@/lib/handler';
import mediaValidator from '@/lib/validators/media.validator';
import mediaServices from '@/lib/services/media.service';

const GET = createHandler({
    validationSchema: mediaValidator.get,
    requireAuth: true,
    options: {
        service: mediaServices.get,
    }
});

const POST = createHandler({
    validationSchema: mediaValidator.create,
    requireAuth: true,
    options: {
        service: mediaServices.create,
    }
});


export { GET, POST };
