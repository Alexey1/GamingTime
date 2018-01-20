import { FrameworkConfiguration } from 'aurelia-framework';

export function configure(config: FrameworkConfiguration) {
    config.globalResources([
        './elements/mdc-textfield',
        './elements/mdc-radio',
        './elements/mdc-checkbox',
        './elements/mdc-dialog',
        './elements/mdc-icon',
        './elements/mdc-button',
        './elements/gt-autocomplete',
        './elements/gt-list',
        './elements/gt-loading-icon.html',
        './elements/gt-select',
        './elements/gt-surface.html',
        './elements/gt-tooltip',
        './elements/gt-tab-header.html',
        './elements/gt-busy-icon.html'
    ]);
}
