import { expect, suite, test } from 'vitest';
import { Type } from '../type';
import { ArrayType } from './array';
import { StringType } from './string';
import { validateThrow } from './tests.helper';

suite('ArrayType', () => {
   test('Array', () => {
      const type = new ArrayType(new StringType());

      expect(() => validateThrow(type, ['string', 'string'])).not.toThrow();
      expect(() => validateThrow(type, [])).not.toThrow();

      expect(() => validateThrow(type, 'string')).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => validateThrow(type, [undefined])).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Array contains unsupported type.]`,
      );
      expect(() => validateThrow(type, [null])).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Array contains unsupported type.]`,
      );
      expect(() => validateThrow(type, [, , , ,])).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Array contains unsupported type.]`,
      );
      expect(() => validateThrow(type, [1, 2])).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Array contains unsupported type.]`,
      );
   });
});
