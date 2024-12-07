/* eslint-disable @typescript-eslint/unified-signatures */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable custom/no-globals */

const __create = Object.create;
const __definitions = Object.getOwnPropertyDescriptors;

type GT = typeof globalThis;
type GlobalConstructorKeys = {
  [K in keyof GT]: GT[K] extends new (...args: any) => any ? K : never;
}[keyof GT];

type GCK = GlobalConstructorKeys;

type KernelType = {
  [K in GCK as `${K}::constructor`]: GT[K];
} & {
  [K in GCK as `${K}::prototype`]: GT[K]['prototype'];
} & {
  [K in GCK as `${K}::static`]: Omit<GT[K], keyof CallableFunction>;
} & {
  [K in keyof GT as `globalThis::${K}`]: GT[K];
};

class KernelClass {
  public static __call = Function.prototype.call; // Type to Type call method
  public static call = Function.prototype.call.bind(Function.prototype.call);
  public static __setPrototypeOf = Object.setPrototypeOf;
  public static __defineProperty = Object.defineProperty;
  public static __create = Object.create;

  public static Construct<T extends GCK, S extends GT[T]>(name: T): InstanceType<S>;
  public static Construct<T extends GCK, S extends GT[T]>(name: T, ...args: ConstructorParameters<S>): InstanceType<S>;
  public static Construct<T extends GCK, S extends GT[T]>(name: T, ...args: unknown[]): InstanceType<S> {
    return KernelClass.__setPrototypeOf(
      new KernelStorage[name + '::constructor'](...args),
      KernelStorage[name + '::prototype'],
    );
  }

  public static As<T extends keyof typeof globalThis>(
    object: unknown,
    name: T,
  ): GT[T] extends { new (): infer I } | { (): infer I } ? I : never {
    return KernelClass.__setPrototypeOf(object, KernelStorage[name + '::prototype']);
  }

  public static Constructor<T extends keyof typeof globalThis>(name: T) {
    return KernelStorage[name + '::constructor'] as GT[T] extends { new (): void } | { (): void } ? GT[T] : never;
  }

  public static Prototype<T extends keyof typeof globalThis>(
    name: T,
  ): GT[T] extends { new (): infer I } | { (): infer I } ? I : never {
    return KernelStorage[name + '::prototype'];
  }

  public Static<T extends keyof typeof globalThis>(
    name: T,
  ): GT[T] extends { new (): void } | { (): void } ? { [key in keyof GT[T]]: GT[T][key] } : never {
    return KernelStorage[name + '::public static '];
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

  public static SetClass<T extends CallableFunction>(func: T, name: string): T {
    KernelClass.SetName(func, name);
    KernelClass.SetFakeNative(func);
    return KernelClass.LockPrototype(func);
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

  public static SetFakeNative<T extends CallableFunction>(func: T): void {
    if (typeof func === 'function') $native_functions.add(func);
  }

  public static IsFakeNative<T extends CallableFunction>(func: T): boolean {
    if (typeof func === 'function') return $native_functions.has(func);
    else return false;
  }
  public static SetGlobalThis() {}
  public static IsolatedCopy<T extends object>(obj: T): T {
    return __create(null, __definitions(obj));
  }
  public static log = console.log;
  public static error = console.error;
  public static warn = console.warn;
}

const KernelStorage = KernelClass as unknown as Record<string, any>;
KernelClass.__setPrototypeOf(KernelStorage, null);

const globalNames = Object.getOwnPropertyNames(globalThis);

for (const constructor of globalNames
  .map(k => (globalThis as typeof KernelStorage)[k])
  .filter(v => typeof v === 'function' && v.prototype)) {
  KernelStorage[constructor.name + '::constructor'] = constructor;
  KernelStorage[constructor.name + '::prototype'] = KernelClass.IsolatedCopy(constructor.prototype);
  KernelStorage[constructor.name + '::static'] = KernelClass.IsolatedCopy(constructor);
}
for (const globalName of globalNames) {
  KernelStorage[`globalThis::${globalName}`] = globalThis[globalName as keyof typeof globalThis];
}

const $native_functions = KernelClass.Construct('WeakSet');
$native_functions.add(
  (Function.prototype.toString = function () {
    if ($native_functions.has(this) && typeof this === 'function')
      return `function ${this.name}() {\n    [native code]\n}`;
    const string = KernelClass.As(KernelClass.call(KernelStorage['Function::prototype'].toString, this), 'String');
    return string + '';
  }),
);

export const Kernel = KernelClass as typeof KernelClass & KernelType;
