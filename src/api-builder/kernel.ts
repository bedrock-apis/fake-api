/* eslint-disable @typescript-eslint/unified-signatures */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable custom/no-globals */

type Global = typeof globalThis;
type Keys = {
   [K in keyof Global]: Global[K] extends new (...args: any) => any ? K : never;
}[keyof Global];
type ConstructorLike = new (...params: unknown[]) => unknown;
type KernelType = {
   [K in Keys as `${K}::constructor`]: Global[K];
} & {
   [K in Keys as `${K}::prototype`]: Global[K]['prototype'];
} & {
   [K in Keys as `${K}::static`]: Omit<Global[K], keyof CallableFunction>;
} & {
   [K in keyof Global as `globalThis::${K}`]: Global[K];
};

// eslint-disable-next-line custom/no-default-extends
class KernelClass {
   // eslint-disable-next-line @typescript-eslint/naming-convention
   public static Empty: { new (): object } = function Empty() {} as unknown as { new (): object };
   public static __call = Function.prototype.call; // Type to Type call method
   public static call: <T extends (...params: P) => unknown, P extends unknown[]>(
      thisFunction: T,
      thisValue: unknown,
      ...params: unknown[] | P
   ) => ReturnType<T> = Function.prototype.call.bind(Function.prototype.call);
   public static __setPrototypeOf = Object.setPrototypeOf;
   public static __getPrototypeOf = Object.getPrototypeOf;
   public static __defineProperty = Object.defineProperty;
   public static __descriptors = Object.getOwnPropertyDescriptors;
   public static __create = Object.create;

   public static Construct<T extends Keys, S extends Global[T]>(name: T): InstanceType<S>;
   public static Construct<T extends Keys, S extends Global[T]>(
      name: T,
      ...args: ConstructorParameters<S>
   ): InstanceType<S>;
   public static Construct<T extends Keys, S extends Global[T]>(name: T, ...args: unknown[]): InstanceType<S> {
      return KernelClass.__setPrototypeOf(
         new KernelStorage[name + '::constructor'](...args),
         KernelStorage[name + '::prototype'],
      );
   }

   public static As<T extends keyof typeof globalThis>(
      object: unknown,
      name: T,
   ): Global[T] extends { new (): infer I } | { (): infer I } ? I : never {
      return KernelClass.__setPrototypeOf(object, KernelStorage[name + '::prototype']);
   }

   public static SetName<T extends CallableFunction>(func: T, name: string): T {
      KernelClass.__defineProperty(func, 'name', {
         value: name,
         enumerable: false,
         configurable: true,
         writable: false,
      });
      return func;
   }

   public static SetLength<T extends CallableFunction>(func: T, length: number): T {
      KernelClass.__defineProperty(func, 'length', {
         value: length,
         enumerable: false,
         configurable: true,
         writable: false,
      });
      return func;
   }

   public static SetClass<T extends ConstructorLike | CallableFunction>(func: T, name: string): T {
      KernelClass.SetName(func as CallableFunction, name);
      KernelClass.SetFakeNative(func);
      return KernelClass.LockPrototype(func as CallableFunction) as T;
   }

   public static LockPrototype<T extends CallableFunction>(func: T): T {
      KernelClass.__defineProperty(func, 'prototype', {
         value: func.prototype,
         enumerable: false,
         configurable: false,
         writable: false,
      });
      return func;
   }

   public static SetFakeNative(func: CallableFunction | NewableFunction): void {
      if (typeof func === 'function') nativeFunctions.add(func);
   }

