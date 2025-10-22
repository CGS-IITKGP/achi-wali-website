import createServiceOnlyHandler from '@/lib/handler';
import teamValidator from '@/lib/validators/team.validator';
import teamServices from '@/lib/services/team.service';

const PATCH = createServiceOnlyHandler({
    validationSchema: teamValidator.addMembers,
    dataUnifier: (req, parsedData) => {
        const urlTokens = (new URL(req.url)).pathname.split("/");

        return {
            _id: urlTokens[-2],
            ...parsedData,
        }
    },
    requireAuth: true,
    options: {
        service: teamServices.addMembers,
    }
});

export { PATCH };
