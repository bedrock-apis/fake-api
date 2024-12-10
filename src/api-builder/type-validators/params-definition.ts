import { MetadataFunctionArgumentDefinition, Range } from '../../script-module-metadata';
import { Context } from '../context';
import { Diagnostics, ERRORS } from '../errors';
import { Kernel } from '../kernel';
import { Type } from './type';
import { BaseNumberType } from './types/number';
import { OptionalType } from './types/optional';

export class ParamsDefinition extends Kernel.Empty {
   public requiredParams: number = 0;
   public params = Kernel.Construct('Array') as ParamType[];

   /**
     * Special logic for handling ranges as the could be different from defined type, check example below 
            {
              "details": {
                "max_value": 1000.0,
                "min_value": 0.0
              },
              "name": "radius",
              "type": {
                "is_bind_type": false,
                "is_errorable": false,
                "name": "float",
                "valid_range": {
                  "max": 2147483647,
                  "min": -2147483648
                }
              }
            },
     */

   public constructor(context?: Context, params?: MetadataFunctionArgumentDefinition[]) {
      super();
      if (context && params) {
         for (const param of params) {
            const isOptional = typeof param.details?.default_value !== 'undefined';
            const type = context.resolveType(param.type);
            const defaultValue = param.details?.default_value === 'null' ? null : param.details?.default_value;
            const validRange =
               param.details && 'max_value' in param.details && 'min_value' in param.details
                  ? { min: param.details.min_value, max: param.details.max_value }
                  : undefined;

            const paramType = new ParamType(
               isOptional ? new OptionalType(type) : type,
               isOptional,
               defaultValue,
               validRange,
            );
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

   public validate(diagnostics: Diagnostics, params: unknown[]) {
      if (params.length > this.params.length || params.length < this.requiredParams)
         return diagnostics.report(
            ERRORS.IncorrectNumberOfArguments({ min: this.requiredParams, max: this.params.length }, params.length),
         );

      for (const [i, value] of params.entries()) {
         this.params[i]?.validate(diagnostics, value);
      }
   }
}

export class ParamType extends Type {
   public constructor(
      public readonly type: Type,
      public readonly isOptional: boolean,
      public readonly defaultValue: unknown,
      public readonly range: Range<number, number> | undefined,
   ) {
      super();
   }
   public validate(diagnostics: Diagnostics, value: unknown): void {
      const validateDiagnostics = new Diagnostics();
      this.type.validate(validateDiagnostics, value);

      if (this.range) BaseNumberType.ValidateRange(validateDiagnostics, value as number, this.range);

      // TODO Check whenether it returns something like ERRORS.FunctionArgumentExpectedType
      diagnostics.report(...validateDiagnostics.errors);
   }
}
