import { bindable, autoinject, observable, BindingEngine } from 'aurelia-framework';
import { Theme } from '../../data/theme';
import { OptionsModel } from '../../data/options-model';
import { NameTitle } from '../../data/name-title';
import { Utility } from '../../utility';

@autoinject
export class GtOptionsTheme {
    themes: NameTitle[] = [];

    constructor(
        private optionsModel: OptionsModel,
        private utility: Utility,
        private bindingEngine: BindingEngine) {
        this.themes.push(new NameTitle(Theme.Light));
        this.themes.push(new NameTitle(Theme.Dark));
        this.bindingEngine.propertyObserver(this.optionsModel, 'theme').subscribe(() => {
            this.utility.setTheme(this.optionsModel.theme);
        });
    }
}
