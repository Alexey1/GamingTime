import { autoinject, bindable } from 'aurelia-framework';
import * as Mdc from "material-components-web";

@autoinject
export class MdcTextfield {
    @bindable placeholder: string;
    @bindable value: string;
    @bindable inputId: string;
    private inputElement: HTMLInputElement;

    constructor(private element: Element) {
    }

    attached() {
        void new Mdc.textField.MDCTextField(this.element);
    }

    focus() {
        this.inputElement.focus();
    }
}
