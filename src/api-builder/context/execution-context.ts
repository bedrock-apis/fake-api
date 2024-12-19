import { ClassDefinition } from './class-definition';
import { BaseReport, Diagnostics } from '../diagnostics';
import { Kernel } from '../kernel';
import { Mutable } from '../../helper-types';
import type { Context } from './context';

export class ConstructionExecutionContext extends Kernel.Empty {
   public readonly context: Context;
   public readonly error: BaseReport | null = null;
   public readonly diagnostics: Diagnostics = new Diagnostics();
   public constructor(
      public readonly self:
         | (new (params: ArrayLike<unknown>) => unknown)
         | ((self: unknown, params: ArrayLike<unknown>) => unknown)
         | null,
      public readonly definition: ClassDefinition,
      public readonly methodId: string,
      public readonly parameters: unknown[],
   ) {
      super();
      this.context = definition.context;
   }
   public dispose(): 0 | -1 {
      if (!this.diagnostics.isEmpty) {
         this.definition.context.reportDiagnostics(this.diagnostics);
      }
      return 0;
   }
   public throw(error: BaseReport) {
      (this as Mutable<this>).error = error;
   }
}

export class ExecutionContext extends ConstructionExecutionContext {
   public readonly resultHasBeenSet: boolean = false;
   public readonly result: unknown;
   public constructor(
      self:
         | (new (params: ArrayLike<unknown>) => unknown)
         | ((self: unknown, params: ArrayLike<unknown>) => unknown)
         | null,
      definition: ClassDefinition,
      methodId: string,
      parameters: unknown[],
      public readonly handle: object | null,
   ) {
      super(self, definition, methodId, parameters);
   }
   public setResult(result: unknown) {
      Kernel.log('Result set: ' + result);
      (this as Mutable<this>).result = result;
      (this as Mutable<this>).resultHasBeenSet = true;
   }
}
