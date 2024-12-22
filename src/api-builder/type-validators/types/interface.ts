import { API_ERRORS_MESSAGES, DiagnosticsStackReport } from '../../diagnostics';
import { Kernel } from '../../kernel';
import { Type } from '../type';

export class InterfaceBindType extends Type {
   public readonly properties = Kernel.Construct('Map') as Map<string, Type>;
   public constructor(
      public readonly name: string,
      public readonly baseType: InterfaceBindType | null = null,
   ) {
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
      this.validateProperties(interfaceDiagnostics, object);

      if (!interfaceDiagnostics.isEmpty) {
         // TODO Ensure that error is native type conversation failed
         diagnostics.report(API_ERRORS_MESSAGES.NativeConversionFailed('type'), interfaceDiagnostics);
      }
      return diagnostics;
   }
   public validateProperties(diagnostics: DiagnosticsStackReport, object: object) {
      this.baseType?.validateProperties(diagnostics, object);

      // TODO: Don't use iterators they are not isolated
      // TODO: Don't use destructors they are not isolated
      for (const [propertyKey, type] of this.properties) {
         // TODO: This would trigger getter, we should found a way to access the property value only once,
         // maybe cloning the object when validation being executed?
         // This also solve problem with getter/setter isolation,
         // bc we don't know if getter is executed or not and how many times,
         // that would have also problems with privileges so we should trigger getters only once and only when being validated
         type.validate(diagnostics, (object as Record<string, unknown>)[propertyKey]);
      }
   }
}
