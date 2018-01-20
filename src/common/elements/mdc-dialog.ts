import * as Mdc from "material-components-web";
import { autoinject, bindable } from "aurelia-framework";

@autoinject
export class MdcDialog {
    private mdcDialog: any;
    private surfaceElement: HTMLElement;
    @bindable accept: any = () => { };
    @bindable cancel: any = () => { };
    @bindable isFooterVisible = true;

    constructor(private element: Element) {
    }

    attached() {
        this.mdcDialog = new Mdc.dialog.MDCDialog(this.element);
        this.mdcDialog.listen('MDCDialog:accept', this.accept);
        this.mdcDialog.listen('MDCDialog:cancel', this.cancel);
    }

    detached() {
        this.mdcDialog.unlisten('MDCDialog:accept', this.accept);
        this.mdcDialog.unlisten('MDCDialog:cancel', this.cancel);
    }

    open() {
        this.mdcDialog.show();
    }
}
