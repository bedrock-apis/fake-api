import { Diagnostics, Report } from '../errors';
import { Kernel } from '../kernel';

export abstract class Type extends Kernel.Empty {
   public static ValidateOrThrow(type: Type, value: unknown) {
      const diagnostics = new Diagnostics();
      type.validate(diagnostics, value);
      if (!diagnostics.success) return diagnostics.throw();
   }
   // Diagnostics are always passed by someone who requested this type check
   public abstract validate(diagnostics: Diagnostics, value: unknown): void;
}

export class VoidType extends Type {
   public override validate(diagnostics: Diagnostics, value: unknown) {
      if (value !== undefined) diagnostics.report(new Report('Type Report', Kernel['TypeError::constructor']));
   }
}
