import { Diagnostics } from '../../errors';
import { Kernel } from '../../kernel';
import { Type } from '../type';

export class FunctionType extends Type {
   public override validate(diagnostics: Diagnostics, value: unknown): void {
      // TODO: No error message
      if (typeof value !== 'function')
         diagnostics.report('CHECK TODOS, No implementation error', Kernel['Error::constructor']);
   }
}
