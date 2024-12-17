/* eslint-disable @typescript-eslint/unified-signatures */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable custom/no-globals */

type Global = typeof globalThis;
type Keys = {
   [K in keyof Global]: Global[K] extends new (...args: any) => any ? K : never;
}[keyof Global];

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
   public static call = Function.prototype.call.bind(Function.prototype.call);
   public static __setPrototypeOf = Object.setPrototypeOf;
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

   public static Constructor<T extends keyof typeof globalThis>(name: T) {
      return KernelStorage[name + '::constructor'] as Global[T] extends { new (): void } | { (): void }
         ? Global[T]
         : never;
   }

   public static Prototype<T extends keyof typeof globalThis>(
      name: T,
   ): Global[T] extends { new (): infer I } | { (): infer I } ? I : never {
      return KernelStorage[name + '::prototype'];
   }

   public static Static<T extends keyof typeof globalThis>(
      name: T,
   ): Global[T] extends { new (): void } | { (): void } ? { [key in keyof Global[T]]: Global[T][key] } : never {
      return KernelStorage[name + '::static'];
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

   public static SetFakeNative(func: CallableFunction | NewableFunction): void {
      if (typeof func === 'function') nativeFunctions.add(func);
   }

   public static IsFakeNative(func: CallableFunction | NewableFunction): boolean {
      if (typeof func === 'function') return nativeFunctions.has(func);
      else return false;
   }
   public static SetGlobalThis() {}
   public static IsolatedCopy<T extends object>(obj: T): T {
      return KernelClass.__create(null, KernelClass.__descriptors(obj));
   }
   public static log = console.log;
   public static error = console.error;
   public static warn = console.warn;
   public static NewArray<T>(...params: T[]): Array<T> {
      return Kernel.Construct('Array', ...params) as Array<T>;
   }
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

Kernel.__setPrototypeOf(Kernel.Empty, null);
Kernel.__setPrototypeOf(Kernel.Empty.prototype, null);
