import { MatchOrderBuilderModel } from "./match-order-builder-model";
import { OptionsModel } from "./options-model";
import { IAppRestorableData } from "./app-restorable-data";
import { autoinject, observable } from "aurelia-framework";
import { WebSocketsHelper } from "./web-sockets-helper";
import { WebSocketMessageKind } from "./web-socket-message";
import { MatchModel, GameHost1MatchModel, GameHost2MatchModel } from "./match-model";
import { CommonData } from "./common-data";
import { IMatch } from "./match";
import { GameHost } from "./game-host";

@autoinject
export class AppModel {

    matchModel: MatchModel;
    matchFoundCallback: Function = () => { };

    constructor(
        public matchOrderBuilderModel: MatchOrderBuilderModel,
        public optionsModel: OptionsModel,
        private commonData: CommonData,
        private webSocketsHelper: WebSocketsHelper) {

        this.loadRestorableData();
        this.matchOrderBuilderModel.applyOptions(this.optionsModel);
        this.webSocketsHelper.ongoingWebSocket$.subscribe(a => {
            if (a.kind == WebSocketMessageKind.Match) {
                const match = <IMatch>a.data;
                const game = this.commonData.gamesMap[match.game];
                if (game) {
                    if (game.gameHost == GameHost.GameHost1) {
                        this.matchModel = new GameHost1MatchModel(this.commonData, a.data);
                        this.matchFoundCallback();
                    }
                    else if (game.gameHost == GameHost.GameHost2) {
                        this.matchModel = new GameHost2MatchModel(this.commonData, a.data);
                        this.matchFoundCallback();
                    }
                    else {
                        throw new Error('Missed game host.');
                    }
                }
                else {
                    throw new Error('Unsupported game.');
                }
            }
        });
    }

    saveRestorableData() {
        const restorableData = <IAppRestorableData>{
            matchOrderBuilder: this.matchOrderBuilderModel.getRestorableData(),
            options: this.optionsModel.getRestorableData()
        };
        //todo abstract localStorage
        localStorage.setItem('restorable-data', JSON.stringify(restorableData));
    }

    private loadRestorableData() {
        let restorableData: IAppRestorableData;
        //todo abstract localStorage
        const json = localStorage.getItem('restorable-data');
        if (json) {
            try {
                restorableData = <IAppRestorableData>JSON.parse(json);
            }
            catch (e) {
                console.warn(e);
            }
        }
        if (restorableData) {
            try {
                this.matchOrderBuilderModel.setRestorableData(restorableData.matchOrderBuilder);
                this.optionsModel.setRestorableData(restorableData.options);
            }
            catch (e) {
                console.warn(e);
            }
        }
    }
}
