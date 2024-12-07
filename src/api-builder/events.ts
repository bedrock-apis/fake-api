import { Kernel } from './kernel';
/**
 * Represents an event signal.
 * - The types of the arguments passed to the event handlers.
 */
const SESSIONS = Kernel.Construct('WeakMap') as WeakMap<NativeEvent, Set<(...params: unknown[]) => unknown>>;

export class NativeEvent<args extends unknown[] = unknown[]> {
  public constructor() {
    SESSIONS.set(this, Kernel.Construct('Set', []) as Set<(...params: unknown[]) => unknown>);
  }
  /**
   * Triggers the event signal.
   * @param params - The arguments to pass to the event handlers.
   * @returns A promise that resolves with the number of successful event handlers.
   */
  public async trigger(...params: args) {
    if (SESSIONS.has(this)) {
      const promises: Promise<unknown>[] = [];
      SESSIONS.get(this)?.forEach(method => {
        promises.push((async () => method(...params))().catch(e => Kernel.error(e, e.stack)));
      });

      // all and other methods on Promise has special behavior to return new instance of this thats its being called on
      await Kernel['Promise::static'].all.call(Kernel['Promise::constructor'], promises);
    }
  }
  /**
   * Subscribes to the event signal.
   * @template  k - The type of the event handler function.
   * @param method - The event handler function to subscribe.
   * @returns The subscribed event handler function.
   */
  public subscribe<M extends (...params: args) => void>(method: M): M {
    const t = typeof method;
    if (t !== 'function') throw new Kernel['TypeError::constructor'](`Expected a function, but got ${t}.`);
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
  public unsubscribe<M extends (...params: args) => unknown>(method: M): M {
    const t = typeof method;
    if (t !== 'function') throw new Kernel['TypeError::constructor'](`Expected a function, but got ${t}.`);
    if (SESSIONS.has(this)) (SESSIONS.get(this) as { delete: (b: unknown) => void })?.delete(method);
    return method;
  }
}
export function TriggerEvent<R extends unknown[]>(event: NativeEvent<R>, ...params: R) {
  if (SESSIONS.has(event)) {
    const promises: Promise<unknown>[] = [];
    SESSIONS.get(event)?.forEach(method => {
      promises.push((async () => method(...(params as unknown[])))().catch(e => Kernel.error(e, e.stack)));
    });
    return promises;
  }
  return [];
}
