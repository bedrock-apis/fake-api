import type { Range } from '../../script-module-metadata';
import { Kernel } from '../kernel';
import { ErrorFactory } from './factory';

export type NativeKind = 'function' | 'getter' | 'setter' | 'constructor' | 'property';
export type NativeActionKind = 'call' | 'get' | 'set';
export type NativeTypeKind = 'optional type' | 'variant type' | 'type';

export const ERROR_TYPE = Kernel['Error::constructor'];
export const REFERENCE_ERROR_TYPE = Kernel['ReferenceError::constructor'];
export const TYPE_ERROR_TYPE = Kernel['TypeError::constructor'];

// Custom type errors: ArgumentOutOfBoundsError: Provided integer value was out of range.  Value: -3000000000, argument bounds: [-2147483648, 2147483647]
// `Unsupported or out of bounds value passed to function argument [${argument}]. Value: ${value}, argument bounds: [${range.min}, ${range.max}]`
export const WARNING_ERROR_MESSAGES = {
   SettersShouldReturnUndefined: (id: string) => 'Result should be always undefined for property setter methods: ' + id,
};
export const PANIC_ERROR_MESSAGES = {
   EmptyDiagnosticsStackInstance: `Failed to throw report error on empty DiagnosticsStack instance.`,
   NoImplementation: `No implementation error.`,
   DynamicTypeNotResolved: (data: unknown) => `Failed to call validate on unresolved DynamicType ${data}`,
};
export const QUICK_JS_ENV_ERROR_MESSAGES = {
   NewExpected: () => ErrorFactory.New(`must be called with new`), // TypeError
};
export const API_ERRORS_MESSAGES = {
   NoConstructor: (id: string) => ErrorFactory.New(`No constructor for native class '${id}'.`, REFERENCE_ERROR_TYPE),
   NoPrivilege: (kind: NativeKind, id: string) =>
      ErrorFactory.New(`Native ${kind} [${id}] does not have required privileges.`, TYPE_ERROR_TYPE),
   NativeBound: (kind: NativeKind, id: string) =>
      ErrorFactory.New(`Native ${kind} [${id}] object bound to prototype does not exist.`, REFERENCE_ERROR_TYPE),
   NativeConversionFailed: (type: NativeTypeKind) =>
      ErrorFactory.New(`Native ${type} conversion failed.`, TYPE_ERROR_TYPE), //Type error
   ObjectHasInvalidHandle: () => ErrorFactory.New(`Object has an invalid native handle.`, TYPE_ERROR_TYPE), // Type Error
   ObjectDidNotHaveHandle: () => ErrorFactory.New(`Object did not have a native handle.`, TYPE_ERROR_TYPE), // Type Error
   ArrayUnsupportedType: () => ErrorFactory.New(`Array contains unsupported type.`, TYPE_ERROR_TYPE), // Type Error
   ValueNotSupported: (value: string) => ErrorFactory.New(`${value} value is not supported.`, TYPE_ERROR_TYPE),
   FailedTo: (action: NativeActionKind, kind: NativeKind, name: string) =>
      ErrorFactory.New(`Failed to ${action} ${kind} '${name}'`, ERROR_TYPE),
   InvalidTimeOfDay: (min = 0, max = 23999) =>
      ErrorFactory.New(`timeOfDay must be between ${min} and ${max} (inclusive)`, TYPE_ERROR_TYPE),
   IncorrectNumberOfArguments: (t: Range<number, number>, length: number) =>
      ErrorFactory.New(
         `Incorrect number of arguments to function. Expected ${t.min === t.max ? t.min : `${t.min}-${t.max}`}, received ${length}`,
         TYPE_ERROR_TYPE,
      ),
   FunctionArgumentExpectedType: (error: string, argument: number, type: string) =>
      ErrorFactory.New(`${error} Function argument [${argument}] expected type: ${type}`, TYPE_ERROR_TYPE),

   // TODO Somehow resolve ArgumentOutOfBoundsError
   FunctionArgumentBounds: (value: unknown, range: Range<unknown, unknown>, argument: number) =>
      ErrorFactory.New(
         `Unsupported or out of bounds value passed to function argument [${argument}]. Value: ${value}, argument bounds: [${range.min}, ${range.max}]`,
         TYPE_ERROR_TYPE,
      ),

   OutOfRange: (value: unknown, range: Range<unknown, unknown>) =>
      ErrorFactory.New(
         `Provided integer value was out of range.  Value: ${value}, argument bounds: [${range.min}, ${range.max}]`,
         TYPE_ERROR_TYPE,
      ),

   /* ItemStack */
   ItemTypeDoesNotExist: (itemType: string) => ErrorFactory.New(`ItemType '${itemType}' does not exists`),
   InvalidAmount: (min = 0, max = 256) =>
      ErrorFactory.New(`Invalid amount. Amount must be greater than ${min} and less than ${max}`),
};

/*
export type KernelLike = {
   [K in keyof typeof Kernel as K extends `${string}::constructor`
      ? (typeof Kernel)[K] extends new () => Error
         ? K
         : never
      : never]: (typeof Kernel)[K];
};
//export type ErrorFactory<T extends unknown[]> = (...params: T) => string;
function e<T extends unknown[]>(s: TemplateStringsArray, constructor: keyof KernelLike, ...params: T) {
   return {
      constructorId: constructor,
      getMessage: (...params: T) => {
         const newArray = Kernel.call(Kernel['Array::prototype'].map, s, (e: string, i: number) => e + params[i]);
         return Kernel.call(Kernel['Array::prototype'].join, newArray);
      },
   };
}
function t<T>(): T {
   return null as T;
}*/
