import { bindable, autoinject, BindingEngine, Disposable } from "aurelia-framework";

@autoinject
export class GtList {
    @bindable items: any[] = [];
    @bindable selectedItem: any;
    @bindable itemCssClass: string;
    @bindable isLblMoreVisible = false;
    @bindable isLoading = false;
    private selectedIndex = -1;
    private contentWrapperElement: HTMLElement;
    private contentElement: HTMLElement;
    private itemsUpdateSub: Disposable;

    constructor(private bindingEngine: BindingEngine) {
    }

    itemsChanged() {
        if (this.itemsUpdateSub) {
            this.itemsUpdateSub.dispose();
        }
        if (this.items) {
            if (this.items.length > 0) {
                this.selectedIndex = 0;
                this.selectedItem = this.items[0];
            }
            else {
                this.selectedIndex = -1;
                this.selectedItem = null;
            }
            this.itemsUpdateSub = this.bindingEngine.collectionObserver(this.items).subscribe(this.itemsUpdate.bind(this));
        }
    }

    focus() {
        if (this.contentElement.firstElementChild) {
            (<HTMLElement>this.contentElement.firstElementChild).focus();
        }
    }

    private itemsUpdate(splices: any) {
        if (this.items.length > this.selectedIndex && this.selectedIndex >= 0) {
            this.selectedItem = this.items[this.selectedIndex];
        }
        else if (this.items.length > 0) {
            this.selectedIndex = this.items.length - 1;
            this.selectedItem = this.items[this.selectedIndex];
        }
        else {
            this.selectedIndex = -1;
            this.selectedItem = null;
        }
    }

    private onItemMouseDown(itemElement: any) {
        if (!this.items.includes(itemElement.model)) {
            return;
        }
        this.selectedItem = itemElement.model;
        this.selectedIndex = this.items.indexOf(this.selectedItem);
        return true;
    }

    private onKeydown(evt: KeyboardEvent) {
        if (evt.key == 'ArrowDown') {
            if (this.selectedIndex < this.items.length - 1) {
                this.selectedIndex = this.selectedIndex + 1;
                this.selectedItem = this.items[this.selectedIndex];
            }
            else {
                this.contentWrapperElement.scrollTop = this.contentWrapperElement.scrollHeight;
            }
            return false;
        }
        if (evt.key == 'ArrowUp') {
            this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
            this.selectedItem = this.items[this.selectedIndex];
            return false;
        }
        return true;
    }

    private selectedItemChanged(newValue: any, oldValue: any) {
        if (this.selectedItem == null) {
            return;
        }
        this.selectedIndex = this.items.indexOf(this.selectedItem);
        if (this.selectedIndex == -1 && this.items.length > 0) {
            throw new Error('Invalid selectedItem was specified.');
        }
        if (!this.contentElement) {
            return;
        }
        const itemElements = Array.from(this.contentElement.children);
        const selectedElement = <HTMLElement>itemElements.find((el: any) => el.model == this.selectedItem);
        if (selectedElement) {
            const isTopBorderAboveView = selectedElement.offsetTop < this.contentWrapperElement.scrollTop;
            const isBottomBorderBelowView = (selectedElement.offsetTop + selectedElement.offsetHeight - this.contentWrapperElement.scrollTop) > this.contentWrapperElement.clientHeight;
            if (isTopBorderAboveView) {
                this.contentWrapperElement.scrollTop = selectedElement.offsetTop;
            }
            if (isBottomBorderBelowView) {
                this.contentWrapperElement.scrollTop = selectedElement.offsetTop + selectedElement.offsetHeight - this.contentWrapperElement.clientHeight;
            }
            if (this.contentElement.contains(document.activeElement)) {
                selectedElement.focus();
            }
        }
    }
}
