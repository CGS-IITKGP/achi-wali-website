import createHandler from '@/lib/handler';
import featuredValidator from '@/lib/validators/featured.validator';
import featuredServices from '@/lib/services/featured.service';

const GET = createHandler({
    validationSchema: featuredValidator.get,
    dataUnifier: (req) => {
        const { searchParams } = new URL(req.url);
        const target = searchParams.get('target');

        return {
            target
        }
    },
    requireAuth: false,
    options: {
        service: featuredServices.get,
    }
});

const POST = createHandler({
    validationSchema: featuredValidator.create,
    requireAuth: true,
    options: {
        service: featuredServices.create,
    }
});


export { GET, POST };
