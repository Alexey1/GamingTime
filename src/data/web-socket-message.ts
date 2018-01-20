export enum WebSocketMessageKind {
    Open = 'Open',
    Error = 'Error',
    Match = 'Match'
}

export class WebSocketMessage {
    constructor(public kind: WebSocketMessageKind, public data: any = undefined) {
    }
}
