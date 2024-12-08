import { expect, suite, test } from 'vitest';
import { Type, VoidType } from '../type';
import { NumberType } from './number';
import { OptionalType } from './optional';
import { StringType } from './string';
import { VariantType } from './variant';

const number = new NumberType({ min: 0, max: 10 });
const string = new StringType();

suite('VariantType', () => {
   test('Variant', () => {
      const type = new VariantType([number, string]);

      expect(() => Type.ValidateOrThrow(type, 'string')).not.toThrow();
      expect(() => Type.ValidateOrThrow(type, 5)).not.toThrow();

      expect(() => Type.ValidateOrThrow(type, true)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => Type.ValidateOrThrow(type, NaN)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => Type.ValidateOrThrow(type, Infinity)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );

      expect(() => Type.ValidateOrThrow(type, 12)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => Type.ValidateOrThrow(type, -10)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
   });

   test('Variant Optional', () => {
      const type = new VariantType([number, new OptionalType(string)]);

      expect(() => Type.ValidateOrThrow(type, 5)).not.toThrow();
      expect(() => Type.ValidateOrThrow(type, undefined)).not.toThrow();
      expect(() => Type.ValidateOrThrow(type, null)).not.toThrow();
      expect(() => Type.ValidateOrThrow(type, 'string')).not.toThrow();

      expect(() => Type.ValidateOrThrow(type, true)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => Type.ValidateOrThrow(type, NaN)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => Type.ValidateOrThrow(type, Infinity)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );

      expect(() => Type.ValidateOrThrow(type, 12)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => Type.ValidateOrThrow(type, -10)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
   });

   test('Variant Void', () => {
      const type = new VariantType([new VoidType(), string]);

      expect(() => Type.ValidateOrThrow(type, 'string')).not.toThrow();
      expect(() => Type.ValidateOrThrow(type, true)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
   });

   test('Variant All', () => {
      const type = new VariantType([new VoidType(), string, new OptionalType(number)]);

      expect(() => Type.ValidateOrThrow(type, 'string')).not.toThrow();
      expect(() => Type.ValidateOrThrow(type, true)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
   });
});
