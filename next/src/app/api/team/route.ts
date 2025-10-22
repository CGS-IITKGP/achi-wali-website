import createServiceOnlyHandler from '@/lib/handler';
import teamValidator from '@/lib/validators/team.validator';
import teamServices from '@/lib/services/team.service';
import { APIControl } from '@/lib/types/api.types';

const GET = createServiceOnlyHandler({
    validationSchema: teamValidator.get,
    dataUnifier: (_req, _parsedData, _params) => {
        return {
            target: APIControl.Team.Get.Target.ALL
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
