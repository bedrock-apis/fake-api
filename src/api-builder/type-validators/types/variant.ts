import { API_ERRORS_MESSAGES, DiagnosticsStackReport } from '../../diagnostics';
import { Kernel } from '../../kernel';
import { Type } from '../type';

export class VariantType extends Type {
   public constructor(public readonly variants: Type[]) {
      super();
   }

   public validate(diagnostics: DiagnosticsStackReport, value: unknown) {
      const variants = new DiagnosticsStackReport();
      for (const variant of Kernel.ArrayIterator(this.variants)) {
         const s = new DiagnosticsStackReport();
         variant.validate(s, value);
         if (s.isEmpty) return diagnostics;
         variants.follow(s);
      }
      return diagnostics.report(API_ERRORS_MESSAGES.NativeConversionFailed('variant type'), variants);
   }
}
