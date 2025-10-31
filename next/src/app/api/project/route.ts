export const dynamic = "force-dynamic";

import createHandler from '@/lib/handler';
import projectValidator from '@/lib/validators/project.validator';
import projectServices from '@/lib/services/project.service';

const GET = createHandler({
    validationSchema: projectValidator.get,
    dataUnifier: (req) => {
        const { searchParams } = new URL(req.url);
        const target = searchParams.get('target');
        const portfolio = searchParams.get("portfolio");

        return {
            target: target ?? "all",
            portfolio: portfolio ?? "any"
        }
    },
    requireAuth: false,
    options: {
        service: projectServices.get,
    }
});

const POST = createHandler({
    validationSchema: projectValidator.create,
    requireAuth: true,
    options: {
        service: projectServices.create,
    }
});


export { GET, POST };
