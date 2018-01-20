import { bindable, autoinject } from 'aurelia-framework';
import { GtList } from '../../common/elements/gt-list';
import { NameTitle } from '../../data/name-title';
import { CommonData } from '../../data/common-data';

@autoinject
export class GtOptions {
    @bindable close: Function;

    private tabNames = ['games', 'region', 'theme'];
    private tabs: NameTitle[];
    private selectedTab: NameTitle;
    private tabsListCmnt: GtList;

    constructor() {
        this.tabs = this.tabNames.map(tabName => new NameTitle(tabName));
        this.selectedTab = this.tabs[0];
    }
}
