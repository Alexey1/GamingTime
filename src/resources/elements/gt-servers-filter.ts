import { bindable, autoinject } from 'aurelia-framework';
import { MatchOrderModel } from '../../data/match-order-model';
import { GameServer } from '../../data/game-server';
import { GameServersFilterKind } from '../../data/game-servers-filter-kind';
import { IWebApi } from '../../data/web-api';
import { CommonData } from '../../data/common-data';
import * as Rx from "rxjs";
import { RequestStatus } from '../../data/request-status';
import { RxNotificationKind } from '../../data/rx-notification-kind';
import { MdcDialog } from '../../common/elements/mdc-dialog';
import { EventAggregator } from 'aurelia-event-aggregator';
import { AppEvent } from '../../data/app-event';
import { ShortcutName } from '../../shortcuts';
import { GtList } from '../../common/elements/gt-list';

class GameServerListItem {
    constructor(public gameServer: GameServer, public isSelected: boolean = false) {
    }
}

@autoinject
export class GtServersFilter {
    @bindable close = () => { };
    @bindable model: MatchOrderModel;

    private availableGameServers: GameServerListItem[] = [];
    private serversRequestedRxHandler: Function = () => { };
    private serverLogin: string;
    private isLblMoreVisible = false;
    private isLoading = false;
    private limitDialog: MdcDialog;
    private lstAvailableServersCmnt: GtList;
    private selectedGameServersCmnt: GtList;

    constructor(
        private webApi: IWebApi,
        private commonData: CommonData,
        private evtAgg: EventAggregator) {

        const serverLogin$ = Rx.Observable.fromEventPattern<string>(h => { this.serversRequestedRxHandler = h }, () => { this.serversRequestedRxHandler = () => { } }).publish().refCount();
        this.createGameServers$(serverLogin$)
            .subscribe(a => {
                if (a.status == RequestStatus.Error) {
                    //this.isLoadingModesError = true;
                    //this.isLoadingModes = false;
                    this.isLblMoreVisible = false;
                    this.isLoading = false;
                    this.availableGameServers = [];
                }
                if (a.status == RequestStatus.InProgress) {
                    //this.isLoadingModesError = false;
                    //this.isLoadingModes = true;
                    this.isLblMoreVisible = false;
                    this.isLoading = true;
                    this.availableGameServers = [];
                }
                if (a.status == RequestStatus.Success) {
                    //this.isLoadingModesError = false;
                    //this.isLoadingModes = false;
                    this.isLoading = false;
                    if (a.servers.length > this.commonData.availableGameServersFilterMaxCount) {
                        a.servers.splice(this.commonData.availableGameServersFilterMaxCount, a.servers.length);
                        this.isLblMoreVisible = true;
                    }
                    else {
                        this.isLblMoreVisible = false;
                    }
                    this.availableGameServers = this.getGameServerListItems(a.servers);
                    this.model.gameServersFilter.gameServers.forEach(selectedServer => {
                        const index = this.availableGameServers.findIndex(item => item.gameServer.login == selectedServer.login);
                        if (index >= 0) {
                            this.availableGameServers[index].isSelected = true;
                            this.availableGameServers[index].gameServer.title = selectedServer.title
                        }
                    });
                }
            });

        this.evtAgg.subscribe(AppEvent.Shortcut, (shortcutName: ShortcutName) => {
            switch (shortcutName) {
                case ShortcutName.ToggleGameServerSelection:
                    this.toggleServerSelection(this.lstAvailableServersCmnt.selectedItem);
                    break;
                case ShortcutName.RemoveSelectedGameServer:
                    this.removeSelectedServer(this.selectedGameServersCmnt.selectedItem);
                    break;
                case ShortcutName.ClearSelectedGameServers:
                    this.clearSelectedServers();
                    break;
            }
        });
    }

    private createGameServers$(serverLogin$: Rx.Observable<string>) {
        return serverLogin$
            .switchMap(serverLogin => {
                return this.webApi.getGameServers(this.model.game.name, this.model.mode, serverLogin, this.model.region.name)
                    .materialize()
                    .filter(a => a.kind != RxNotificationKind.Completed)
                    .map(a => {
                        if (a.kind == RxNotificationKind.Error) {
                            return { status: RequestStatus.Error, servers: [] };
                        }
                        if (a.kind == RxNotificationKind.Next) {
                            return { status: RequestStatus.Success, servers: a.value };
                        }
                        throw new Error();
                    })
                    .startWith({ status: RequestStatus.InProgress, servers: [] })
            });
    }

    private getGameServerListItems(gameServers: GameServer[]) {
        return gameServers.map(gs => new GameServerListItem(gs));
    }

    private serversRequested(serverLoginPart: string) {
        //if value is undefined serverLogin$ doesn't work
        if (serverLoginPart == undefined) {
            serverLoginPart = '';
        }
        this.serversRequestedRxHandler(serverLoginPart);
    }

    private removeSelectedServer(gameServer: GameServer) {
        const availableGameServerItem = this.availableGameServers.find(gsi => gsi.gameServer.login == gameServer.login);
        if (availableGameServerItem != null) {
            availableGameServerItem.isSelected = false;
        }
        const index = this.model.gameServersFilter.gameServers.findIndex(gs => gs.login == gameServer.login);
        if (index >= 0) {
            this.model.gameServersFilter.gameServers.splice(index, 1);
        }
    }

    private onClose() {
        this.close();
        this.serverLogin = '';
        this.availableGameServers = [];
        this.isLblMoreVisible = false;
    }

    private clearSelectedServers() {
        const selectedServerLogins = this.model.gameServersFilter.gameServers.map(gs => gs.login);
        const selectedAvailableServers = this.availableGameServers.filter(gs => selectedServerLogins.includes(gs.gameServer.login));
        selectedAvailableServers.forEach(gs => gs.isSelected = false);
        this.model.gameServersFilter.gameServers = [];
    }

    private toggleServerSelection(gameServerItem: GameServerListItem) {
        gameServerItem.isSelected = !gameServerItem.isSelected;
        if (gameServerItem.isSelected) {
            if (this.model.gameServersFilter.gameServers.length >= this.commonData.gameServersFilterMaxCount) {
                gameServerItem.isSelected = false;
                this.limitDialog.open();
                return false;
            }
            else {
                this.model.gameServersFilter.gameServers.push(gameServerItem.gameServer);
            }
        }
        else {
            const index = this.model.gameServersFilter.gameServers.findIndex(gs => gs.login == gameServerItem.gameServer.login);
            if (index >= 0) {
                this.model.gameServersFilter.gameServers.splice(index, 1);
            }
        }
        return true;
    }
}
