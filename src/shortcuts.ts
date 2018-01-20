import { EventAggregator } from "aurelia-event-aggregator";
import { AppEvent } from "./data/app-event";
import { autoinject } from "aurelia-framework";

export enum ShortcutName {
    AddMatchOrder = 'add-match-order',
    SearchMatch = 'search-match',
    EditMatchOrder = 'edit-match-order',
    RemoveMatchOrder = 'remove-match-order',
    SaveMatchOrderList = 'save-match-order-list',
    RestoreMatchOrderList = 'restore-match-order-list',
    ClearMatchOrderList = 'clear-match-order-list',
    OpenMatchOrderBuilder = 'open-match-order-builder',
    OpenServersFilter = 'open-servers-filter',
    ToggleGameServerSelection = 'toggle-game-server-selection',
    RemoveSelectedGameServer = 'remove-selected-game-server',
    ClearSelectedGameServers = 'clear-selected-game-servers',
    CancelMatchSearch = 'cancel-match-search',
    OpenOptions = 'open-options',
    OpenMatchDetails = 'open-match-details'
}

let ShortcutKeys: { [index: string]: string } = {
    [ShortcutName.AddMatchOrder]: 'Enter',
    [ShortcutName.SearchMatch]: 'Ctrl+Enter',
    [ShortcutName.EditMatchOrder]: 'Enter',
    [ShortcutName.RemoveMatchOrder]: 'Delete',
    [ShortcutName.SaveMatchOrderList]: 'S',
    [ShortcutName.RestoreMatchOrderList]: 'R',
    [ShortcutName.ClearMatchOrderList]: 'Ctrl+Delete',
    [ShortcutName.OpenMatchOrderBuilder]: 'Escape',
    [ShortcutName.OpenServersFilter]: 'Ctrl+Q',
    [ShortcutName.ToggleGameServerSelection]: 'Enter',
    [ShortcutName.RemoveSelectedGameServer]: 'Delete',
    [ShortcutName.ClearSelectedGameServers]: 'Ctrl+Delete',
    [ShortcutName.CancelMatchSearch]: 'Escape',
    [ShortcutName.OpenOptions]: 'Ctrl+I',
    [ShortcutName.OpenMatchDetails]: 'Ctrl+M'
}

export { ShortcutKeys }

@autoinject
export class ShortcutHelper {
    constructor(private evtAgg: EventAggregator) {
    }

    detectShortcut(e: KeyboardEvent) {
        let eventShortcut = e.key;
        if (e.shiftKey) {
            eventShortcut = "Shift+" + eventShortcut;
        }
        if (e.ctrlKey) {
            eventShortcut = "Ctrl+" + eventShortcut;
        }
        let element = <HTMLElement>e.target;
        const loopLimit = 100;
        let loopCounter = 0;
        while (loopCounter < loopLimit) {
            loopCounter++;
            const shortcutNamesString = element.dataset.shortcutNames;
            if (shortcutNamesString) {
                const shortcutNames = shortcutNamesString.split(',');
                for (let i = 0; i < shortcutNames.length; i++) {
                    const shortcutName = shortcutNames[i].trim();
                    const shortcutKeys = ShortcutKeys[shortcutName];
                    if (shortcutKeys) {
                        if (shortcutKeys.toLowerCase() == eventShortcut.toLowerCase()) {
                            this.evtAgg.publish(AppEvent.Shortcut, shortcutName);
                            return;
                        }
                    }
                    else {
                        throw new Error(`Keys are not found for shortcut '${shortcutName}'.`);
                    }
                }
            }
            const parentElement = element.parentElement;
            if (!parentElement) {
                break;
            }
            element = parentElement;
        }
    };
}
