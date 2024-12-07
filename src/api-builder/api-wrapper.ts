import { ClassDefinition } from './class-definition';
import { NativeEvent } from './events';
import { Kernel } from './kernel';

export type MethodCallBack = (methodId: string, handle: object, cache: object, definition: ClassDefinition) => unknown;
export class APIWrapper {
  private constructor() {}
  public static readonly NATIVE_HANDLES = Kernel.Construct('WeakSet');
  public static readonly NATIVE_EVENTS = Kernel.Construct('Map') as ReadonlyMap<
    string,
    NativeEvent<Parameters<MethodCallBack>>
  >;
  public static onMethod<T extends MethodCallBack>(eventName: string, callBack: T) {
    const event = this.NATIVE_EVENTS.get(eventName);
    if (!event) {
      throw new Kernel['ReferenceError::constructor'](`Unknown methodId specified: ${eventName}`);
    }
    event.subscribe(callBack);
  }
  /**
   * @param handle object exposed with apis
   * @returns whenever the handle is valid handle to native src
   */
  public static handleIsNative(handle: unknown) {
    return this.NATIVE_HANDLES.has(handle as object);
  }
}
