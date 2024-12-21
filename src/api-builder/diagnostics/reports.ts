import { Kernel } from '../kernel';
import { ErrorFactory } from './factory';

export abstract class BaseReport extends Kernel.Empty {
   public abstract readonly isThrowable: boolean;
   public abstract throw(startStackFrom?: number): Error;
}
export class Report extends BaseReport {
   public readonly isThrowable = true;
   public readonly childReport: BaseReport | null;
   public constructor(
      public readonly factory: ErrorFactory,
      child: BaseReport | null = null,
   ) {
      super();
      this.childReport = child ?? null;
   }
   public override throw(trimStackCount = 0): Error {
      const error = new (this.factory.getErrorConstructor())(this.factory.getMessage());
      removeStackFromError(trimStackCount + 1, error);
      return error;
   }
}
export function removeStackFromError(stackSize: number, error: Error) {
   if (!error.stack) return error;
   const [text, ...stack] = error.stack.split('\n    at ');
   error.stack = Kernel.As(Kernel['Array::static'].of(text, ...stack.slice(stackSize)), 'Array').join('\n    at ');
   return error;
}
