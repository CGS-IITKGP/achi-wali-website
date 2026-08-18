import createHandler from "@/lib/handler";
import gameValidator from "@/lib/validators/game.validator";
import gameAuthServices from "@/lib/services/gameAuth.service";

const POST = createHandler({
    requireAuth: false,
    validationSchema: gameValidator.login,
    options: {
        service: gameAuthServices.login,
    },
});

export { POST };
