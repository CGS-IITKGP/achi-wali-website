export const dynamic = "force-dynamic";

import createServiceOnlyHandler from '@/lib/handler';
import teamValidator from '@/lib/validators/team.validator';
import teamServices from '@/lib/services/team.service';

const GET = createServiceOnlyHandler({
    validationSchema: teamValidator.get,
    dataUnifier: (req, _parsedData) => {
        const { searchParams } = new URL(req.url);
        const target = searchParams.get('target');

        return {
            target
        }
    },
    requireAuth: false,
    options: {
        service: teamServices.get,
    }
});

const POST = createServiceOnlyHandler({
    validationSchema: teamValidator.create,
    requireAuth: true,
    options: {
        service: teamServices.create,
    }
});


export { GET, POST };
