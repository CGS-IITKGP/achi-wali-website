export const dynamic = "force-dynamic";

import createServiceOnlyHandler from '@/lib/handler';
import teamValidator from '@/lib/validators/team.validator';
import teamServices from '@/lib/services/team.service';

const PATCH = createServiceOnlyHandler({
    validationSchema: teamValidator.editMembers,
    dataUnifier: (req, parsedData) => {
        const urlTokens = (new URL(req.url)).pathname.split("/");

        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action');

        return {
            _id: urlTokens[urlTokens.length - 2],
            target: action,
            ...parsedData,
        }
    },
    requireAuth: true,
    options: {
        service: teamServices.addMembers,
    }
});

export { PATCH };
