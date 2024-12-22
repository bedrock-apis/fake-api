import { Mutable } from '../../../helper-types';
import { ContextPanicError, DiagnosticsStackReport, PANIC_ERROR_MESSAGES } from '../../diagnostics';
import { Type } from '../type';

export class DynamicType extends Type {
   public readonly type: Type | null = null;
   public validate(diagnostics: DiagnosticsStackReport, value: unknown) {
      if (!this.type) {
         throw new ContextPanicError(PANIC_ERROR_MESSAGES.DynamicTypeNotResolved(''));
      }
      this.type.validate(diagnostics, value);
      return diagnostics;
   }
   public setType(type: Type) {
      (this as Mutable<this>).type = type;
   }
}
