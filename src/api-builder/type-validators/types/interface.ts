import { API_ERRORS_MESSAGES, DiagnosticsStackReport } from '../../diagnostics';
import { Kernel } from '../../kernel';
import { Type } from '../type';

export class InterfaceBindType extends Type {
   public readonly properties = Kernel.Construct('Map') as Map<string, Type>;
   public constructor(public name: string) {
      super();
   }
   public addProperty(name: string, type: Type) {
      this.properties.set(name, type);
      return this;
   }
   public validate(diagnostics: DiagnosticsStackReport, object: unknown) {
      if (typeof object !== 'object' || object === null)
         return diagnostics.report(API_ERRORS_MESSAGES.NativeConversionFailed('type'));

      const interfaceDiagnostics = new DiagnosticsStackReport();
      for (const [propertyKey, type] of this.properties) {
         type.validate(interfaceDiagnostics, (object as Record<string, unknown>)[propertyKey]);
      }

      if (!interfaceDiagnostics.isEmpty) {
         // TODO Ensure that error is native type conversation failed
         diagnostics.report(API_ERRORS_MESSAGES.NativeConversionFailed('type'), interfaceDiagnostics);
      }
      return diagnostics;
   }
}
