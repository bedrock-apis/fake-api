import { expect, suite, test } from 'vitest';
import { Type } from '../type';
import { GeneratorType } from './function';

suite('FunctionType', () => {
   test('Generator', () => {
      const type = new GeneratorType();
      expect(() => Type.ValidateOrThrow(type, (function* () {})())).not.toThrow();
      expect(() => Type.ValidateOrThrow(type, {})).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
   });
});
