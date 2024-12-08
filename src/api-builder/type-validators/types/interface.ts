import { Diagnostics, ERRORS } from '../../errors';
import { Kernel } from '../../kernel';
import { Type } from '../type';

export class InterfaceBindType extends Type {
   public readonly properties = Kernel.Construct('Map') as Map<string, Type>;
   public constructor(public name: string) {
      super();
   }
   public validate(diagnostics: Diagnostics, object: unknown): void {
      if (typeof object === 'function' || typeof object === 'object') Kernel['globalThis::Number'](5);
      else diagnostics.report(ERRORS.NativeTypeConversationFailed);

      // TODO: No implementation error
      diagnostics.report(ERRORS.NoImplementation);
   }
   public addProperty(name: string, type: Type) {
      this.properties.set(name, type);
      return this;
   }
}
