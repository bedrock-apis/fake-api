import { DiagnosticsStackReport, ErrorFactory, TYPE_ERROR_TYPE } from '../diagnostics';
import { Kernel } from '../kernel';

export abstract class Type extends Kernel.Empty {
   // Diagnostics are always passed by someone who requested this type check
   public abstract validate(diagnostics: DiagnosticsStackReport, value: unknown): DiagnosticsStackReport;
}

export class VoidType extends Type {
   public override validate(diagnostics: DiagnosticsStackReport, value: unknown) {
      if (value !== undefined)
         diagnostics.report(
            new ErrorFactory('Undefined value expected, but received: ' + typeof value, TYPE_ERROR_TYPE),
         );
      return diagnostics;
   }
}
