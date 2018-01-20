import { autoinject } from "aurelia-framework";
import { IWebApi } from "./web-api";
import * as Rx from "rxjs";
import { Game } from "./game";
import { NameTitle } from "./name-title";

@autoinject
export class CommonData {
    games: Game[];
    gamesMap: { [index: string]: Game } = {};
    regions: NameTitle[];
    regionsMap = {};
    readonly matchOrderListMaxCount = 3; //8
    readonly gameServersFilterMaxCount = 4; //8
    readonly availableGameServersFilterMaxCount = 20; //15
    readonly matchOrderModesMaxCount = 50;

    constructor(
        private webApi: IWebApi) {
        this.regions = [
            'World',
            'Africa',
            'Asia',
            'Australia',
            'Europe',
            'North America',
            'South America'
        ].map(r => new NameTitle(r.toLowerCase().replace(/ /g, '-'), r));
        this.regions.forEach(r => this.regionsMap[r.name] = r);
    }

    load() {
        let rx = this.webApi.getGames();
        rx.subscribe(games => {
            this.games = games;
            this.games.forEach(g => this.gamesMap[g.name] = g);
        });
        return rx.ignoreElements();
    }
}
