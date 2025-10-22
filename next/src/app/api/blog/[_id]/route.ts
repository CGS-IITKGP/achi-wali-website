import createHandler from '@/lib/handler';
import blogValidator from '@/lib/validators/blog.validator';
import blogService from '@/lib/services/project.service';

const PATCH = createHandler({
    validationSchema: blogValidator.update,
    dataUnifier: (req, parsedData) => {
        const urlTokens = (new URL(req.url)).pathname.split("/");

        return {
            _id: urlTokens[-1],
            ...parsedData,
        }
    },
    requireAuth: true,
    options: {
        service: blogService.update,
    }
});

const DELETE = createHandler({
    validationSchema: blogValidator.remove,
    dataUnifier: (req, _parsedData) => {
        const urlTokens = (new URL(req.url)).pathname.split("/");

        return {
            _id: urlTokens[-1]
        }
    },
    requireAuth: true,
    options: {
        service: blogService.remove,
    }
});

export { PATCH, DELETE };
