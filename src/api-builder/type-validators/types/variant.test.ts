import { expect, suite, test } from 'vitest';
import { Type, VoidType } from '../type';
import { NumberType } from './number';
import { OptionalType } from './optional';
import { StringType } from './string';
import { VariantType } from './variant';
import { validateThrow } from './tests.helper';

const number = new NumberType({ min: 0, max: 10 });
const string = new StringType();

suite('VariantType', () => {
   test('Variant', () => {
      const type = new VariantType([number, string]);

      expect(() => validateThrow(type, 'string')).not.toThrow();
      expect(() => validateThrow(type, 5)).not.toThrow();

      expect(() => validateThrow(type, true)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native variant type conversion failed.]`,
      );

      expect(() => validateThrow(type, NaN)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native variant type conversion failed.]`,
      );

      expect(() => validateThrow(type, Infinity)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native variant type conversion failed.]`,
      );

      expect(() => validateThrow(type, 12)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native variant type conversion failed.]`,
      );
      expect(() => validateThrow(type, -10)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native variant type conversion failed.]`,
      );
   });

   test('Variant Optional', () => {
      const type = new VariantType([number, new OptionalType(string)]);

      expect(() => validateThrow(type, 5)).not.toThrow();
      expect(() => validateThrow(type, undefined)).not.toThrow();
      expect(() => validateThrow(type, null)).not.toThrow();
      expect(() => validateThrow(type, 'string')).not.toThrow();

      expect(() => validateThrow(type, true)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native variant type conversion failed.]`,
      );
      expect(() => validateThrow(type, NaN)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native variant type conversion failed.]`,
      );
      expect(() => validateThrow(type, Infinity)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native variant type conversion failed.]`,
      );

      expect(() => validateThrow(type, 12)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native variant type conversion failed.]`,
      );
      expect(() => validateThrow(type, -10)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native variant type conversion failed.]`,
      );
   });

   test('Variant Void', () => {
      const type = new VariantType([new VoidType(), string]);

      expect(() => validateThrow(type, 'string')).not.toThrow();
      expect(() => validateThrow(type, true)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native variant type conversion failed.]`,
      );
   });

   test('Variant All', () => {
      const type = new VariantType([new VoidType(), string, new OptionalType(number)]);

      expect(() => validateThrow(type, 'string')).not.toThrow();
      expect(() => validateThrow(type, true)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native variant type conversion failed.]`,
      );
   });
});
