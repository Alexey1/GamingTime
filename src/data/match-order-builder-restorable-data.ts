import { MatchOrder } from "./match-order";

export interface IMatchOrderBuilderRestorableData {
    game: string;
    gameRegions: { game: string, region: string }[];
    userMatchOrderList: MatchOrder[];
    matchOrderList: MatchOrder[];
}
