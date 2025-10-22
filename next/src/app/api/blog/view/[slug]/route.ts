import createHandler from '@/lib/handler';
import blogValidator from '@/lib/validators/blog.validator';
import blogServices from '@/lib/services/blog.service';
import { APIControl } from '@/lib/types/api.types';

const GET = createHandler({
    validationSchema: blogValidator.get,
    dataUnifier: (req, _parsedBody) => {
        const urlTokens = (new URL(req.url)).pathname.split("/");

        return {
            target: APIControl.Blog.Get.Target.BY_SLUG,
            slug: urlTokens[-1]
        }
    },
    requireAuth: false,
    options: {
        service: blogServices.get,
    }
});

export { GET };
