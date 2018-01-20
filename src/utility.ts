import { autoinject, Aurelia } from 'aurelia-framework'
import * as Rx from "rxjs";
import { Theme } from "./data/theme";

function Observable_takeWhileInclusive<T>(this: Rx.Observable<T>, predicate: (item: T) => boolean) {
    return this.concatMap(value => {
        if (!predicate(value)) {
            return Rx.Observable.of({ isLast: false, value: value }, { isLast: true, value: value });
        }
        return Rx.Observable.of({ isLast: false, value });
    })
        .takeWhile(item => !item.isLast)
        .map(item => item.value);
}

Rx.Observable.prototype.takeWhileInclusive = Observable_takeWhileInclusive;

declare module "rxjs/Observable" {
    interface Observable<T> {
        takeWhileInclusive: typeof Observable_takeWhileInclusive;
    }
}

@autoinject
export class Utility {
    private uniqueIdPart = 0;

    constructor(
        private aurelia: Aurelia) {
    }

    getHostElement() {
        return this.aurelia.host;
    }

    getUniqueId() {
        this.uniqueIdPart++;
        return 'gt-uid-' + this.uniqueIdPart;
    }

    setTheme(theme: Theme) {
        const host = this.getHostElement().querySelector('.gt-app');
        switch (theme) {
            case Theme.Light:
                host.classList.remove('mdc-theme--dark');
                break;
            case Theme.Dark:
                host.classList.add('mdc-theme--dark');
                break;
        }
    }

    getTimeAgoText(milliseconds: number) {
        let result = '';
        let minutesCount = Math.floor(milliseconds / 1000 / 60);
        if (minutesCount >= 1) {
            result = 'a minute ago';
        }
        if (minutesCount >= 2) {
            result = minutesCount + ' minutes ago';
        }
        if (minutesCount >= 10) {
            result = '10 minutes ago';
        }
        if (minutesCount >= 15) {
            result = '15 minutes ago';
        }
        if (minutesCount >= 20) {
            result = '20 minutes ago';
        }
        if (minutesCount >= 30) {
            result = 'half an hour ago';
        }
        if (minutesCount >= 60) {
            result = 'an hour ago';
        }
        if (minutesCount >= 90) {
            result = 'a while ago';
        }
        if (result != '') {
            result = ' ' + result;
        }
        return result;
    }
}
