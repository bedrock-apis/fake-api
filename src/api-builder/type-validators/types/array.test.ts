import { expect, suite, test } from 'vitest';
import { Type } from '../type';
import { ArrayType } from './array';
import { StringType } from './string';

suite('ArrayType', () => {
   test('Array', () => {
      const type = new ArrayType(new StringType());

      expect(() => Type.ValidateOrThrow(type, ['string', 'string'])).not.toThrow();
      expect(() => Type.ValidateOrThrow(type, [])).not.toThrow();

      expect(() => Type.ValidateOrThrow(type, 'string')).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
      expect(() => Type.ValidateOrThrow(type, [undefined])).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
      expect(() => Type.ValidateOrThrow(type, [null])).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
      expect(() => Type.ValidateOrThrow(type, [, , , ,])).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
      expect(() => Type.ValidateOrThrow(type, [1, 2])).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
   });
});
