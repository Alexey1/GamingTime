import { Game } from "./game";
import { GameServer } from "./game-server";
import * as Rx from "rxjs";
import { FakeData } from "./fake-data";
import { autoinject } from "aurelia-framework";
import { IRxSchedulerProvider } from "../rx-scheduler-provider";
import { MatchOrder } from "./match-order";
import { WebSocketMessageKind, WebSocketMessage } from "./web-socket-message";
import { IMatch } from "./match";

export enum WebSocketSignalKind {
    Open = 'Open',
    Message = 'Message'
}

export class WebSocketSignal {
    constructor(public kind: WebSocketSignalKind, public data: any = undefined) {
    }
}

export abstract class IWebApi {
    abstract getGames(): Rx.Observable<Game[]>;
    abstract getModes(gameName: string, region: string): Rx.Observable<string[]>;
    abstract getGameServers(gameName: string, mode: string, serverLoginPart: string, region: string): Rx.Observable<GameServer[]>;
    abstract submitMatchOrder(matchOrders: MatchOrder[]): Rx.Observable<undefined>;
    abstract cancelMatchOrder(): Rx.Observable<undefined>;
    abstract getIsMatchOrderActive(): Rx.Observable<boolean>;
    abstract createWebSocket$(): Rx.Observable<WebSocketSignal>;
}

@autoinject
export class FakeWebApi implements IWebApi {
    //private readonly defaultDelay = 1000;
    private readonly defaultDelay = 0;
    private readonly findMatchDelay = 115000;

    private webSocketSubject = new Rx.Subject<WebSocketSignal>();

    //private readonly fakeServersDataUrl = '/dev-misc/fake-servers-data.json';

    private matchFindTimeoutId: any;

    constructor(private fakeData: FakeData, private schedulerProvider: IRxSchedulerProvider) {
    }

    getGames(): Rx.Observable<Game[]> {
        return this.getObservable(this.fakeData.games);
    }

    getModes(gameName: string, region: string): Rx.Observable<string[]> {
        const modes = this.fakeData.gameModes.get(gameName + '|' + region) || [];
        return this.getObservable(modes);
    }

    // getGameServers(gameName: string, mode: string, serverLoginPart: string, region: string) {
    //     return Rx.Observable.fromPromise(fetch(this.fakeServersDataUrl).then(res => res.text()))
    //         .map(a => Array.from(JSON.parse(a))
    //             .filter((b: any) => (<string>b.login).startsWith(serverLoginPart))
    //             .map((b: any) => new GameServer(b.login, b.serverName))).delay(this.defaultDelay);
    // }

    getGameServers(gameName: string, mode: string, serverLoginPart: string, region: string) {
        return this.getObservable(this.fakeData.gameServers.filter(s => s.login.startsWith(serverLoginPart)));
    }

    submitMatchOrder(matchOrders: MatchOrder[]): Rx.Observable<undefined> {
        this.matchFindTimeoutId = setTimeout(() => {
            const message = new WebSocketMessage(WebSocketMessageKind.Match, this.fakeData.match);
            this.webSocketSubject.next(new WebSocketSignal(WebSocketSignalKind.Message, JSON.stringify(message)));
        }, this.findMatchDelay);
        return this.getObservable(undefined, 1000);
    }

    cancelMatchOrder(): Rx.Observable<undefined> {
        clearTimeout(this.matchFindTimeoutId);
        return this.getObservable(undefined, 1000);
    }

    getIsMatchOrderActive(): Rx.Observable<boolean> {
        return this.getObservable(true, this.defaultDelay);
    }

    createWebSocket$(): Rx.Observable<WebSocketSignal> {
        return this.webSocketSubject.asObservable().startWith(new WebSocketSignal(WebSocketSignalKind.Open));
    }

    private getObservable<T>(data: T, delay: number = this.defaultDelay) {
        return Rx.Observable.timer(delay, this.schedulerProvider.default).map(_ => data);
    }
}

/*
private getWebSocket$(url: string): Rx.Observable<WebSocketMessage> {
        return Rx.Observable.create((subject: Rx.Observer<WebSocketMessage>) => {
            Rx.Observable
                .webSocket({
                    url,
                    openObserver: {
                        next: (evt: Event) => {
                            subject.next(WebSocketMessage.createOpen())
                        }
                    }
                })
                .map(msg => WebSocketMessage.createData(msg))
                .subscribe(subject);
        });
    }
*/


//TODO consider using Rx.Observable.webSocket instead
/*
createWebSocket$(url: string): Rx.Observable<WebSocketMessage> {
    return Rx.Observable.create((o: Rx.Observer<WebSocketMessage>) => {
        let webSocket: WebSocket;
        const openHandler = () => o.next(new WebSocketMessage(WebSocketMessageKind.Open));
        const messageHandler = (evt: MessageEvent) => {
            o.next(new WebSocketMessage(WebSocketMessageKind.Data, evt.data));
        };
        const errorHandler = () => {
            removeHandlers();
            o.error(undefined);
        };
        const closeHandler = (evt: CloseEvent) => {
            removeHandlers();
            if (evt.wasClean) {
                o.complete();
            }
            else {
                o.error(undefined);
            }
        };
        const removeHandlers = () => {
            webSocket.removeEventListener('open', openHandler);
            webSocket.removeEventListener('message', messageHandler);
            webSocket.removeEventListener('error', errorHandler);
            webSocket.removeEventListener('close', closeHandler);
        }
        webSocket = new WebSocket(url);
        webSocket.addEventListener('open', openHandler);
        webSocket.addEventListener('message', messageHandler);
        webSocket.addEventListener('error', errorHandler);
        webSocket.addEventListener('close', closeHandler);
    });
}*/
