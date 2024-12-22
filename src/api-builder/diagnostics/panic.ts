import { Kernel } from '../kernel';

export class ContextPanicError extends Kernel['Error::constructor'] {
   public constructor(message: string) {
      super(message);
   }
}
