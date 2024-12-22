import { expect, suite, test } from 'vitest';
import { Type } from '../type';
import { BooleanType } from './boolean';
import { validateThrow } from './tests.helper';

suite('BooleanType', () => {
   test('Boolean', () => {
      const type = new BooleanType();

      expect(() => validateThrow(type, false)).not.toThrow();
      expect(() => validateThrow(type, true)).not.toThrow();

      expect(() => validateThrow(type, 2)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
   });
});
