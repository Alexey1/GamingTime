import { bindable, autoinject } from 'aurelia-framework';
import { MatchModel } from '../../data/match-model';
import * as Rx from "rxjs";
import { IRxSchedulerProvider } from '../../rx-scheduler-provider';
import { Utility } from '../../utility';

@autoinject
export class GtMatchDetails {
    @bindable close: Function;
    @bindable model: MatchModel;

    private readonly freshMatchPeriod = 2 * 60 * 1000;
    private readonly checkPeriod = 60 * 1000;
    private isMatchFresh = true;
    private timeAgoText = '';

    private modelChangedChangedRxHandler: Function = () => { };

    constructor(private utility: Utility, private rxSchedulerProvider: IRxSchedulerProvider) {
        const modelChange$ = Rx.Observable.fromEventPattern<undefined>(h => { this.modelChangedChangedRxHandler = h }, () => { this.modelChangedChangedRxHandler = () => { } }).publish().refCount();
        this.getState$(modelChange$, this.freshMatchPeriod, this.checkPeriod)
            .subscribe(a => {
                this.isMatchFresh = a.isMatchFresh;
                this.timeAgoText = this.utility.getTimeAgoText(a.millisecondsAgo);
            })
    }

    modelChanged() {
        this.modelChangedChangedRxHandler();
    }

    private getState$(
        modelChange$: Rx.Observable<undefined>,
        freshMatchPeriod: number,
        checkPeriod: number) {
        return modelChange$
            .timestamp(this.rxSchedulerProvider.default)
            .map(a => Rx.Observable.timer(freshMatchPeriod, this.rxSchedulerProvider.default)
                .concat(Rx.Observable.interval(checkPeriod, this.rxSchedulerProvider.default))
                .timestamp(this.rxSchedulerProvider.default)
                .map(b => ({
                    isMatchFresh: false,
                    millisecondsAgo: b.timestamp - a.timestamp
                }))
                .startWith({
                    isMatchFresh: true,
                    millisecondsAgo: 0
                }))
            .switch();
    }
}
