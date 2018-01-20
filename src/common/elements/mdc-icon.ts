import * as Mdc from "material-components-web";
import { autoinject, bindable, child } from "aurelia-framework";

@autoinject
export class MdcIcon {
    @bindable focusable = true;
    @bindable disabled = false;
    private mdcIcon: any;
    private iconElement: Element;

    constructor(private element: Element) {
    }

    attached() {
        this.mdcIcon = new Mdc.iconToggle.MDCIconToggle(this.iconElement);
        this.mdcIcon.disabled = this.disabled;
        this.applyFocusable();
    }

    detached() {
        if (this.mdcIcon) {
            this.mdcIcon.destroy();
        }
    }

    focusableChanged() {
        this.applyFocusable();
    }

    disabledChanged() {
        if (this.mdcIcon) {
            this.mdcIcon.disabled = this.disabled;
        }
        this.applyFocusable();
    }

    private applyFocusable() {
        if (!this.iconElement) {
            return;
        }
        if (this.focusable && !this.disabled) {
            this.iconElement.setAttribute('tabindex', '0');
        }
        else {
            this.iconElement.removeAttribute('tabindex');
        }
    }

    private onKeydown(evt: KeyboardEvent) {
        if (evt.key == 'Enter' && !this.disabled) {
            (<HTMLElement>this.element).click();
        }
        return true;
    }
}
