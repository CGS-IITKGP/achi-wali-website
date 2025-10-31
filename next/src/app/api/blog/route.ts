export const dynamic = "force-dynamic";

import createHandler from '@/lib/handler';
import blogValidator from '@/lib/validators/blog.validator';
import blogServices from '@/lib/services/blog.service';
import { APIControl } from '@/lib/types/api.types';

const GET = createHandler({
    validationSchema: blogValidator.get,
    dataUnifier: (req) => {
        const { searchParams } = new URL(req.url);
        const target = searchParams.get('target');

        if (target === APIControl.Blog.Get.Target.MY) {
            return { target }
        }

        return {
            target: APIControl.Blog.Get.Target.ALL
        }
    },
    requireAuth: false,
    options: {
        service: blogServices.get,
    }
});

const POST = createHandler({
    validationSchema: blogValidator.create,
    requireAuth: true,
    options: {
        service: blogServices.create,
    }
});


export { GET, POST };

