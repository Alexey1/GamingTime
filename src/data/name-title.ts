export class NameTitle {
    constructor(public name: string, public title?: string) {
        if (title == undefined) {
            this.title = this.name;
        }
    }
}
