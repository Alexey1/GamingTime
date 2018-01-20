import { GtMatchOrder } from "../../src/resources/elements/gt-match-order";
import * as h from "./helpers";
import { RequestStatus } from "../../src/data/request-status";
import { Game } from "../../src/data/game";
import { GameHost } from "../../src/data/game-host";
import * as Rx from "rxjs";
import { Utility } from "../../src/utility";

void Utility; //trigger Utility module default logic

class TestGtMatchOrder extends GtMatchOrder {
    public createModes$(
        game$: Rx.Observable<Game>,
        region$: Rx.Observable<string>,
        modeRequest$: Rx.Observable<string>) {
        return super.createModes$(game$, region$, modeRequest$);
    }
}

describe('GtMatchOrder', () => {

    const createSubject = (webApiMock: any) => {
        const evtAggMock = { subscribe() { } };
        return new TestGtMatchOrder(null, <any>webApiMock, <any>evtAggMock, null, null);
    }

    const region = 'World';

    beforeEach(() => {
        h.createTestScheduler();
    });

    it('createModes$ should signal `in progress` status and modes after game, region and modes request signals', () => {
        const modes = ['mode1', 'mode2'];
        const modePart = 'mode';
        const values = {
            a: new Game('1', '', GameHost.GameHost1),
            b: region,
            c: modePart,
            d: modes,
            e: { status: RequestStatus.InProgress, modes: [], modePart },
            f: { status: RequestStatus.Success, modes, modePart }
        }

        const game$Marbles = '       a';
        const region$Marbles = '     b';
        const modeRequest$Marbles = '---c';
        const webApiModes$Marbles = '   ---d|';
        const expectedMarbles = '    ---e--f';

        const game$ = h.hot(game$Marbles, values).map(a => <Game>a);
        const region$ = h.hot(region$Marbles, values).map(a => <string>a);
        const modeRequest$ = h.hot(modeRequest$Marbles, values).map(a => <string>a);
        const webApiMock = {
            getModes: (game: any) => h.cold(webApiModes$Marbles, values).map(a => <string[]>a)
        };
        const subject = createSubject(webApiMock);
        h.expectObservable(subject.createModes$(game$, region$, modeRequest$)).toBe(h.clm(expectedMarbles), values);
        h.testScheduler.flush();
    });

    it('createModes$ should signal `in progress` status for next mode request that is during first modes loading', () => {
        const modes = ['mode1', 'mode2'];
        const modePart = 'mode';
        const values = {
            a: new Game('1', '', GameHost.GameHost1),
            b: region,
            c: modePart,
            d: modes,
            e: { status: RequestStatus.InProgress, modes: [], modePart },
            f: { status: RequestStatus.Success, modes, modePart }
        }

        const game$Marbles = '       a';
        const region$Marbles = '     b';
        const modeRequest$Marbles = '-c-c';
        const webApiModes$Marbles = ' ----d|';
        const expectedMarbles = '    -e-e-f'; //d - in progress

        const game$ = h.hot(game$Marbles, values).map(a => <Game>a);
        const region$ = h.hot(region$Marbles, values).map(a => <string>a);
        const modeRequest$ = h.hot(modeRequest$Marbles, values).map(a => <string>a);
        const webApi = {
            getModes(gameId: number) {
                return h.cold(webApiModes$Marbles, values).map(a => <string[]>a);
            }
        }
        const subject = createSubject(webApi);
        h.expectObservable(subject.createModes$(game$, region$, modeRequest$)).toBe(h.clm(expectedMarbles), values);
        h.testScheduler.flush();
    });

    it('createModes$ should load modes once if all next requests happen during first modes loading', () => {
        const modes = ['mode1', 'mode2'];
        const modePart = 'mode';
        const values = {
            a: new Game('1', '', GameHost.GameHost1),
            b: region,
            c: modePart,
            d: modes
        }

        const game$Marbles = '       a';
        const region$Marbles = '     b';
        const modeRequest$Marbles = '-c-c';
        const webApiModes$Marbles = ' ----d|';

        const game$ = h.hot(game$Marbles, values).map(a => <Game>a);
        const region$ = h.hot(region$Marbles, values).map(a => <string>a);
        const modeRequest$ = h.hot(modeRequest$Marbles, values).map(a => <string>a);
        let getWebApiModes$CallsCount = 0;
        const webApi = {
            getModes(gameId: number) {
                getWebApiModes$CallsCount++;
                return h.cold(webApiModes$Marbles, values).map(a => <string[]>a);
            }
        }
        const subject = createSubject(webApi);
        subject.createModes$(game$, region$, modeRequest$).subscribe();
        h.testScheduler.flush();
        expect(getWebApiModes$CallsCount).toBe(1);
    });

    it('createModes$ should signal error status if web api error', () => {
        const modes = ['mode1', 'mode2'];
        const modePart = 'mode';
        const values = {
            a: new Game('1', '', GameHost.GameHost1),
            b: region,
            c: modePart,
            d: { status: RequestStatus.InProgress, modes: [], modePart },
            e: { status: RequestStatus.Error, modes: [], modePart }
        }

        const game$Marbles = '       a';
        const region$Marbles = '     b';
        const modeRequest$Marbles = '-c';
        const webApiModes$Marbles = ' --#|';
        const expectedMarbles = '    -d-e';

        const game$ = h.hot(game$Marbles, values).map(a => <Game>a);
        const region$ = h.hot(region$Marbles, values).map(a => <string>a);
        const modeRequest$ = h.hot(modeRequest$Marbles, values).map(a => <string>a);
        const webApi = {
            getModes(gameId: number) {
                return h.cold(webApiModes$Marbles, values).map(a => <string[]>a);
            }
        }
        const subject = createSubject(webApi);
        h.expectObservable(subject.createModes$(game$, region$, modeRequest$)).toBe(h.clm(expectedMarbles), values);
        h.testScheduler.flush();
    });

    it('createModes$ should signal data after web api error and next modes request', () => {
        const modes = ['mode1', 'mode2'];
        const modePart1 = 'mode1';
        const modePart2 = 'mode2';
        const values = {
            a: new Game('1', '', GameHost.GameHost1),
            b: region,
            c: modePart1,
            d: modePart2,
            e: modes,
            f: { status: RequestStatus.InProgress, modes: [], modePart: modePart1 },
            g: { status: RequestStatus.Error, modes: [], modePart: modePart1 },
            h: { status: RequestStatus.Error, modes: [], modePart: modePart2 },
            i: { status: RequestStatus.InProgress, modes: [], modePart: modePart2 },
            j: { status: RequestStatus.Success, modes, modePart: modePart2 }
        }

        const game$Marbles = '       a';
        const region$Marbles = '     b';
        const modeRequest$Marbles = '-c-----d';
        const webApiModes$Marbles = [
            '                         --#|',
            '                               -----e|',
        ]
        const expectedMarbles = '    -f-g---(hi)-j';

        const game$ = h.hot(game$Marbles, values).map(a => <Game>a);
        const region$ = h.hot(region$Marbles, values).map(a => <string>a);
        const modeRequest$ = h.hot(modeRequest$Marbles, values).map(a => <string>a);
        let webApiModes$Index = 0;
        const webApi = {
            getModes(gameId: number) {
                return h.cold(webApiModes$Marbles[webApiModes$Index++], values).map(a => <string[]>a);
            }
        }
        const subject = createSubject(webApi);
        h.expectObservable(subject.createModes$(game$, region$, modeRequest$)).toBe(h.clm(expectedMarbles), values);
        h.testScheduler.flush();
    });

    it('createModes$ should signal modes for a second game after modes are loaded for the first game, the second game is selected and modes are requested', () => {
        const modes1 = ['mode1', 'mode2'];
        const modes2 = ['mode3', 'mode4'];
        const modePart1 = 'mode1';
        const modePart2 = 'mode3';
        const values = {
            a: new Game('1', '', GameHost.GameHost1),
            c: modePart1,
            d: modes1,
            e: { status: RequestStatus.InProgress, modes: [], modePart: modePart1 },
            f: { status: RequestStatus.Success, modes: modes1, modePart: modePart1 },
            g: new Game('2', '', GameHost.GameHost1),
            h: modePart2,
            i: modes2,
            j: { status: RequestStatus.InProgress, modes: [], modePart: modePart2 },
            k: { status: RequestStatus.Success, modes: modes2, modePart: modePart2 }
        }

        const game$Marbles = '       a------g';
        const region$Marbles = '     b';
        const modeRequest$Marbles = '-c-------h';
        const webApiModes$Marbles = [
            '                         --d|',
            '                                 --i|',
        ]
        const expectedMarbles = '    -e-f-----j-k';

        const game$ = h.hot(game$Marbles, values).map(a => <Game>a);
        const region$ = h.hot(region$Marbles, values).map(a => <string>a);
        const modeRequest$ = h.hot(modeRequest$Marbles, values).map(a => <string>a);
        let webApiModes$Index = 0;
        const webApi = {
            getModes(gameId: number) {
                return h.cold(webApiModes$Marbles[webApiModes$Index++], values).map(a => <string[]>a);
            }
        }
        const subject = createSubject(webApi);
        h.expectObservable(subject.createModes$(game$, region$, modeRequest$)).toBe(h.clm(expectedMarbles), values);
        h.testScheduler.flush();
    });

    it('createModes$ should not signal modes loaded from another game', () => {
        const modes1 = ['mode1', 'mode2'];
        const modes2 = ['mode3', 'mode4'];
        const modePart1 = 'mode1';
        const modePart2 = 'mode3';
        const values = {
            a: new Game('1', '', GameHost.GameHost1),
            b: region,
            c: modePart1,
            d: modes1,
            e: { status: RequestStatus.InProgress, modes: [], modePart: modePart1 },
            f: { status: RequestStatus.Success, modes: modes1, modePart: modePart1 },
            g: new Game('2', '', GameHost.GameHost1),
            h: modePart2,
            i: modes2,
            j: { status: RequestStatus.InProgress, modes: [], modePart: modePart2 },
            k: { status: RequestStatus.Success, modes: modes2, modePart: modePart2 }
        }

        const game$Marbles = '       a--g';
        const region$Marbles = '     b';
        const modeRequest$Marbles = '-c---h';
        const webApiModes$Marbles = [
            '                         ------d|',
            '                             -----i|',
        ]
        const expectedMarbles = '    -e---j----k';

        const game$ = h.hot(game$Marbles, values).map(a => <Game>a);
        const region$ = h.hot(region$Marbles, values).map(a => <string>a);
        const modeRequest$ = h.hot(modeRequest$Marbles, values).map(a => <string>a);
        let webApiModes$Index = 0;
        const webApi = {
            getModes(gameId: number) {
                return h.cold(webApiModes$Marbles[webApiModes$Index++], values).map(a => <string[]>a);
            }
        }
        const subject = createSubject(webApi);
        h.expectObservable(subject.createModes$(game$, region$, modeRequest$)).toBe(h.clm(expectedMarbles), values);
        h.testScheduler.flush();
    });

});
