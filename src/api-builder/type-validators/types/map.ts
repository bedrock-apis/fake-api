import { API_ERRORS_MESSAGES, DiagnosticsStackReport, NativeConversionFailedErrorFactory } from '../../diagnostics';
import { Kernel } from '../../kernel';
import { Type } from '../type';

export class MapType extends Type {
   public constructor(
      public readonly keyType: Type,
      public readonly valueType: Type,
   ) {
      super();
   }

   public validate(diagnostics: DiagnosticsStackReport, map: unknown) {
      if (typeof map !== 'object' || map === null)
         return diagnostics.report(new NativeConversionFailedErrorFactory('type'));

      // TODO Currently it ignores symbol keys validation, need to check how mc reacts on this
      // TODO getOwnPropertyNames/symbols?
      const mapDiagnostics = new DiagnosticsStackReport();
      for (const key of Kernel.ArrayIterator(Kernel['Object::static'].keys(map))) {
         this.keyType.validate(mapDiagnostics, key);
         this.valueType.validate(mapDiagnostics, (map as Record<string, unknown>)[key]);
      }

      if (!mapDiagnostics.isEmpty) {
         // TODO Ensure that error is native type conversation failed
         diagnostics.report(new NativeConversionFailedErrorFactory('type'));
      }
      return diagnostics;
   }
}
