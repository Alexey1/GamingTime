import { IMatchOrderBuilderRestorableData } from "./match-order-builder-restorable-data";
import { IOptionsRestorableData } from "./options-restorable-data";

export interface IAppRestorableData {
    matchOrderBuilder: IMatchOrderBuilderRestorableData;
    options: IOptionsRestorableData;
}
