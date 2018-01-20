import { bindable, autoinject, Aurelia } from 'aurelia-framework';
import { MdcTextfield } from "./mdc-textfield";

@autoinject
export class GtAutocomplete {
    @bindable items: string[];
    @bindable selectedItem: string | null;
    @bindable placeholder: string;
    @bindable isLoading = false;
    @bindable dropdownOpened = () => { };
    private highlightedItem: string;
    private text: string;
    private isDropdownOpen = false;
    private appHostMousedownHandler: (evt: MouseEvent) => void;
    private dropdownContentMousedownHandler: (evt: MouseEvent) => void;
    private dropdownElement: Element;
    private txtMode: MdcTextfield;
    private skipUpdatingTextOnSelectedItemChange = false;

    constructor(private element: Element, private aurelia: Aurelia) {
        this.appHostMousedownHandler = evt => {
            this.cancelItemSelection();
        }
        this.dropdownContentMousedownHandler = evt => {
            //prevent dropdown from closing when dropdown is clicked
            evt.stopPropagation();
        }
    }

    attached() {
        this.dropdownElement.addEventListener('mousedown', this.dropdownContentMousedownHandler, false);
        this.aurelia.host.addEventListener('mousedown', this.appHostMousedownHandler, false);
    }

    detached() {
        this.dropdownElement.removeEventListener('mousedown', this.dropdownContentMousedownHandler);
        this.aurelia.host.removeEventListener('mousedown', this.appHostMousedownHandler);
    }

    private cancelItemSelection() {
        this.isDropdownOpen = false;
        if (!this.selectedItem) {
            this.text = '';
        }
    }

    private openDropdown(raiseEvent = true) {
        if (!this.isDropdownOpen) {
            this.isDropdownOpen = true;
            if (raiseEvent) {
                this.dropdownOpened();
            }
        }
    }

    onArrowClick() {
        this.openDropdown();
        return true;
    }

    private setHighlightedItem(item: string) {
        if (this.highlightedItem != item) {
            this.highlightedItem = item;
            this.scrollItemIntoView(item);
        }
    }

    private itemsChanged() {
        if (this.items.length > 0) {
            this.highlightedItem = this.items[0];
            this.dropdownElement.scrollTop = 0;
        }
    }

    private onInput() {
        this.setSelectedItem(null);
        this.openDropdown(false);
        return true;
    }

    private onKeydown(evt: KeyboardEvent) {
        if (evt.key == 'ArrowDown') {
            if (this.isDropdownOpen) {
                this.setHighlightedItem(this.getNextItem(this.highlightedItem));
            }
            else {
                this.openDropdown();
            }
            evt.preventDefault();
        }
        if (evt.key == 'ArrowUp') {
            this.setHighlightedItem(this.getPrevItem(this.highlightedItem));
            evt.preventDefault();
        }
        if (evt.key == 'Tab') {
            this.cancelItemSelection();
        }
        if (evt.key == 'Enter') {
            if (this.isDropdownOpen) {
                //avoid triggering a command
                evt.stopPropagation();
                this.acceptItemSelection();
            }
        }
        if (evt.key == 'Escape') {
            if (this.isDropdownOpen) {
                //avoid triggering a command
                evt.stopPropagation();
                this.cancelItemSelection();
            }
        }
        return true;
    }

    onBlur() {
        this.cancelItemSelection();
    }

    private getNextItem(item: string) {
        return this.items[Math.min(this.items.length - 1, this.items.indexOf(item) + 1)];
    }

    private getPrevItem(item: string) {
        return this.items[Math.max(0, this.items.indexOf(item) - 1)];
    }

    private acceptItemSelection() {
        this.setSelectedItem(this.highlightedItem);
        this.text = this.selectedItem || '';
        this.isDropdownOpen = false;
        this.txtMode.focus();
    }

    private setSelectedItem(value: string | null) {
        this.skipUpdatingTextOnSelectedItemChange = true;
        this.selectedItem = value;
    }

    private onItemClick(item: string) {
        this.setHighlightedItem(item);
        this.acceptItemSelection();
    }

    private selectedItemChanged() {
        if (this.skipUpdatingTextOnSelectedItemChange) {
            this.skipUpdatingTextOnSelectedItemChange = false;
            return;
        }
        this.text = this.selectedItem || '';
    }

    private scrollItemIntoView(item: string) {
        if (!this.isDropdownOpen) {
            return;
        }
        const itemElement = this.dropdownElement.querySelector(`[data-item='${item}']`);
        if (itemElement == null) {
            return;
        }
        const itemHtmlElement = <HTMLElement>itemElement;
        const clientHeight = this.dropdownElement.clientHeight;
        const scrollHeight = this.dropdownElement.scrollHeight;
        const scrollTop = this.dropdownElement.scrollTop;
        const itemHeight = itemHtmlElement.offsetHeight;
        const itemTop = itemHtmlElement.offsetTop;
        if (scrollTop + clientHeight < itemTop + itemHeight) {
            this.dropdownElement.scrollTop = (itemTop + itemHeight) - clientHeight;
        }
        if (itemTop < scrollTop) {
            this.dropdownElement.scrollTop = itemTop;
        }
    }
}

