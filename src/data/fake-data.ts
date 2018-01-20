import { Game } from "./game";
import { GameServer } from "./game-server";
import { GameHost } from "./game-host";
import { IMatch, IGameHost1Match } from "./match";

export class FakeData {
    public games = [
        new Game('game1', 'game 1', GameHost.GameHost1),
        new Game('game2', 'game 2', GameHost.GameHost1),
        new Game('game3', 'game 3', GameHost.GameHost1),
        new Game('game4', 'game 4', GameHost.GameHost1),
        new Game('game5', 'game 5', GameHost.GameHost1),
        new Game('game6', 'game 6', GameHost.GameHost2)
    ];
    public gameModes: Map<string, string[]>;

    public gameServers: GameServer[] = [];

    public match: IMatch;

    constructor() {
        this.gameModes = new Map();
        this.games.forEach(game => {
            this.gameModes.set(game.name, []);
        });
        this.gameModes.set(this.games[0].name + '|europe', [
            "Abc",
            "Def",
            "Ghi",
            'Jkl']);
        this.gameModes.set(this.games[0].name + '|world', [
            "Abc",
            "Def",
            "Ghi",
            'Jkl',
            'Mno',
            'Pqr',
            'Stu']);
        this.gameModes.set(this.games[2].name + '|europe', [
            'Abcd',
            'Efgh',
            'Ijkl']);
        this.gameModes.set(this.games[2].name + '|world', [
            'Abcd',
            'Efgh',
            'Ijkl',
            'Mnop',
            'Qrst']);
        for (let i = 0; i < 10; i++) {
            this.gameServers.push(new GameServer('a-server-login-' + i, 'server-title-' + i));
        }
        for (let i = 10; i < 20; i++) {
            this.gameServers.push(new GameServer('ab-server-login-' + i, 'server-title-' + i));
        }
        for (let i = 20; i < 30; i++) {
            this.gameServers.push(new GameServer('abc-server-login-' + i, 'server-title-' + i));
        }
        for (let i = 30; i < 40; i++) {
            this.gameServers.push(new GameServer('ad-server-login-' + i, 'server-title-' + i));
        }
        for (let i = 40; i < 50; i++) {
            this.gameServers.push(new GameServer('ade-server-login-' + i, 'server-title-' + i));
        }

        this.match = <IGameHost1Match>{
            game: this.games[0].name,
            mode: 'Abc',
            serverId: 'serverid',
            serverTitle: 'servertitle',
            serverLink: 'serverlink',
            usersCount: 2,
            playersCount: 3
        }
    }
}
