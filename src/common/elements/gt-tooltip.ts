import { autoinject, bindable, observable, Aurelia, computedFrom } from 'aurelia-framework';
import { ShortcutKeys } from '../../shortcuts';

@autoinject
export class GtTooltip {
    @bindable text: string;
    @bindable disabledText: string;
    @bindable shortcutName: string;
    @bindable disabled = true;
    private ttpContentEl: HTMLElement;
    private domObserver: MutationObserver;

    constructor(private element: Element, private aurelia: Aurelia) {
    }

    attached() {
        this.domObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                this.position();
            });
        });
        this.domObserver.observe(this.ttpContentEl, { childList: true, subtree: true });
    }

    detached() {
        this.domObserver.disconnect();
    }

    onMouseEnter() {
        this.position();
        if (this.element.firstElementChild) {
            this.ttpContentEl.classList.add('gt-ttp-show');
        }
    }

    @computedFrom('shortcutName')
    private get shortcutKeys() {
        return ShortcutKeys[this.shortcutName];
    }

    private position() {
        if (!this.element.firstElementChild) {
            return;
        }
        this.ttpContentEl.style.left = '0';
        const hostEl = <HTMLElement>this.aurelia.host;
        const viewportSize = { width: hostEl.offsetWidth, height: hostEl.offsetHeight };
        const targetElRect = this.element.firstElementChild.getBoundingClientRect();
        const tooltipElSize = { width: this.ttpContentEl.offsetWidth, height: this.ttpContentEl.offsetHeight };
        let top = 0;
        const bottomSpace = viewportSize.height - targetElRect.top - targetElRect.height;
        if (bottomSpace > tooltipElSize.height) {
            top = targetElRect.top + targetElRect.height;
        }
        else {
            top = targetElRect.top - tooltipElSize.height;
        }
        const targetElCenter = targetElRect.left + targetElRect.width / 2;
        let left = targetElCenter - tooltipElSize.width / 2;
        left = Math.max(0, left);
        //-1 to account for rouning error
        left = Math.min(left, viewportSize.width - tooltipElSize.width - 1);
        this.ttpContentEl.style.top = top + 'px';
        this.ttpContentEl.style.left = left + 'px';
    }

    onMouseLeave() {
        this.ttpContentEl.classList.remove('gt-ttp-show');
    }
}
