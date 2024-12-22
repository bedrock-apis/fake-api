import { API_ERRORS_MESSAGES, DiagnosticsStackReport } from '../../diagnostics';
import { Type } from '../type';

export class OptionalType extends Type {
   public constructor(private type: Type) {
      super();
   }

   public validate(diagnostics: DiagnosticsStackReport, value: unknown) {
      if (value === undefined || value === null) return diagnostics;
      const optionals = new DiagnosticsStackReport();
      this.type.validate(optionals, value);
      if (optionals.isThrowable) {
         diagnostics.report(API_ERRORS_MESSAGES.NativeConversionFailed('optional type'), optionals);
      }
      return diagnostics;
   }
}
