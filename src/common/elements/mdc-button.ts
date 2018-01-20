import { autoinject, containerless, bindable } from 'aurelia-framework';
import * as Mdc from "material-components-web";

enum MdcButtonKind {
    Default = '',
    Raised = 'raised',
    Unelevated = 'unelevated',
    Stroked = 'stroked'
}

@autoinject
export class MdcButton {
    @bindable kind = MdcButtonKind.Default;
    @bindable disabled = false;
    private cssClass = '';
    private btn: HTMLButtonElement;
    private mdcRipple: any;

    attached() {
        this.mdcRipple = new Mdc.ripple.MDCRipple(this.btn);
        this.applyDisabled();
    }

    detached() {
        this.mdcRipple.destroy();
    }

    disabledChanged() {
        this.applyDisabled();
    }

    kindChanged() {
        if (this.kind == MdcButtonKind.Default) {
            this.cssClass = '';
            return;
        }
        this.cssClass = 'mdc-button--' + this.kind;
    }

    private applyDisabled() {
        if (!this.btn) {
            return;
        }
        if (this.disabled) {
            this.btn.setAttribute('disabled', 'disabled');
        }
        else {
            this.btn.removeAttribute('disabled');
        }
    }
}
