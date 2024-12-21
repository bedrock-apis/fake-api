import { Range } from '../../../script-module-metadata';
import { API_ERRORS_MESSAGES, DiagnosticsStackReport } from '../../diagnostics';
import { Kernel } from '../../kernel';
import { Type } from '../type';

const isFinite = Kernel['globalThis::isFinite'];

export abstract class BaseNumberType<T extends number | bigint> extends Type {
   public abstract readonly type: 'number' | 'bigint';
   public abstract readonly isFiniteCheck: boolean;

   public constructor(public readonly range: { min: T; max: T }) {
      super();
   }

   public override validate(diagnostics: DiagnosticsStackReport, value: unknown) {
      if (typeof value !== this.type) return diagnostics.report(API_ERRORS_MESSAGES.NativeConversionFailed('type'));

      if (this.isFiniteCheck && !isFinite(value as unknown as number)) {
         return diagnostics.report(
            API_ERRORS_MESSAGES.ValueNotSupported(Kernel.call(Kernel['Number::prototype'].toString, value)),
         );
      }

      if ((value as T) < this.range.min || (value as T) > this.range.max)
         diagnostics.report(API_ERRORS_MESSAGES.OutOfRange(value as T, this.range));
      return diagnostics;
   }
   /*
   public static ValidateRange<T extends number | bigint>(
      diagnostics: DiagnosticsStackReport,
      value: T,
      range: Range<T, T>,
      argument?: number,
   ) {
      if ((typeof value === 'number' || typeof value === 'bigint') && (value < range.min || value > range.max)) {
         if (typeof argument === 'number') {
            diagnostics.report(ERRORS.FunctionArgumentBounds(value, range, argument));
         } else diagnostics.report(ERRORS.OutOfRange(value, range));
      }
   }*/
}

export class NumberType extends BaseNumberType<number> {
   public readonly type = 'number' as const;
   public readonly isFiniteCheck = true;
}

export class BigIntType extends BaseNumberType<bigint> {
   public readonly type = 'bigint' as const;
   public readonly isFiniteCheck = false;
}
