import { expect, suite, test } from 'vitest';
import { Context } from '../context';
import { ParamsDefinition, ParamType } from './params-definition';
import { Type } from './type';
import { BooleanType } from './types/boolean';
import { NumberType } from './types/number';
import { OptionalType } from './types/optional';
import { StringType } from './types/string';
import { VariantType } from './types/variant';
import { validateThrow } from './types/tests.helper';

suite('ParamsDefinition', () => {
   test('Empty', () => {
      const params = ParamsDefinition.From(new Context(), [])
         .addType(new ParamType(new StringType(), false, undefined, undefined))
         .addType(new ParamType(new NumberType({ max: 10, min: 0 }), true, 10, undefined));

      expect(() => validateThrow(params, [])).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Incorrect number of arguments to function. Expected 1-2, received 0]`,
      );
      expect(() => validateThrow(params, ['', '', '', '', ''])).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Incorrect number of arguments to function. Expected 1-2, received 5]`,
      );
   });

   test('Range', () => {
      const params = ParamsDefinition.From(new Context(), [])
         .addType(new ParamType(new VariantType([new StringType(), new BooleanType()]), false, undefined, undefined))
         .addType(new ParamType(new NumberType({ max: 100000, min: 0 }), true, 1, { min: 0, max: 256 }));

      expect(() => validateThrow(params, ['', true])).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => validateThrow(params, ['', 1000000])).toThrowErrorMatchingInlineSnapshot(
         '[TypeError: Unsupported or out of bounds value passed to function argument [0]. Value: 1000000, argument bounds: [0, 256]]',
         //`[Error: Provided integer value was out of range.  Value: 1000000, argument bounds: [0, 100000]]`,
      );
      expect(() => validateThrow(params, ['', 257])).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Unsupported or out of bounds value passed to function argument [0]. Value: 257, argument bounds: [0, 256]]`,
      );
   });

   test('Optional Range', () => {
      const params = ParamsDefinition.From(new Context(), [])
         .addType(new ParamType(new VariantType([new StringType(), new BooleanType()]), false, undefined, undefined))
         .addType(
            new ParamType(new OptionalType(new NumberType({ max: 100000, min: 0 })), true, 1, { min: 0, max: 256 }),
         );

      expect(() => validateThrow(params, ['', null])).not.toThrow();
      expect(() => validateThrow(params, ['', undefined])).not.toThrow();
      expect(() => validateThrow(params, ['', ''])).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native optional type conversion failed.]`,
      );
      expect(() => validateThrow(params, ['', 2])).not.toThrow();
   });
});
