import { Range } from '../script-module-metadata';
import { Kernel } from './kernel';

export class Report extends Kernel.Empty {
   public constructor(
      public readonly message: string,
      public readonly type: new (message: string) => Error,
   ) {
      super();
   }

   public throw(startStackFrom = 1): never {
      const error = new this.type(this.message);
      if (!error.stack) throw error;

      const [text, ...stack] = error.stack.split('\n    at ');

      error.stack = Kernel.Constructor('Array')
         .of(text, ...stack.slice(startStackFrom))
         .join('\n    at ');
      throw error;
   }
}

export class Diagnostics extends Kernel.Empty {
   public get success() {
      return this.errors.length === 0;
   }
   public readonly errors = Kernel.Construct('Array') as Report[];
   public readonly warns = Kernel.Construct('Array') as Report[];
   public report<T extends string | Report>(
      ...params: T extends string ? [message: T, errorType: Report['type']] : [...report: T[]]
   ): this {
      if (typeof params[0] === 'string') {
         this.errors.push(new Report(params[0], params[1] as Report['type']));
      } else {
         this.errors.push(...(params as Report[]));
      }
      return this;
   }
   public warn<T extends string | Report>(
      ...params: T extends string ? [message: T, errorType: Report['type']] : [...report: T[]]
   ): this {
      if (typeof params[0] === 'string') {
         this.warns.push(new Report(params[0], params[1] as Report['type']));
      } else {
         this.warns.push(...(params as Report[]));
      }
      return this;
   }
   public throw(startStackFrom = 2): never {
      this.errors[0]?.throw(startStackFrom + 1);
      throw Kernel.Construct('Error', 'Failed to throw report error on successfull diagnostics instance');
   }
}

export type NativeKind = 'function' | 'getter' | 'setter' | 'constructor' | 'property';
export type NativeActionKind = 'call' | 'get' | 'set';

const createTypeErrorReport = (message: string) => new Report(message, Kernel.Constructor('TypeError'));
const createReferenceErrorReport = (message: string) => new Report(message, Kernel.Constructor('ReferenceError'));
const createErrorReport = (message: string) => new Report(message, Kernel.Constructor('Error'));

// Custom type errors: ArgumentOutOfBoundsError: Provided integer value was out of range.  Value: -3000000000, argument bounds: [-2147483648, 2147483647]

export const ERRORS = {
   NoImplementation: createReferenceErrorReport('No implementation error'),
   NewExpected: createTypeErrorReport('must be called with new'),
   NativeTypeConversationFailed: createTypeErrorReport('Native type conversion failed.'),
   NativeOptionalTypeConversationFailed: createTypeErrorReport('Native optional type conversion failed'),
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

   /* ItemStack */
   ItemTypeDoesNotExist: (itemType: string) => createTypeErrorReport(`ItemType '${itemType}' does not exists`),
   InvalidAmount(min = 0, max = 256) {
      return createErrorReport(`Invalid amount. Amount must be greater than ${min} and less than ${max}`);
   },
};
