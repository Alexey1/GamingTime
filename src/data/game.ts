import { GameHost } from "./game-host";

export class Game {
    constructor(
        public name: string,
        public title: string,
        public gameHost: GameHost) {
    }

    //TODO remove
    toString() {
        return this.title;
    }
}
