import { Kernel } from './kernel';
/**
 * Represents an event signal.
 * - The types of the arguments passed to the event handlers.
 */
const SESSIONS = Kernel.Construct('WeakMap') as WeakMap<NativeEvent, Set<(...params: unknown[]) => void>>;
export enum ResultType {
   Warning,
   Error,
}
export class RunResult extends Kernel.Empty {
   public constructor(
      public readonly method: (...params: unknown[]) => void,
      public readonly type: ResultType,
      public readonly value: unknown,
   ) {
      super();
   }
}
export class InvokeResults extends Kernel.Empty {
   public readonly results: Array<RunResult> = Kernel.Construct('Array') as Array<RunResult>;
   public successCount = 0;
   public totalCount = 0;
}
export class NativeEvent<Args extends unknown[] = unknown[]> extends Kernel.Empty {
   public constructor() {
      super();
      SESSIONS.set(this, Kernel.Construct('Set', Kernel.Construct('Array')) as Set<(...params: unknown[]) => void>);
   }
   /**
    * Triggers the event signal.
    * @param params - The arguments to pass to the event handlers.
    * @returns A promise that resolves with the number of successful event handlers.
    */
   public invoke(...params: Args) {
      const output = new InvokeResults();
      if (SESSIONS.has(this)) {
         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
         const methods = SESSIONS.get(this)!;
         for (const method of Kernel.SetIterator(methods)) {
            output.totalCount++;
            try {
               if (method(...params) !== undefined)
                  output.results.push(
                     new RunResult(method, ResultType.Warning, `Method returned value, but return type should be void`),
                  );
               output.successCount++;
            } catch (error) {
               output.results.push(new RunResult(method, ResultType.Error, error));
            }
         }
      }
      return output;
   }
   /**
    * Subscribes to the event signal.
    * @template  k - The type of the event handler function.
    * @param method - The event handler function to subscribe.
    * @returns The subscribed event handler function.
    */
   public subscribe<M extends (...params: Args) => void>(method: M): M {
      if (typeof method !== 'function')
         throw new Kernel['TypeError::constructor'](`Expected a function, but got ${typeof method}.`);
      if (SESSIONS.has(this)) {
         const set: Set<unknown> = SESSIONS.get(this) as Set<unknown>;
         if (!set.has(method)) set.add(method);
      }
      return method;
   }

   /**
    * Unsubscribes from the event signal.
    * @template k - The type of the event handler function.
    * @param method - The event handler function to unsubscribe.
    * @returns The unsubscribed event handler function.
    */
   public unsubscribe<M extends (...params: Args) => void>(method: M): M {
      if (typeof method !== 'function')
         throw new Kernel['TypeError::constructor'](`Expected a function, but got ${typeof method}.`);
      if (SESSIONS.has(this)) (SESSIONS.get(this) as { delete: (b: unknown) => void })?.delete(method);
      return method;
   }
}
