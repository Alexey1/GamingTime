import * as Rx from "rxjs";
export let testScheduler: Rx.TestScheduler;
export const clm = (marbles: string) => marbles.replace(/ /g, '');
export const hot = (marbles: string, values?: any) => testScheduler.createHotObservable(clm(marbles), values);
export const cold = (marbles: string, values?: any) => testScheduler.createColdObservable(clm(marbles), values);
export const time = (marbles: string) => testScheduler.createTime(clm(marbles));
export const expectObservable = (o: Rx.Observable<any>) => testScheduler.expectObservable(o);

export const createTestScheduler = () => {
    testScheduler = new Rx.TestScheduler((actual: any, expected: any) => {
        //console.log(actual.length, expected.length);
        //console.log(JSON.stringify(actual, null, 4));
        //console.log(JSON.stringify(expected, null, 4));
        expect(actual).toEqual(expected);
    });
}
