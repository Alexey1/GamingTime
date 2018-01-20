import { autoinject, bindable } from 'aurelia-framework';
import * as Mdc from "material-components-web";
import { Utility } from '../../utility';

@autoinject
export class MdcCheckbox {
    private checkboxWrapperEl: Element;
    private mdcCheckbox: any;
    @bindable checked: boolean;
    @bindable disabled = false;

    constructor(private element: Element, private utility: Utility) {
    }

    attached() {
        const mdcFormField = new Mdc.formField.MDCFormField(this.element);
        this.mdcCheckbox = mdcFormField.input = new Mdc.checkbox.MDCCheckbox(this.checkboxWrapperEl);
        this.mdcCheckbox.disabled = this.disabled;
    }

    disabledChanged() {
        if (!this.mdcCheckbox) {
            return;
        }
        this.mdcCheckbox.disabled = this.disabled;
    }
}
