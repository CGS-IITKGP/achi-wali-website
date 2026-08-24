import createHandler from "@/lib/handler";
import gameValidator from "@/lib/validators/game.validator";
import scoreServices from "@/lib/services/score.service";
import { NextResponse } from "next/server";

// OPTIONS preflight handler — required so browsers don't get a 405 and block
// the actual POST/GET before it is sent (cross-origin preflight for JSON content-type).
export function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS,POST",
            "Access-Control-Allow-Headers": "Content-Type, Accept, X-Requested-With",
            "Access-Control-Max-Age": "86400",
        },
    });
}

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
