import createServiceOnlyHandler from "@/lib/handler";
import gameValidator from "@/lib/validators/game.validator";
import gameProfileServices from "@/lib/services/gameProfile.service";

const POST = createServiceOnlyHandler({
    validationSchema: gameValidator.upsertProfile,
    requireAuth: true,
    options: {
        service: gameProfileServices.upsert,
    },
});

const GET = createServiceOnlyHandler({
    validationSchema: gameValidator.getProfile,
    requireAuth: true,
    options: {
        service: gameProfileServices.get,
    },
});

export { POST, GET };
