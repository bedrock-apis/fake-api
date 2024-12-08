import { expect, suite, test } from 'vitest';
import { Type } from '../type';
import { StringType } from './string';

suite('StringType', () => {
   test('String', () => {
      const type = new StringType();

      expect(() => Type.ValidateOrThrow(type, '')).not.toThrow();
      expect(() => Type.ValidateOrThrow(type, 'not empty string')).not.toThrow();

      expect(() => Type.ValidateOrThrow(type, 2)).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
   });
});
