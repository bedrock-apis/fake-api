import { isPromise } from 'node:util/types';
import { Diagnostics, ERRORS } from '../../errors';
import { Type } from '../type';

export class PromiseType extends Type {
   public validate(diagnostics: Diagnostics, value: unknown): void {
      if (!isPromise(value)) diagnostics.report(ERRORS.NativeTypeConversationFailed);
   }
}
