import scoreRepository from "@/lib/database/repos/score.repo";
import {
    ServiceSignature,
    SDIn,
    SDOut,
} from "@/lib/types/index.types";

const get: ServiceSignature<
    SDIn.GameList.Get,
    SDOut.GameList.Get,
    false
> = async () => {
    const gameIds = await scoreRepository.getDistinctGameIds();

    return {
        success: true,
        data: gameIds,
    };
};

const gameListServices = {
    get,
};

export default gameListServices;
