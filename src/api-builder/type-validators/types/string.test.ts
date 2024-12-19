import { expect, suite, test } from 'vitest';
import { Type } from '../type';
import { StringType } from './string';
import { validateThrow } from './tests.helper';

suite('StringType', () => {
   test('String', () => {
      const type = new StringType();

      expect(() => validateThrow(type, '')).not.toThrow();
      expect(() => validateThrow(type, 'not empty string')).not.toThrow();

      expect(() => validateThrow(type, 2)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
   });
});
