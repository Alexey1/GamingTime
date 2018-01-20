import { CommonData } from "./common-data";
import { Game } from "./game";
import { NameTitle } from "./name-title";
import { Theme } from "./theme";
import { autoinject } from "aurelia-framework";
import { IOptionsRestorableData } from "./options-restorable-data";

@autoinject
export class OptionsModel {
    games: Game[];
    region: NameTitle;
    theme: Theme;
    isResetGameRegionsRequested = false;

    constructor(private commonData: CommonData) {
        this.region = this.commonData.regions[0];
        this.theme = Theme.Light;
        this.games = [...this.commonData.games];
    }

    resetRequests() {
        this.isResetGameRegionsRequested = false;
    }

    addGame(game: Game) {
        if (this.games.includes(game)) {
            throw new Error('Game is already added.');
        }
        this.games = this.commonData.games.filter(g => this.games.includes(g) || g == game);
    }

    removeGame(game: Game) {
        const gameIndex = this.games.indexOf(game);
        if (gameIndex < 0) {
            throw new Error('Game is already removed.');
        }
        this.games.splice(gameIndex, 1);
    }

    getRestorableData() {
        return <IOptionsRestorableData>{
            games: this.games.map(g => g.name),
            region: this.region.name,
            theme: this.theme
        }
    }

    setRestorableData(restorableData: IOptionsRestorableData) {
        this.games = this.commonData.games.filter(g => restorableData.games.includes(g.name));
        if (this.games.length == 0) {
            this.games = this.commonData.games;
            console.warn('No games were restored, load all.')
        }
        else if (this.games.length < restorableData.games.length) {
            console.warn('Some of the games were not restored.')
        }
        this.region = this.commonData.regionsMap[restorableData.region];
        if (!this.region) {
            this.region = this.commonData.regions[0];
            console.warn('Region was not restored.');
        }
        this.theme = Theme[Object.keys(Theme).find(k => Theme[k] == restorableData.theme)];
        if (!this.theme) {
            this.theme = Theme.Light;
            console.warn('Theme was not restored.');
        }
    }
}
