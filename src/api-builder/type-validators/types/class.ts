import { ClassDefinition } from '../../context/class-definition';
import { API_ERRORS_MESSAGES, DiagnosticsStackReport } from '../../diagnostics';
import { Type } from '../type';

export class ClassBindType extends Type {
   public constructor(public readonly definition: ClassDefinition) {
      super();
   }
   public validate(diagnostics: DiagnosticsStackReport, object: unknown) {
      // TODO: What Error it should report?
      if (!this.definition.isThisType(object)) diagnostics.report(API_ERRORS_MESSAGES.NativeConversionFailed('type'));
      return diagnostics;
   }
}
