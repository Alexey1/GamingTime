import { bindable, autoinject, observable, BindingEngine, computedFrom } from 'aurelia-framework';
import { Game } from '../../data/game';
import * as Rx from "rxjs";
import { IWebApi } from '../../data/web-api';
import { RequestStatus } from '../../data/request-status';
import { Utility } from "../../utility"
import { NameTitle } from '../../data/name-title';
import { MatchOrder } from '../../data/match-order';
import { MatchOrderModel } from '../../data/match-order-model';
import { EventAggregator } from 'aurelia-event-aggregator';
import { AppEvent } from '../../data/app-event';
import { ShortcutName } from '../../shortcuts';
import { I18N } from 'aurelia-i18n';
import { CommonData } from '../../data/common-data';

@autoinject
export class GtMatchOrder {
    @bindable model: MatchOrderModel;
    @bindable regionChanging: Function;
    @bindable openServersFilter: Function;
    disabled = false;
    private modes: string[] = [];
    private gameChangedRxHandler: Function = () => { };
    private regionChangedRxHandler: Function = () => { };
    private modesRequestedRxHandler: Function = () => { };
    private isLoadingModes = false;

    constructor(
        private commonData: CommonData,
        private webApi: IWebApi,
        private evtAgg: EventAggregator,
        private i18n: I18N,
        private bindingEngine: BindingEngine) {
        const game$ = Rx.Observable.fromEventPattern<Game>(h => { this.gameChangedRxHandler = h }, () => { this.gameChangedRxHandler = () => { } }).publish().refCount();
        const region$ = Rx.Observable.fromEventPattern<string>(h => { this.regionChangedRxHandler = h }, () => { this.regionChangedRxHandler = () => { } }).publish().refCount();
        const modeRequest$ = Rx.Observable.fromEventPattern<string>(h => { this.modesRequestedRxHandler = h }, () => { this.modesRequestedRxHandler = () => { } }).publish().refCount();

        this.createModes$(game$, region$, modeRequest$)
            .subscribe(a => {
                if (a.status == RequestStatus.Error) {
                    //this.isLoadingModesError = true;
                    this.isLoadingModes = false;
                    this.modes = [];
                }
                if (a.status == RequestStatus.InProgress) {
                    //this.isLoadingModesError = false;
                    this.isLoadingModes = true;
                    this.modes = [];
                }
                if (a.status == RequestStatus.Success) {
                    //this.isLoadingModesError = false;
                    this.isLoadingModes = false;
                    this.modes = a.modes.filter(mode => mode.toLowerCase().startsWith(a.modePart.toLowerCase()));
                }
            });
        this.evtAgg.subscribe(AppEvent.Shortcut, (shortcutName: ShortcutName) => {
            if (shortcutName == ShortcutName.OpenServersFilter) {
                this.openServersFilter();
            }
        });
    }

    bind() {
        this.bindingEngine.expressionObserver(this, 'model.game').subscribe(this.gameChanged.bind(this));
        this.bindingEngine.expressionObserver(this, 'model.region').subscribe(this.regionChanged.bind(this));
        this.bindingEngine.expressionObserver(this, 'model.mode').subscribe(this.modeChanged.bind(this));
        this.gameChanged();
        this.regionChanged();
        this.disabled = !this.model.mode;
    }

    gameChanged() {
        this.gameChangedRxHandler(this.model.game);
    }

    regionChanged() {
        this.regionChangedRxHandler(this.model.region.name);
    }

    modeChanged() {
        this.disabled = !this.model.mode;
    }

    @computedFrom('disabled')
    get disabledText() {
        return this.i18n.tr('gt-mog.disabled-text');
    }

    private onOpenServersFilter() {
        if (!this.disabled) {
            this.openServersFilter();
        }
    }

    private modesRequested(modeRequest: string) {
        this.modesRequestedRxHandler(modeRequest);
    }

    protected createModes$(
        game$: Rx.Observable<Game>,
        region$: Rx.Observable<string>,
        modeRequest$: Rx.Observable<string>) {

        const gr$ = game$.combineLatest(region$, (game, region) => ({ game, region })).share();

        return modeRequest$
            .withLatestFrom(gr$)
            .groupBy(([_, gr]) => gr, ([modePart, _]) => modePart)
            .map(modePartGroup$ => modePartGroup$
                .exhaustMap(_ => this.webApi.getModes(modePartGroup$.key.game.name, modePartGroup$.key.region)
                    .map(modes => ({ status: RequestStatus.Success, modes }))
                    .startWith({ status: RequestStatus.InProgress, modes: <string[]>[] }))
                .catch(error => Rx.Observable.of({ status: RequestStatus.Error, modes: <string[]>[] })
                    .concat(Rx.Observable.throw(error).map(a => <{ status: RequestStatus, modes: string[] }>a)))
                .retry()
                .takeWhileInclusive(({ status, modes }) => status != RequestStatus.Success)
                .combineLatest(modePartGroup$, (result, modePart) => ({ status: result.status, modes: result.modes, modePart }))
                .withLatestFrom(gr$.startWith(modePartGroup$.key), (modesResult, currentGame) => ({ modesResult, currentGame }))
                .filter(a => a.currentGame == modePartGroup$.key)
                .map(a => a.modesResult)
            )
            .mergeAll();
    }
}
