import { bindable, autoinject, computedFrom } from 'aurelia-framework';
import { MdcDialog } from "../../common/elements/mdc-dialog";
import { GtList } from '../../common/elements/gt-list';
import { Game } from '../../data/game';
import * as Rx from "rxjs";
import { RequestStatus } from '../../data/request-status';
import { IWebApi } from '../../data/web-api';
import { I18N } from 'aurelia-i18n';
import { GtMatchOrder } from './gt-match-order';
import { MatchOrder } from '../../data/match-order';
import { CommonData } from '../../data/common-data';
import { EventAggregator } from 'aurelia-event-aggregator';
import { AppEvent } from '../../data/app-event';
import { MatchOrderBuilderModel } from '../../data/match-order-builder-model';
import { NameTitle } from '../../data/name-title';
import { MatchOrderModel } from '../../data/match-order-model';
import { ShortcutName } from '../../shortcuts';

@autoinject
export class GtMatchOrderBuilder {
    @bindable openServersFilter: Function;

    private matchSearchStatus = MatchSearchStatus.None;
    private btnSearchMatchText: string;
    private matchOrderLimitDialog: MdcDialog;
    private gamesListCmnt: GtList;
    private matchOrderCmnt: GtMatchOrder;

    private rxBtnSearchMatchClickCallback: any;
    private btnSearchMatchTextStart: string;
    private btnSearchMatchTextCancel: string;

    constructor(
        private model: MatchOrderBuilderModel,
        private commonData: CommonData,
        private webApi: IWebApi,
        private evtAgg: EventAggregator,
        private i18n: I18N) {
        this.btnSearchMatchTextStart = this.i18n.tr('gt-mobl.btn-search-match-text-start');
        this.btnSearchMatchTextCancel = this.i18n.tr('gt-mobl.btn-search-match-text-cancel');
        this.btnSearchMatchText = this.btnSearchMatchTextStart;

        const click$ = Rx.Observable
            .fromEventPattern(handler => {
                this.rxBtnSearchMatchClickCallback = handler;
            }).publish();
        click$.connect();
        this.getStartCancelMatchOrder$(click$)
            .subscribe(status => {
                this.matchSearchStatus = status;
                switch (status) {
                    case MatchSearchStatus.Initializing: {
                        break;
                    }
                    case MatchSearchStatus.Searching: {
                        this.btnSearchMatchText = this.btnSearchMatchTextCancel;
                        break;
                    }
                    case MatchSearchStatus.Error: {
                        this.btnSearchMatchText = this.btnSearchMatchTextCancel;
                        break;
                    }
                    case MatchSearchStatus.None: {
                        this.btnSearchMatchText = this.btnSearchMatchTextStart;
                        break;
                    }
                }
            });
        this.evtAgg.subscribe(AppEvent.Shortcut, (shortcutName: ShortcutName) => {
            switch (shortcutName) {
                case ShortcutName.AddMatchOrder:
                    this.addMatchOrder();
                    break;
                case ShortcutName.ClearMatchOrderList:
                    this.model.matchOrderModelList = [];
                    break;
                case ShortcutName.SearchMatch:
                    this.btnSearchMatchClick();
                    break;
                case ShortcutName.CancelMatchSearch:
                    this.btnSearchMatchClick();
                    break;
                case ShortcutName.SaveMatchOrderList:
                    this.saveUserMatchOrderList();
                    break;
                case ShortcutName.RestoreMatchOrderList:
                    this.restoreUserMatchOrderList();
                    break;
            }
        });
    }

    dismissMatchSearch() {
        this.btnSearchMatchClick();
    }

    private addMatchOrder() {
        if (this.matchOrderCmnt.disabled) {
            return;
        }
        if (!this.model.addMatchOrder()) {
            this.matchOrderLimitDialog.open();
        }
    }

    private btnSearchMatchClick() {
        if (!this.searchMatchDisabled) {
            this.rxBtnSearchMatchClickCallback();
        }
    }

    private saveUserMatchOrderList() {
        this.model.saveMatchOrderList();
    }

    private restoreUserMatchOrderList() {
        this.model.restoreMatchOrderList();
    }

    private clearMatchOrderList() {
        this.model.matchOrderModelList = [];
    }

    private onRegionChanging(region: NameTitle) {
        this.model.setGameRegion(region);
    }

