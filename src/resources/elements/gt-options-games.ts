import { bindable, autoinject, observable } from 'aurelia-framework';
import { Game } from '../../data/game';
import { CommonData } from '../../data/common-data';
import { OptionsModel } from '../../data/options-model';

class GameListItem {
    @observable public isSelected: boolean;
    private isSelectedChangedCallback = (game: GameListItem) => { };

    constructor(
        public game: Game,
        isSelected: boolean,
        isSelectedChangedCallback: (game: GameListItem) => void,
        public disabled = false) {
        this.isSelected = isSelected;
        this.isSelectedChangedCallback = isSelectedChangedCallback;
    }

    isSelectedChanged() {
        this.isSelectedChangedCallback(this);
    }
}

@autoinject
export class GtOptionsGames {
    private gameItems: GameListItem[];

    constructor(
        private optionsModel: OptionsModel,
        private commonData: CommonData) {
        if (this.optionsModel.games.length == 0) {
            this.gameItems = this.commonData.games.map(g => new GameListItem(g, true, this.gameItemChangedCallback.bind(this)));
        }
        else {
            this.gameItems = this.commonData.games.map(g => new GameListItem(g, this.optionsModel.games.includes(g), this.gameItemChangedCallback.bind(this)));
        }
        this.disableSingleItem();
    }

    private gameItemChangedCallback(gameListItem: GameListItem) {
        if (gameListItem.isSelected) {
            this.optionsModel.addGame(gameListItem.game);
        }
        else {
            this.optionsModel.removeGame(gameListItem.game);
        }
        this.disableSingleItem();
    }

    private disableSingleItem() {
        const selectedGames = this.gameItems.filter(g => g.isSelected);
        if (selectedGames.length == 1) {
            selectedGames[0].disabled = true;
        }
        else {
            this.gameItems.forEach(g => g.disabled = false);
        }
    }
}
