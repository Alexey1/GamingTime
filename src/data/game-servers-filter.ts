import { GameServersFilterKind } from "./game-servers-filter-kind";
import { GameServer } from "./game-server";

export class GameServersFilter {
    kind = GameServersFilterKind.Exclude;
    gameServers: GameServer[] = [];
}
