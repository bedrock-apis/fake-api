import { Mutable } from '../../../helper-types';
import { Diagnostics } from '../../errors';
import { Kernel } from '../../kernel';
import { Type } from '../type';

export class DynamicType extends Type {
   public readonly type: Type | null = null;
   public validate(diagnostics: Diagnostics, value: unknown): void {
      if (!this.type) {
         throw Kernel.Construct('Error', 'FatalError od');
      }
      this.type.validate(diagnostics, value);
   }
   public setType(type: Type) {
      (this as Mutable<this>).type = type;
   }
}
