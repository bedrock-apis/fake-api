import { ClassDefinition } from './class-definition';
import { Diagnostics } from '../errors';
import { Kernel } from '../kernel';
import { Mutable } from '../../helper-types';

export class ConstructionExecutionContext extends Kernel.Empty {
   public constructor(
      public readonly definition: ClassDefinition,
      public readonly methodId: string,
      public readonly parameters: unknown[],
      public readonly diagnostics: Diagnostics,
   ) {
      super();
   }
}

export class ExecutionContext extends ConstructionExecutionContext {
   public readonly resultHasBeenSet: boolean = false;
   public readonly result: unknown;
   public constructor(
      definition: ClassDefinition,
      methodId: string,
      parameters: unknown[],
      diagnostics: Diagnostics,
      public readonly handle: object | null,
   ) {
      super(definition, methodId, parameters, diagnostics);
   }
   public setResult(result: unknown) {
      (this as Mutable<this>).result = result;
      (this as Mutable<this>).resultHasBeenSet = true;
   }
}
