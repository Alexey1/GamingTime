import { autoinject } from "aurelia-framework";
import { CommonData } from "./common-data";
import { GameServersFilter } from "./game-servers-filter";
import { MatchOrderModel } from "./match-order-model";
import { Game } from "./game";
import { NameTitle } from "./name-title";
import { OptionsModel } from "./options-model";
import { IMatchOrderBuilderRestorableData } from "./match-order-builder-restorable-data";
import { MatchOrder } from "./match-order";
import { IWebApi } from "./web-api";
import * as Rx from "rxjs";

@autoinject
export class MatchOrderBuilderModel {
    matchOrderModelList: MatchOrderModel[] = [];
    games: Game[];
    matchOrderModel: MatchOrderModel;
    userMatchOrderModelList: MatchOrderModel[] = [];
    private gameRegions = new Map<Game, NameTitle>();
    private defaultRegion: NameTitle;

    constructor(
        private commonData: CommonData,
        private webApi: IWebApi) {
        this.defaultRegion = this.commonData.regions[0];
        this.games = this.commonData.games;
        this.matchOrderModel = new MatchOrderModel(this.commonData);
        this.matchOrderModel.gameChangedCallback = this.gameChangedCallback.bind(this);
        this.matchOrderModel.game = this.games[0];
    }

    addMatchOrder() {
        if (!this.matchOrderModel.mode) {
            throw new Error('Match order must have a mode.');
        }
        const relatedIndex = this.matchOrderModelList.findIndex(a =>
            a.game == this.matchOrderModel.game && a.mode == this.matchOrderModel.mode);
        if (relatedIndex >= 0) {
            this.matchOrderModelList.splice(relatedIndex, 1);
        }
        if (this.matchOrderModelList.length < this.commonData.matchOrderListMaxCount) {
            this.matchOrderModel.adjust();
            this.matchOrderModelList.push(this.matchOrderModel);
            const newMatchOrderModel = new MatchOrderModel(this.commonData);
            newMatchOrderModel.gameChangedCallback = this.gameChangedCallback.bind(this);
            newMatchOrderModel.game = this.matchOrderModel.game;
            this.matchOrderModel = newMatchOrderModel;
            return true;
        }
        return false;
    }

    setMatchOrderCopy(matchOrderModel: MatchOrderModel) {
        if (!this.games.includes(matchOrderModel.game)) {
            throw new Error('Match order game must be included.');
        }
        this.matchOrderModel = matchOrderModel.copy();
    }

    removeMatchOrder(matchOrderModel: MatchOrderModel) {
        const index = this.matchOrderModelList.findIndex(a => a == matchOrderModel);
        if (index < 0) {
            throw new Error('Match order does not exist.');
        }
        this.matchOrderModelList.splice(index, 1);
    }

    setGameRegion(region: NameTitle) {
        this.gameRegions.set(this.matchOrderModel.game, region);
    }

    applyOptions(optionsModel: OptionsModel) {
        if (optionsModel.isResetGameRegionsRequested) {
            this.gameRegions.clear();
            this.matchOrderModel.region = optionsModel.region;
        }
        this.defaultRegion = optionsModel.region;
        if (!optionsModel.games.includes(this.matchOrderModel.game)) {
            this.matchOrderModel.game = optionsModel.games[0];
        }
        this.games = [...optionsModel.games];
    }

    saveMatchOrderList() {
        this.userMatchOrderModelList = [...this.matchOrderModelList];
    }

    restoreMatchOrderList() {
        this.matchOrderModelList = [...this.userMatchOrderModelList];
    }

    getRestorableData() {
        const restorableGameRegions =
            Array.from(this.gameRegions.entries()).map(([game, region]) => {
                return ({ game: game.name, region: region.name });
            });
        return <IMatchOrderBuilderRestorableData>{
            game: this.matchOrderModel.game.name,
            gameRegions: restorableGameRegions,
            matchOrderList: this.matchOrderModelList.map(a => a.getMatchOrder()),
            userMatchOrderList: this.userMatchOrderModelList.map(a => a.getMatchOrder())
        };
    }

    setRestorableData(restorableData: IMatchOrderBuilderRestorableData) {
        restorableData.gameRegions.forEach(({ game, region }) => {
            const gameObj = this.commonData.gamesMap[game];
            const regionObj = this.commonData.regionsMap[region];
            if (gameObj && regionObj) {
                this.gameRegions.set(gameObj, regionObj);
            }
            else {
                console.warn('Game or region is not found.')
            }
        });
        this.matchOrderModel.game = this.commonData.games.find(g => g.name == restorableData.game) || this.commonData.games[0];
        this.matchOrderModel.region = this.getRegion(this.matchOrderModel.game);
        this.matchOrderModelList = this.getMatchOrderModelList(restorableData.matchOrderList);
        if (this.matchOrderModelList.length < restorableData.matchOrderList.length) {
            console.warn('Some of match orders were not restored.');
        }
        this.userMatchOrderModelList = this.getMatchOrderModelList(restorableData.userMatchOrderList);
        if (this.userMatchOrderModelList.length < restorableData.userMatchOrderList.length) {
            console.warn('Some of saved match orders were not restored.');
        }
    }

    submitMatchOrderList(): Rx.Observable<undefined> {
        return this.webApi.submitMatchOrder(this.matchOrderModelList.map(a => a.getMatchOrder()));
    }

    private getMatchOrderModelList(matchOrderList: MatchOrder[]) {
        return matchOrderList.map(a => {
            const model = new MatchOrderModel(this.commonData);
            try {
                model.setMatchOrder(a);
            }
            catch (e) {
                console.warn(e);
                return null;
            }
            return model;
        }).filter(m => m != null);
    }

    private getRegion(game: Game) {
        return this.gameRegions.get(game) || this.defaultRegion;
    }

    private gameChangedCallback(model: MatchOrderModel) {
        model.region = this.getRegion(model.game);
    }
}
