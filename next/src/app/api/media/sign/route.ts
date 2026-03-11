import createHandler from '@/lib/handler';
import mediaValidator from '@/lib/validators/media.validator';
import mediaServices from '@/lib/services/media.service';

const POST = createHandler({
    validationSchema: mediaValidator.sign,
    requireAuth: true,
    options: {
        service: mediaServices.sign,
    }
});

export { POST };