    @computedFrom('model.matchOrderModelList.length', 'matchSearchStatus')
    private get clearMatchOrderListDisabled() {
        return this.model.matchOrderModelList.length == 0 || this.matchSearchStatus != MatchSearchStatus.None;
    }

    @computedFrom('clearMatchOrderListDisabled')
    private get clearMatchOrderListDisabledText() {
        if (this.matchSearchStatus != MatchSearchStatus.None) {
            return this.i18n.tr('gt-mobl.icon-clear-match-order-list-disabled-text-searching');
        }
        if (this.model.matchOrderModelList.length == 0) {
            return this.i18n.tr('gt-mobl.icon-clear-match-order-list-disabled-text-empty');
        }
        return '';
    }

    @computedFrom('model.userMatchOrderModelList.length', 'matchSearchStatus')
    private get restoreMatchOrderListDisabled() {
        return this.model.userMatchOrderModelList.length == 0 || this.matchSearchStatus != MatchSearchStatus.None;
    }

    @computedFrom('model.userMatchOrderModelList.length', 'matchSearchStatus')
    private get restoreMatchOrderListDisabledText() {
        if (this.matchSearchStatus != MatchSearchStatus.None) {
            return this.i18n.tr('gt-mobl.icon-restore-match-order-list-disabled-text-searching');
        }
        if (this.model.userMatchOrderModelList.length == 0) {
            return this.i18n.tr('gt-mobl.icon-restore-match-order-list-disabled-text-empty');
        }
        return '';
    }

    @computedFrom('model.matchOrderModelList.length')
    private get saveMatchOrderListDisabled() {
        return this.model.matchOrderModelList.length == 0;
    }

    @computedFrom('model.matchOrderModelList.length')
    private get searchMatchTooltipDisabled() {
        return this.model.matchOrderModelList.length == 0;
    }

    @computedFrom('model.matchOrderModelList.length', 'matchSearchStatus')
    private get searchMatchDisabled() {
        return this.model.matchOrderModelList.length == 0 ||
            this.matchSearchStatus == MatchSearchStatus.Initializing;
    }

    private getStartCancelMatchOrder$(click$: Rx.Observable<{}>) {
        const startClick$ = click$.filter((_: any, i: number) => i % 2 == 0);
        const cancelClick$ = click$.filter((_: any, i: number) => i % 2 != 0);

        const getOrderMatchStatus$ = () =>
            this.model.submitMatchOrderList()
                .mapTo(MatchSearchStatus.Searching)
                .startWith(MatchSearchStatus.Initializing)
                .catch(error => Rx.Observable.of(MatchSearchStatus.Error));

        const cancelMatchOrder$ = cancelClick$
            .mergeMap(a => this.webApi.cancelMatchOrder()
                .mapTo(RequestStatus.Success)
                .startWith(RequestStatus.InProgress)
                .catch(error => Rx.Observable.of(RequestStatus.Error)))
            .startWith(RequestStatus.Success)
            .publish().refCount();

        return startClick$
            .withLatestFrom(cancelMatchOrder$,
            (_, a) => {
                if (a == RequestStatus.Success) {
                    return getOrderMatchStatus$();
                }
                else if (a == RequestStatus.InProgress) {
                    return cancelMatchOrder$
                        .take(1)
                        .map(a => {
                            if (a == RequestStatus.Success) {
                                return getOrderMatchStatus$().skip(1);
                            }
                            else if (a == RequestStatus.Error) {
                                return Rx.Observable.of(MatchSearchStatus.Error);
                            }
                            throw new Error();
                        })
                        .mergeAll()
                        .startWith(MatchSearchStatus.Initializing)
                }
                else if (a == RequestStatus.Error) {
                    return this.webApi.cancelMatchOrder()
                        .mergeMapTo(getOrderMatchStatus$().skip(1))
                        .startWith(MatchSearchStatus.Initializing)
                        .catch(error => Rx.Observable.of(MatchSearchStatus.Error));
                }
                throw new Error();
            })
            .mergeAll()
            .merge(cancelClick$.mapTo(MatchSearchStatus.None));
    }
}

enum MatchSearchStatus {
    None = 'none',
    Initializing = 'initializing',
    Searching = 'searching',
    ConnectionErrorRetrying = 'connection-error-retrying',
    Error = 'error'
}
