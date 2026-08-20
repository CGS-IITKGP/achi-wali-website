import createHandler from "@/lib/handler";
import gameValidator from "@/lib/validators/game.validator";
import scoreServices from "@/lib/services/score.service";

const POST = createHandler({
    requireAuth: false,
    validationSchema: gameValidator.createScore,
    options: {
        service: scoreServices.create,
    },
});

const GET = createHandler({
    requireAuth: false,
    validationSchema: gameValidator.getScore,
    dataUnifier: (req) => {
        const { searchParams } = new URL(req.url);
        return {
            target: searchParams.get("target"),
            gameId: searchParams.get("gameId"),
        };
    },
    options: {
        service: scoreServices.get,
    },
});

export { POST, GET };
