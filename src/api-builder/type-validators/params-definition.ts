import { MetadataFunctionArgumentDefinition, Range } from '../../script-module-metadata';
import { Context } from '../context';
import {
   DiagnosticsStackReport,
   FunctionArgumentBoundsErrorFactory,
   IncorrectNumberOfArgumentsErrorFactory,
} from '../diagnostics';
import { Kernel } from '../kernel';
import { Type } from './type';
import { BaseNumberType } from './types/number';

export class ParamsDefinition extends Type {
   public requiredParams: number = 0;
   public params = Kernel.Construct('Array') as ParamType[];

   public constructor(context?: Context, params?: MetadataFunctionArgumentDefinition[]) {
      super();
      if (context && params) {
         for (const [i, param] of params.entries()) {
            const type = context.resolveType(param.type);
            const isOptional = typeof param.details?.default_value !== 'undefined';
            const defaultValue = param.details?.default_value === 'null' ? null : param.details?.default_value;
            const validRange =
               param.details && 'max_value' in param.details && 'min_value' in param.details
                  ? { min: param.details.min_value, max: param.details.max_value }
                  : undefined;

            const paramType = new ParamType(type, isOptional, defaultValue, validRange, i);
            this.addType(paramType);
         }
      }
   }

   public addType(type: ParamType): this {
      if (this.params.length === this.requiredParams && !type.isOptional) {
         this.params.push(type);
         this.requiredParams = this.params.length;
      } else if (!type.isOptional) {
         throw Kernel.Construct('TypeError', 'Required parameter cannot be set after optional was defined');
      } else this.params.push(type);

      return this;
   }

   public validate(diagnostics: DiagnosticsStackReport, params: unknown[]) {
      if (params.length > this.params.length || params.length < this.requiredParams)
         return diagnostics.report(
            new IncorrectNumberOfArgumentsErrorFactory(
               { min: this.requiredParams, max: this.params.length },
               params.length,
            ),
         );

      for (let i = 0; i < this.params.length; i++) {
         this.params[i]?.validate(diagnostics, params[i]);
      }
      return diagnostics;
   }
}

// TODO: What if undefined is not valid optional type, sendMessage(); sendMessage("String"); sendMessage(undefined);
// Maybe optional param type doesn't means it could be undefined
export class ParamType extends Type {
   public constructor(
      public readonly type: Type,
      public readonly isOptional: boolean,
      public readonly defaultValue: unknown,
      public readonly range: Range<number, number> | undefined,
      public readonly index: number = 0,
   ) {
      super();
   }
   public validate(diagnostics: DiagnosticsStackReport, value?: unknown) {
      if (this.isOptional) value ??= this.defaultValue;

      const typeDiagnostics = new DiagnosticsStackReport();
      this.type.validate(typeDiagnostics, value);
      if (this.type instanceof BaseNumberType && this.range) {
         if ((value as number) < this.range.min || (value as number) > this.range.max)
            diagnostics.report(new FunctionArgumentBoundsErrorFactory(value, this.range, this.index));
      }

      // TODO Check whenever it returns something like ERRORS.FunctionArgumentExpectedType
      return diagnostics.follow(typeDiagnostics);
   }
}
