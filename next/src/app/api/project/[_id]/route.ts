export const dynamic = "force-dynamic";

import createHandler from '@/lib/handler';
import projectValidator from '@/lib/validators/project.validator';
import projectServices from '@/lib/services/project.service';

const PATCH = createHandler({
    validationSchema: projectValidator.update,
    dataUnifier: (req, parsedData) => {
        const urlTokens = (new URL(req.url)).pathname.split("/");

        return {
            _id: urlTokens[urlTokens.length - 1],
            ...parsedData,
        }
    },
    requireAuth: true,
    options: {
        service: projectServices.update,
    }
});

const DELETE = createHandler({
    validationSchema: projectValidator.remove,
    dataUnifier: (req, _parsedData) => {
        const urlTokens = (new URL(req.url)).pathname.split("/");

        return {
            _id: urlTokens[urlTokens.length - 1],
        }
    },
    requireAuth: true,
    options: {
        service: projectServices.remove,
    }
});

export { PATCH, DELETE };
