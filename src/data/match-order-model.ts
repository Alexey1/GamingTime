import { observable, autoinject, reset } from "aurelia-framework";
import { GameServersFilter } from "./game-servers-filter";
import { CommonData } from "./common-data";
import { Game } from "./game";
import { NameTitle } from "./name-title";
import { MatchOrder } from "./match-order";

@autoinject
export class MatchOrderModel {
    @observable game: Game;
    @observable region: NameTitle;
    mode: string;
    playersCount: number | null = null;
    gameServersFilter = new GameServersFilter();
    gameChangedCallback = (model: MatchOrderModel) => { };

    constructor(private commonData: CommonData) {
    }

    gameChanged() {
        this.region = this.commonData.regions[0];
        this.gameChangedCallback(this);
        this.clear();
    }

    regionChanged() {
        this.clear();
    }

    copy() {
        const copy = new MatchOrderModel(this.commonData);
        copy.game = this.game;
        copy.region = this.region;
        copy.mode = this.mode;
        copy.playersCount = this.playersCount;
        copy.gameServersFilter.kind = this.gameServersFilter.kind;
        copy.gameServersFilter.gameServers = [...this.gameServersFilter.gameServers];
        return copy;
    }

    getMatchOrder() {
        const matchOrder = new MatchOrder();
        matchOrder.game = this.game.name;
        matchOrder.region = this.region.name;
        matchOrder.mode = this.mode;
        matchOrder.playersCount = this.playersCount;
        matchOrder.gameServersFilter = this.gameServersFilter;
        return matchOrder;
    }

    setMatchOrder(matchOrder: MatchOrder) {
        this.game = this.commonData.gamesMap[matchOrder.game];
        this.region = this.commonData.regionsMap[matchOrder.region];
        if (!this.game || !this.region) {
            throw new Error('Match order has wrong game or region.');
        }
        this.mode = matchOrder.mode;
        this.playersCount = matchOrder.playersCount;
        this.gameServersFilter = matchOrder.gameServersFilter;
    }

    adjust() {
        const minPlayersCount = 2;
        let playersCountText = '';
        if (this.playersCount) {
            playersCountText = this.playersCount + '';
        }
        this.playersCount = Math.max(minPlayersCount, Number.parseInt(playersCountText) || minPlayersCount);
    }

    private clear() {
        this.mode = '';
        this.playersCount = null;
        this.gameServersFilter = new GameServersFilter();
    }
}
