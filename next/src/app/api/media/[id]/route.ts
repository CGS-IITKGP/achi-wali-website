export const dynamic = "force-dynamic";

import createHandler from '@/lib/handler';
import mediaValidator from '@/lib/validators/media.validator';
import mediaServices from '@/lib/services/media.service';

const DELETE = createHandler({
    validationSchema: mediaValidator.remove,
    dataUnifier: (req, _parsedData) => {
        const urlTokens = (new URL(req.url)).pathname.split("/");

        return {
            _id: urlTokens[urlTokens.length - 1],
        }
    },
    requireAuth: true,
    options: {
        service: mediaServices.remove
    }
});

export { DELETE };
