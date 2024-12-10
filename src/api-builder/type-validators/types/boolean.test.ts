import { expect, suite, test } from 'vitest';
import { Type } from '../type';
import { BooleanType } from './boolean';

suite('BooleanType', () => {
   test('Boolean', () => {
      const type = new BooleanType();

      expect(() => Type.ValidateOrThrow(type, false)).not.toThrow();
      expect(() => Type.ValidateOrThrow(type, true)).not.toThrow();

      expect(() => Type.ValidateOrThrow(type, 2)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
   });
});
