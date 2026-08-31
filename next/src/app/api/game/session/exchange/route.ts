import createHandler from "@/lib/handler";
import gameValidator from "@/lib/validators/game.validator";
import gameSessionServices from "@/lib/services/gameSession.service";
import { NextResponse } from "next/server";

// OPTIONS preflight handler — required for cross-origin JSON POST preflights.
export function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST",
            "Access-Control-Allow-Headers": "Content-Type, Accept, X-Requested-With",
            "Access-Control-Max-Age": "86400",
        },
    });
}

const POST = createHandler({
    requireAuth: false,
    validationSchema: gameValidator.exchangeCode,
    options: {
        service: gameSessionServices.exchange,
    },
});

export { POST };
