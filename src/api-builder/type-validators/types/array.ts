import { ERRORS } from '../../errors';
import { DiagnosticsStack } from '../../diagnostics';
import { Kernel } from '../../kernel';
import { Type } from '../type';

export class ArrayType extends Type {
   public constructor(private readonly type: Type) {
      super();
   }
   public validate(diagnostics: DiagnosticsStack, value: unknown) {
      if (!Kernel.Constructor('Array').isArray(value)) return diagnostics.report(ERRORS.NativeTypeConversationFailed);

      for (const element of value as unknown[]) {
         this.type.validate(diagnostics, element);
      }
   }
}
