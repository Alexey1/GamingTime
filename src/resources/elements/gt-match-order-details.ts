import { bindable, autoinject, computedFrom } from "aurelia-framework";
import { MatchOrder } from "../../data/match-order";
import { CommonData } from "../../data/common-data";
import { MatchOrderModel } from "../../data/match-order-model";
import { Game } from "../../data/game";
import { MatchOrderBuilderModel } from "../../data/match-order-builder-model";
import { I18N } from "aurelia-i18n";
import { EventAggregator } from "aurelia-event-aggregator";
import { AppEvent } from "../../data/app-event";
import { ShortcutName } from "../../shortcuts";

@autoinject
export class GtMatchOrderDetails {
    @bindable model: MatchOrderModel;
    @bindable matchOrderModificationDisabled = false;
    @bindable isActive = false;

    constructor(
        private commonData: CommonData,
        private matchOrderBuilderModel: MatchOrderBuilderModel,
        private i18n: I18N,
        private evtAgg: EventAggregator) {
        this.evtAgg.subscribe(AppEvent.Shortcut, (a: ShortcutName) => {
            if (this.isActive) {
                if (a == ShortcutName.EditMatchOrder) {
                    this.editMatchOrder();
                }
                if (a == ShortcutName.RemoveMatchOrder) {
                    this.removeMatchOrder();
                }
            }
        });
    }

    @computedFrom('matchOrderModificationDisabled', 'matchOrderBuilderModel.games')
    private get editMatchOrderDisabled() {
        return this.matchOrderModificationDisabled || !this.matchOrderBuilderModel.games.includes(this.model.game);
    }

    @computedFrom('editMatchOrderDisabled')
    private get editMatchOrderDisabledText() {
        if (this.matchOrderModificationDisabled) {
            return this.i18n.tr('gt-mod.icon-edit-disabled-text-searching')
        }
        if (!this.matchOrderBuilderModel.games.includes(this.model.game)) {
            return this.i18n.tr('gt-mod.icon-edit-disabled-text-unavailable-game');
        }
        return '';
    }

    private editMatchOrder() {
        if (!this.editMatchOrderDisabled) {
            this.matchOrderBuilderModel.setMatchOrderCopy(this.model);
        }
    }

    private removeMatchOrder() {
        if (!this.matchOrderModificationDisabled) {
            this.matchOrderBuilderModel.removeMatchOrder(this.model);
        }
    }
}
