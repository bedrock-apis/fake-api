import { isGeneratorObject } from 'node:util/types';
import { Diagnostics, ERRORS } from '../../errors';
import { Kernel } from '../../kernel';
import { Type } from '../type';

export class FunctionType extends Type {
   public override validate(diagnostics: Diagnostics, value: unknown): void {
      // TODO: No error message
      if (typeof value !== 'function')
         diagnostics.report('CHECK TODOS, No implementation error', Kernel['Error::constructor']);
   }
}

export class GeneratorType extends Type {
   public validate(diagnostics: Diagnostics, value: unknown): void {
      if (!isGeneratorObject(value)) diagnostics.report(ERRORS.NativeTypeConversationFailed);
   }
}
