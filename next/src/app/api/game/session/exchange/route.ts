import createHandler from "@/lib/handler";
import gameValidator from "@/lib/validators/game.validator";
import gameSessionServices from "@/lib/services/gameSession.service";

const POST = createHandler({
    requireAuth: false,
    validationSchema: gameValidator.exchangeCode,
    options: {
        service: gameSessionServices.exchange,
    },
});

export { POST };
