import { AppTab } from "./data/app-tab";
import { EventAggregator } from "aurelia-event-aggregator";
import { AppEvent } from "./data/app-event";
import { autoinject, observable, Container, computedFrom } from "aurelia-framework";
import { CommonData } from "./data/common-data";
import { Game } from "./data/game";
import { MatchOrder } from "./data/match-order";
import { AppModel } from "./data/app-model";
import { GtMatchOrderBuilder } from "./resources/elements/gt-match-order-builder";
import { ShortcutName, ShortcutHelper } from "./shortcuts";
import { Utility } from "./utility";

@autoinject
export class App {
    @observable private activeTab: AppTab
    private isLoaded = false;
    private model: AppModel;
    private _matchOrderBuilderCmnt: GtMatchOrderBuilder;

    constructor(
        private element: Element,
        private utility: Utility,
        private commonData: CommonData,
        private container: Container,
        private shortcutHelper: ShortcutHelper,
        private evtAgg: EventAggregator) {
        this.commonData.load().subscribe(null, null, () => {
            this.model = container.get(AppModel);
            this.model.matchFoundCallback = this.onMatchFound.bind(this);
            this.isLoaded = true;
            this.activeTab = AppTab.MatchOrderBuilder;
        });

        window.addEventListener('beforeunload', () => {
            this.model.saveRestorableData();
        });
        this.evtAgg.subscribe(AppEvent.Shortcut, (shortcutName: ShortcutName) => {
            if (shortcutName == ShortcutName.OpenMatchOrderBuilder) {
                this.activeTab = AppTab.MatchOrderBuilder;
            }
        });
    }

    attached() {
        this.element.addEventListener('keydown',
            (evt: KeyboardEvent) => this.shortcutHelper.detectShortcut(evt));
        this.utility.setTheme(this.model.optionsModel.theme);
    }

    activeTabChanged(newTab, oldTab) {
        if (oldTab == AppTab.Options) {
            this.model.matchOrderBuilderModel.applyOptions(this.model.optionsModel);
            this.model.optionsModel.resetRequests();
        }
    }

    private onMatchFound() {
        this.activeTab = AppTab.MatchDetails;
        this.matchOrderBuilderCmnt.dismissMatchSearch();
    }

    private toggleOptions() {
        if (this.activeTab != AppTab.Options) {
            this.activeTab = AppTab.Options;
        }
        else {
            this.activeTab = AppTab.MatchOrderBuilder;
        }
    }

    private toggleMatchDetails() {
        if (this.activeTab != AppTab.MatchDetails) {
            this.activeTab = AppTab.MatchDetails;
        }
        else {
            this.activeTab = AppTab.MatchOrderBuilder;
        }
    }

    @computedFrom('_matchOrderBuilderCmnt')
    get matchOrderBuilderCmnt() {
        return this._matchOrderBuilderCmnt;
    }
    //matchOrderBuilderCmnt is set to null when if.bind is false
    //need to preserve the reference
    set matchOrderBuilderCmnt(value) {
        if (value) {
            this._matchOrderBuilderCmnt = value;
        }
    }
}
