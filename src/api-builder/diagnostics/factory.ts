import { Kernel } from '../kernel';

export type ErrorConstructor = new (message: string) => Error;
export class ErrorFactory extends Kernel.Empty {
   public static New<T extends new (message?: string, type?: ErrorConstructor) => ErrorFactory>(
      this: T,
      message?: string,
      type?: ErrorConstructor,
   ) {
      return new this(message, type);
   }
   public readonly message?: string;
   public readonly type?: ErrorConstructor;
   public constructor(message?: string, type?: ErrorConstructor) {
      super();
      this.message = message;
      this.type = type;
   }
   public getErrorConstructor(): ErrorConstructor {
      return this.type ?? Kernel['Error::constructor'];
   }
   public getMessage(): string {
      return this.message ?? 'Default Base Error Message';
   }
}
