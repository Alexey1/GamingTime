export interface IMatch {
    game: string;
    mode: string;
    serverId: string;
    serverTitle: string;
    usersCount: number;
    playersCount: number;
}

export interface IGameHost1Match extends IMatch {
    serverLink: string;
}

export interface IGameHost2Match extends IMatch {
    serverIp: string;
}
