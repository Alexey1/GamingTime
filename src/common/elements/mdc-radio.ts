import { autoinject, bindable, bindingMode } from 'aurelia-framework';
import * as Mdc from "material-components-web";
import { Utility } from '../../utility';

@autoinject
export class MdcRadio {
    @bindable name: string;
    @bindable model: any;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) checked: any;
    radioWrapperElement: HTMLElement;
    constructor(private element: Element, private utility: Utility) {
    }

    attached() {
        const mdcFormField = new Mdc.formField.MDCFormField(this.element);
        mdcFormField.input = new Mdc.radio.MDCRadio(this.radioWrapperElement);
    }
}
