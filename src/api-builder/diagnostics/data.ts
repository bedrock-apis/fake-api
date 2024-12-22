/* eslint-disable @typescript-eslint/naming-convention */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { Range } from '../../script-module-metadata';
import { Kernel } from '../kernel';
import { Report } from '.';
import { ReferenceErrorFactory, TypeErrorFactory } from './errors';

export type NativeKind = 'function' | 'getter' | 'setter' | 'constructor' | 'property';
export type NativeActionKind = 'call' | 'get' | 'set';

const createTypeErrorReport = (message: string) => new Report(message, Kernel.Constructor('TypeError'));
const createReferenceErrorReport = (message: string) => new Report(message, Kernel.Constructor('ReferenceError'));
const createErrorReport = (message: string) => new Report(message, Kernel.Constructor('Error'));

export const NoImplementationErrorFactory = new ReferenceErrorFactory('No implementation error.');
export const NewExpectedErrorFactory = new TypeErrorFactory('must be called with new');
export const NativeTypeConversionFailed = new TypeErrorFactory('Native type conversion failed.');

// Custom type errors: ArgumentOutOfBoundsError: Provided integer value was out of range.  Value: -3000000000, argument bounds: [-2147483648, 2147483647]

export const ERRORS = {
   NoImplementation: createReferenceErrorReport('No implementation error'),
   NewExpected: createTypeErrorReport('must be called with new'),
   NativeTypeConversationFailed: createTypeErrorReport('Native type conversion failed.'),
   NativeOptionalTypeConversationFailed: createTypeErrorReport('Native optional type conversion failed.'),
   NativeVariantTypeConversationFailed: createTypeErrorReport('Native variant type conversion failed.'),
   NoConstructor: (id: string) => createReferenceErrorReport(`No constructor for native class '${id}'.`),
   ValueIsNotSupported: (value: 'Infinity' | 'NaN') => createTypeErrorReport(`${value} value is not supported.`),

   BoundToPrototype(kind: NativeKind, id: string) {
      return createReferenceErrorReport(`Native ${kind} [${id}] object bound to prototype does not exist.`);
   },

   NoPrivilege(kind: NativeKind, id: string) {
      return createReferenceErrorReport(`Native ${kind} [${id}] does not have required privileges.`);
   },

   InvalidTimeOfDay(min = 0, max = 23999) {
      return createErrorReport(`timeOfDay must be between ${min} and ${max} (inclusive)`);
   },

   FailedTo(action: NativeActionKind, kind: NativeKind, name: string) {
      return createErrorReport(`Failed to ${action} ${kind} '${name}'`);
   },

   /* Function */
   IncorrectNumberOfArguments(t: Range<number, number>, length: number) {
      return createTypeErrorReport(
         `Incorrect number of arguments to function. Expected ${t.min === t.max ? t.min : `${t.min}-${t.max}`}, received ${length}`,
      );
   },

   FunctionArgumentExpectedType(error: string, argument: number, type: string) {
      return createTypeErrorReport(`${error} Function argument [${argument}] expected type: ${type}`);
   },

   FunctionArgumentBounds(value: unknown, range: Range<unknown, unknown>, argument: number) {
      // TODO Somehow resolve ArgumentOutOfBoundsError
      return createErrorReport(
         `Unsupported or out of bounds value passed to function argument [${argument}]. Value: ${value}, argument bounds: [${range.min}, ${range.max}]`,
      );
   },
   OutOfRange(value: unknown, range: Range<unknown, unknown>) {
      return createErrorReport(
         `Provided integer value was out of range.  Value: ${value}, argument bounds: [${range.min}, ${range.max}]`,
      );
   },

   /* ItemStack */
   ItemTypeDoesNotExist: (itemType: string) => createTypeErrorReport(`ItemType '${itemType}' does not exists`),
   InvalidAmount(min = 0, max = 256) {
      return createErrorReport(`Invalid amount. Amount must be greater than ${min} and less than ${max}`);
   },
};
