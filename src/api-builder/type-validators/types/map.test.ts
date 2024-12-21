import { expect, suite, test } from 'vitest';
import { Type } from '../type';
import { MapType } from './map';
import { NumberType } from './number';
import { StringType } from './string';
import { validateThrow } from './tests.helper';

suite('MapType', () => {
   test('Map', () => {
      const type = new MapType(new StringType(), new NumberType({ max: 10, min: 0 }));

      expect(() => validateThrow(type, {})).not.toThrow();
      expect(() => validateThrow(type, { key: 0 })).not.toThrow();
      expect(() => validateThrow(type, { key: 1 })).not.toThrow();
      expect(() => validateThrow(type, undefined)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => validateThrow(type, null)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => validateThrow(type, 'string')).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => validateThrow(type, 2)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => validateThrow(type, true)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => validateThrow(type, false)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => validateThrow(type, { key: -10 })).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => validateThrow(type, { key: 'value' })).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => validateThrow(type, { key: null })).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => validateThrow(type, { key: undefined })).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );

      const symbol = Symbol();
      expect(() => validateThrow(type, { [symbol]: 0 })).not.toThrow();
      expect(() => validateThrow(type, { 0: 0 })).not.toThrow(); // 0 is converted into string type;
   });
});
