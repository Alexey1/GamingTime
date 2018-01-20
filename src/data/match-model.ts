import { IMatch, IGameHost1Match, IGameHost2Match } from "./match";
import { CommonData } from "./common-data";
import { Game } from "./game";

export class MatchModel {
    game: Game;
    mode: string;
    serverId: string;
    serverTitle: string;
    usersCount: number;
    playersCount: number;

    constructor(private commonData: CommonData, match: IMatch) {
        this.game = this.commonData.gamesMap[match.game];
        this.mode = match.mode;
        this.serverId = match.serverId;
        this.serverTitle = match.serverTitle;
        this.usersCount = match.usersCount;
        this.playersCount = match.playersCount;
    }
}

export class GameHost1MatchModel extends MatchModel {
    serverLink: string;

    constructor(commonData: CommonData, match: IGameHost1Match) {
        super(commonData, match);
        this.serverLink = match.serverLink;
    }
}

export class GameHost2MatchModel extends MatchModel {
    serverIp: string;

    constructor(commonData: CommonData, match: IGameHost2Match) {
        super(commonData, match);
        this.serverIp = match.serverIp;
    }
}
