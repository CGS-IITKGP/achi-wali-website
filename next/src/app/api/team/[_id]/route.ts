export const dynamic = "force-dynamic";

import createServiceOnlyHandler from '@/lib/handler';
import teamValidator from '@/lib/validators/team.validator';
import teamServices from '@/lib/services/team.service';
import { APIControl } from '@/lib/types/api.types';

const GET = createServiceOnlyHandler({
    validationSchema: teamValidator.get,
    dataUnifier: (req, _parsedData) => {
        const urlTokens = (new URL(req.url)).pathname.split("/");

        return {
            target: APIControl.Team.Get.Target.ONE,
            _id: urlTokens[urlTokens.length - 1]
        }
    },
    requireAuth: false,
    options: {
        service: teamServices.get,
    }
});


const PATCH = createServiceOnlyHandler({
    validationSchema: teamValidator.update,
    requireAuth: true,
    dataUnifier: (req, parsedData) => {
        const urlTokens = (new URL(req.url)).pathname.split("/");

        return {
            _id: urlTokens[urlTokens.length - 1],
            ...parsedData,
        }
    },
    options: {
        service: teamServices.update,
    }
});

const DELETE = createServiceOnlyHandler({
    validationSchema: teamValidator.remove,
    dataUnifier: (req, _parsedData) => {
        const urlTokens = (new URL(req.url)).pathname.split("/");

        return {
            _id: urlTokens[-1]
        }
    },
    requireAuth: true,
    options: {
        service: teamServices.remove,
    }
});

export { GET, PATCH, DELETE };
