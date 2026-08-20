import GenericRepository from "./generic.repo";
import GameUserModel from "@/lib/database/models/gameUser.model";
import {
    IGameUser,
    GameUserCreateType,
    GameUserUpdateType,
} from "@/lib/types/index.types";

class GameUserRepository extends GenericRepository<
    IGameUser,
    GameUserCreateType,
    GameUserUpdateType
> {
    constructor() {
        super(GameUserModel);
    }
}

const gameUserRepository = new GameUserRepository();

export default gameUserRepository;
