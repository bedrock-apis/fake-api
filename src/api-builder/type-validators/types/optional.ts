import { Diagnostics, ERRORS } from '../../errors';
import { Type } from '../type';

export class OptionalType extends Type {
   public constructor(private type: Type) {
      super();
   }

   public validate(diagnostics: Diagnostics, value: unknown): void {
      if (typeof value === 'undefined' || value === null) return;

      const underDiagnostic = new Diagnostics();
      this.type.validate(underDiagnostic, value);
      if (!underDiagnostic.success)
         diagnostics.report(
            ...underDiagnostic.errors.map(e =>
               ERRORS.NativeTypeConversationFailed === e ? ERRORS.NativeOptionalTypeConversationFailed : e,
            ),
         );
   }
}
