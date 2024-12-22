import { API_ERRORS_MESSAGES, DiagnosticsStackReport } from '../../diagnostics';
import { Type } from '../type';

export class BooleanType extends Type {
   public override validate(diagnostics: DiagnosticsStackReport, value: unknown) {
      if (typeof value !== 'boolean') return diagnostics.report(API_ERRORS_MESSAGES.NativeConversionFailed('type'));
      return diagnostics;
   }
}