   public static IsFakeNative(func: CallableFunction | NewableFunction): boolean {
      if (typeof func === 'function') return nativeFunctions.has(func);
      else return false;
   }
   public static SetGlobalThis() {}
   public static log = console.log;
   public static error = console.error;
   public static warn = console.warn;
   public static NewArray<T>(...params: T[]): Array<T> {
      return KernelClass.Construct('Array', ...params) as Array<T>;
   }
   public static ArrayIterator<T>(array: T[]): IterableIterator<T> {
      return KernelClass.__setPrototypeOf(
         KernelClass.call(Kernel['Array::prototype'].values, array),
         ARRAY_ITERATOR_PROTOTYPE,
      );
   }
   public static MapValuesIterator<T>(map: Map<unknown, T>): IterableIterator<T> {
      return KernelClass.__setPrototypeOf(
         KernelClass.call(Kernel['Map::prototype'].values, map),
         MAP_ITERATOR_PROTOTYPE,
      );
   }
   public static MapKeysIterator<T>(map: Map<T, unknown>): IterableIterator<T> {
      return KernelClass.__setPrototypeOf(KernelClass.call(Kernel['Map::prototype'].keys, map), MAP_ITERATOR_PROTOTYPE);
   }
   public static SetIterator<T>(set: Set<T>): IterableIterator<T> {
      return KernelClass.__setPrototypeOf(
         KernelClass.call(Kernel['Set::prototype'].values, set),
         SET_ITERATOR_PROTOTYPE,
      );
   }
   public static IsolatedCopy<T extends object>(obj: T) {
      let isolated = ISOLATED_COPIES.get(obj);
      if (!isolated) {
         const prototype = KernelClass.__getPrototypeOf(obj);
         ISOLATED_COPIES.set(
            obj,
            (isolated = KernelClass.__create(
               prototype ? this.IsolatedCopy(prototype) : prototype,
               KernelClass.__descriptors(obj),
            )),
         );
      }
      return isolated as T;
   }
}
const ISOLATED_COPIES = new WeakMap<object, unknown>();
const KernelStorage = KernelClass as unknown as Record<string, any>;
KernelClass.__setPrototypeOf(KernelStorage, null);

const globalNames = Object.getOwnPropertyNames(globalThis);

// eslint-disable-next-line custom/no-iterators
for (const constructor of globalNames
   .map(k => (globalThis as typeof KernelStorage)[k])
   .filter(v => typeof v === 'function' && v.prototype)) {
   KernelStorage[constructor.name + '::constructor'] = constructor;
   KernelStorage[constructor.name + '::prototype'] = KernelClass.IsolatedCopy(constructor.prototype);
   KernelStorage[constructor.name + '::static'] = KernelClass.IsolatedCopy(constructor);
}
// eslint-disable-next-line custom/no-iterators
for (const globalName of globalNames) {
   KernelStorage[`globalThis::${globalName}`] = globalThis[globalName as keyof typeof globalThis];
}

const nativeFunctions = KernelClass.Construct('WeakSet');
nativeFunctions.add(
   (Function.prototype.toString = function () {
      if (nativeFunctions.has(this)) return `function ${this.name}() {\n    [native code]\n}`;
      const string = KernelClass.As(KernelClass.call(KernelStorage['Function::prototype'].toString, this), 'String');
      return string + '';
   }),
);
// eslint-disable-next-line @typescript-eslint/naming-convention
export const Kernel = KernelClass as typeof KernelClass & KernelType;
const ARRAY_ITERATOR_PROTOTYPE = Kernel.IsolatedCopy(Object.getPrototypeOf(Array.prototype.values.call([])));
const MAP_ITERATOR_PROTOTYPE = Kernel.IsolatedCopy(Object.getPrototypeOf(Map.prototype.values.call(new Map()))); // Key Iterators has same prototype
const SET_ITERATOR_PROTOTYPE = Kernel.IsolatedCopy(Object.getPrototypeOf(Set.prototype.values.call(new Set())));

Kernel.__setPrototypeOf(Kernel.Empty, null);
Kernel.__setPrototypeOf(Kernel.Empty.prototype, null);
Kernel.__setPrototypeOf(ISOLATED_COPIES, Kernel['WeakMap::prototype']);
