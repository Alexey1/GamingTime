import { autoinject, bindable, Aurelia } from 'aurelia-framework';
import { NameTitle } from "../../data/name-title";

@autoinject
export class GtSelect {
    @bindable items: NameTitle[];
    @bindable selectedItem: NameTitle;
    @bindable selectedItemChanging = (a: { highlightedItem: NameTitle }) => { };
    private dropdownElement: Element;
    private isDropdownOpen = false;
    private highlightedItem: NameTitle;
    private appHostMousedownHandler: (evt: MouseEvent) => void;
    private dropdownContentMousedownHandler: (evt: MouseEvent) => void;

    constructor(private element: Element, private aurelia: Aurelia) {
        this.appHostMousedownHandler = evt => {
            this.isDropdownOpen = false;
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

    private itemsChanged() {
        if (this.items.length > 0) {
            this.setHighlightedItem(this.items[0]);
        }
    }

    private getNextItem(item: NameTitle) {
        return this.items[Math.min(this.items.length - 1, this.items.indexOf(item) + 1)];
    }

    private getPrevItem(item: NameTitle) {
        return this.items[Math.max(0, this.items.indexOf(item) - 1)];
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
            if (this.isDropdownOpen) {
                this.setHighlightedItem(this.getPrevItem(this.highlightedItem));
                evt.preventDefault();
            }
        }
        if (evt.key == 'Tab') {
            this.isDropdownOpen = false;
        }
        if (evt.key == 'Enter') {
            if (this.isDropdownOpen) {
                //avoid triggering a command
                evt.stopPropagation();
                this.acceptItemSelection();
            }
        }
        if (evt.key == 'Escape') {
            this.isDropdownOpen = false;
        }
        return true;
    }

    private setHighlightedItem(item: NameTitle) {
        if (this.highlightedItem != item) {
            this.highlightedItem = item;
            this.scrollItemIntoView(item);
        }
    }

    private onClick(evt: MouseEvent) {
        const srcElement = <Element>evt.srcElement;
        if (srcElement != this.dropdownElement &&
            !this.dropdownElement.contains(srcElement)) {
            this.openDropdown();
        }
    }

    private acceptItemSelection() {
        this.selectedItemChanging({ highlightedItem: this.highlightedItem });
        this.isDropdownOpen = false;
        this.selectedItem = this.highlightedItem;
    }

    private onItemClick(item: NameTitle) {
        this.setHighlightedItem(item);
        this.acceptItemSelection();
    }

    private openDropdown() {
        this.highlightedItem = this.selectedItem;
        this.isDropdownOpen = true;
        setTimeout(() => {
            this.scrollItemIntoView(this.highlightedItem);
        }, 0);
    }

    private scrollItemIntoView(item: NameTitle) {
        if (!this.isDropdownOpen) {
            return;
        }
        const itemElement = this.dropdownElement.querySelector(`[data-item='${item.name}']`);
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
