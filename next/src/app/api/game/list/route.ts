import createHandler from "@/lib/handler";
import gameValidator from "@/lib/validators/game.validator";
import gameListServices from "@/lib/services/gameList.service";

const GET = createHandler({
    requireAuth: false,
    validationSchema: gameValidator.getGameList,
    options: {
        service: gameListServices.get,
    },
});

export { GET };
