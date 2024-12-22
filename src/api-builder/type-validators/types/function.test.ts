import { expect, suite, test } from 'vitest';
import { Type } from '../type';
import { GeneratorType } from './function';
import { validateThrow } from './tests.helper';

suite('FunctionType', () => {
   test('Generator', () => {
      const type = new GeneratorType();
      expect(() => validateThrow(type, (function* () {})())).not.toThrow();
      expect(() => validateThrow(type, {})).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
   });
});
