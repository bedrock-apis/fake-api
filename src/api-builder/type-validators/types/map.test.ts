import { expect, suite, test } from 'vitest';
import { Type } from '../type';
import { MapType } from './map';
import { NumberType } from './number';
import { StringType } from './string';

suite('MapType', () => {
   test('Map', () => {
      const type = new MapType(new StringType(), new NumberType({ max: 10, min: 0 }));

      expect(() => Type.ValidateOrThrow(type, {})).not.toThrow();
      expect(() => Type.ValidateOrThrow(type, { key: 0 })).not.toThrow();
      expect(() => Type.ValidateOrThrow(type, { key: 1 })).not.toThrow();
      expect(() => Type.ValidateOrThrow(type, undefined)).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
      expect(() => Type.ValidateOrThrow(type, null)).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
      expect(() => Type.ValidateOrThrow(type, 'string')).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
      expect(() => Type.ValidateOrThrow(type, 2)).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
      expect(() => Type.ValidateOrThrow(type, true)).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
      expect(() => Type.ValidateOrThrow(type, false)).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
      expect(() => Type.ValidateOrThrow(type, { key: -10 })).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => Type.ValidateOrThrow(type, { key: 'value' })).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => Type.ValidateOrThrow(type, { key: null })).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => Type.ValidateOrThrow(type, { key: undefined })).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );

      const symbol = Symbol();
      expect(() => Type.ValidateOrThrow(type, { [symbol]: 0 })).not.toThrow();
      expect(() => Type.ValidateOrThrow(type, { 0: 0 })).not.toThrow(); // 0 is converted into string type;
   });
});
