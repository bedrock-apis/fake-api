import { Diagnostics, ERRORS } from '../../errors';
import { Type } from '../type';

export class VariantType extends Type {
   public constructor(public readonly variants: Type[]) {
      super();
   }

   public validate(diagnostics: Diagnostics, value: unknown): void {
      for (const variant of this.variants) {
         const variantDiagnostic = new Diagnostics();
         variant.validate(variantDiagnostic, value);
         if (variantDiagnostic.success) return;
      }

      // TODO Ensure error message is Native type conversation failed
      diagnostics.report(ERRORS.NativeTypeConversationFailed);
   }
}
