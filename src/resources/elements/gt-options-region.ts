import { bindable, autoinject } from 'aurelia-framework';
import { OptionsModel } from '../../data/options-model';
import { CommonData } from '../../data/common-data';

@autoinject
export class GtOptionsRegion {
    constructor(private optionsModel: OptionsModel, private commonData: CommonData) {
    }

    private resetGameRegions() {
        this.optionsModel.isResetGameRegionsRequested = true;
    }
}
