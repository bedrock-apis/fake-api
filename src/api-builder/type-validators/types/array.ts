import {
   ArrayUnsupportedTypeErrorFactory,
   DiagnosticsStackReport,
   NativeConversionFailedErrorFactory,
} from '../../diagnostics';
import { Kernel } from '../../kernel';
import { Type } from '../type';

export class ArrayType extends Type {
   public constructor(private readonly type: Type) {
      super();
   }
   public validate(diagnostics: DiagnosticsStackReport, value: unknown) {
      if (!Kernel['Array::static'].isArray(value))
         return diagnostics.report(new NativeConversionFailedErrorFactory('type'));

      const elementsDiagnostics = new DiagnosticsStackReport();
      for (let i = 0; i < value.length; i++) {
         this.type.validate(elementsDiagnostics, value[i]);
      }
      if (elementsDiagnostics.isThrowable) {
         diagnostics.report(new ArrayUnsupportedTypeErrorFactory(), elementsDiagnostics);
      }
      return diagnostics;
   }
}
