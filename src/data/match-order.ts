import { GameServersFilter } from "./game-servers-filter";

export class MatchOrder {
    region: string;
    game: string;
    mode: string;
    playersCount: number;
    gameServersFilter = new GameServersFilter();
}
