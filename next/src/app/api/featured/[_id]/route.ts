import createHandler from '@/lib/handler';
import featuredValidator from '@/lib/validators/featured.validator';
import featuredServices from '@/lib/services/featured.service';

const DELETE = createHandler({
    validationSchema: featuredValidator.remove,
    dataUnifier: (req, _parsedData) => {
        const urlTokens = (new URL(req.url)).pathname.split("/");

        return {
            _id: urlTokens[-1]
        }
    },
    requireAuth: true,
    options: {
        service: featuredServices.remove,
    }
});

export { DELETE };
