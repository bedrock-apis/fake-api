import { expect, suite, test } from 'vitest';
import { Context } from '../context';
import { ParamsDefinition, ParamType } from './params-definition';
import { Type } from './type';
import { NumberType } from './types/number';
import { StringType } from './types/string';

suite('ParamsDefinition', () => {
   test('Empty', () => {
      const params = new ParamsDefinition(new Context(), [])
         .addType(new ParamType(new StringType(), false, undefined, undefined))
         .addType(new ParamType(new NumberType({ max: 10, min: 0 }), true, 10, undefined));

      expect(() => Type.ValidateOrThrow(params, [])).toThrowErrorMatchingInlineSnapshot(`[TypeError: Incorrect number of arguments to function. Expected 1-2, received 0]`);
      expect(() => Type.ValidateOrThrow(params, ['', '', '', '', ''])).toThrowErrorMatchingInlineSnapshot(`[TypeError: Incorrect number of arguments to function. Expected 1-2, received 5]`);
   });
});
