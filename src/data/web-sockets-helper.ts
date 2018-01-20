import * as Rx from "rxjs";
import { IWebApi, WebSocketSignalKind } from "./web-api";
import { WebSocketMessage, WebSocketMessageKind } from "./web-socket-message";
import { IRxSchedulerProvider } from "../rx-scheduler-provider";
import { autoinject } from "aurelia-framework";

@autoinject
export class WebSocketsHelper {
    readonly ongoingWebSocket$: Rx.Observable<WebSocketMessage>;

    constructor(private webApi: IWebApi, private schedulerProvider: IRxSchedulerProvider) {
        this.ongoingWebSocket$ = this.createOngoingWebSocket$();
    }

    private createOngoingWebSocket$(times?: number[]): Rx.Observable<WebSocketMessage> {
        if (times == undefined) {
            times = [0, 1, 1, 1, 2, 2, 2, 5].map(a => a * 1000);
        }
        let timeIndex = -1;
        return Rx.Observable
            .defer(() => this.webApi.createWebSocket$())
            .do(wss => {
                if (wss.kind == WebSocketSignalKind.Open) {
                    timeIndex = -1;
                }
            })
            .map(wss => {
                if (wss.kind == WebSocketSignalKind.Open) {
                    return new WebSocketMessage(WebSocketMessageKind.Open);
                }
                else if (wss.kind == WebSocketSignalKind.Message) {
                    return <WebSocketMessage>JSON.parse(wss.data);
                }
                throw new Error();
            })
            .catch(error => {
                //stub for Typescript compiler
                if (times == undefined) {
                    return Rx.Observable.empty<WebSocketMessage>();
                }
                timeIndex = Math.min(timeIndex + 1, times.length - 1);
                return Rx.Observable
                    .of(0)
                    .mapTo(new WebSocketMessage(WebSocketMessageKind.Error))
                    .concat(Rx.Observable
                        .timer(times[timeIndex], this.schedulerProvider.default)
                        .ignoreElements()
                        .concat(Rx.Observable.throw(error))
                        .map(a => <WebSocketMessage>a));
            })
            .retry()
            .startWith(new WebSocketMessage(WebSocketMessageKind.Open), new WebSocketMessage(WebSocketMessageKind.Open))
            .bufferCount(3, 1)
            .filter(a => a.length == 3)
            .filter(a =>
                (a[0].kind == WebSocketMessageKind.Open &&
                    a[1].kind == WebSocketMessageKind.Open &&
                    a[2].kind == WebSocketMessageKind.Open) ||

                (a[0].kind != WebSocketMessageKind.Error &&
                    a[1].kind == WebSocketMessageKind.Error &&
                    a[2].kind == WebSocketMessageKind.Error) ||

                (a[0].kind == WebSocketMessageKind.Error &&
                    a[1].kind == WebSocketMessageKind.Error &&
                    a[2].kind == WebSocketMessageKind.Open) ||

                (a[2].kind != WebSocketMessageKind.Error &&
                    a[2].kind != WebSocketMessageKind.Open))
            .map(a => a[2]);
    }
}
