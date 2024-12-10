import { Diagnostics, ERRORS } from '../../errors';
import { Type } from '../type';

export class StringType extends Type {
   public override validate(diagnostics: Diagnostics, value: unknown): void {
      if (typeof value !== 'string') diagnostics.report(ERRORS.NativeTypeConversationFailed);
   }
}
