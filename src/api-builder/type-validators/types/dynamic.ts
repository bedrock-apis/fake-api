import { Mutable } from '../../../helper-types';
import { DiagnosticsStack } from '../../diagnostics';
import { Kernel } from '../../kernel';
import { Type } from '../type';

export class DynamicType extends Type {
   public readonly type: Type | null = null;
   public validate(diagnostics: DiagnosticsStack, value: unknown): void {
      if (!this.type) {
         throw Kernel.Construct('Error', `Failed to call validate on unresolved DynamicType`);
      }
      this.type.validate(diagnostics, value);
   }
   public setType(type: Type) {
      (this as Mutable<this>).type = type;
   }
}
