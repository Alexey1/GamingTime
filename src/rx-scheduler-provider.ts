import * as Rx from "rxjs";
import { IScheduler } from "rxjs/Scheduler";

export abstract class IRxSchedulerProvider {
    abstract asap: IScheduler;
    abstract queue: IScheduler;
    abstract animationFrame: IScheduler;
    abstract async: IScheduler;
    abstract default: IScheduler;
}

export class RxSchedulerProvider implements IRxSchedulerProvider {
    asap = Rx.Scheduler.asap;
    queue = Rx.Scheduler.queue;
    animationFrame = Rx.Scheduler.animationFrame;
    async = Rx.Scheduler.async;
    default = Rx.Scheduler.async;
}
