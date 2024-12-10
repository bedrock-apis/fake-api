import { expect, suite, test } from 'vitest';
import { Type } from '../type';
import { BigIntType, NumberType } from './number';

suite('NumberType', () => {
   test('Number', () => {
      const type = new NumberType({ min: 10, max: 20 });

      expect(() => Type.ValidateOrThrow(type, true)).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
      expect(() => Type.ValidateOrThrow(type, 9)).toThrowErrorMatchingInlineSnapshot(
         `[Error: Provided integer value was out of range.  Value: 9, argument bounds: [10, 20]]`,
      );
      expect(() => Type.ValidateOrThrow(type, 10)).not.toThrow();
      expect(() => Type.ValidateOrThrow(type, 20)).not.toThrow();
      expect(() => Type.ValidateOrThrow(type, 21)).toThrowErrorMatchingInlineSnapshot(
         `[Error: Provided integer value was out of range.  Value: 21, argument bounds: [10, 20]]`,
      );

      expect(() => Type.ValidateOrThrow(type, Infinity)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Infinity value is not supported.]`,
      );
      expect(() => Type.ValidateOrThrow(type, NaN)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: NaN value is not supported.]`,
      );
   });

   test('BigInt', () => {
      const type = new BigIntType({ min: 10n, max: 20n });

      expect(() => Type.ValidateOrThrow(type, 9n)).toThrowErrorMatchingInlineSnapshot(
         `[Error: Provided integer value was out of range.  Value: 9, argument bounds: [10, 20]]`,
      );
      expect(() => Type.ValidateOrThrow(type, 10n)).not.toThrow();
      expect(() => Type.ValidateOrThrow(type, 20n)).not.toThrow();
      expect(() => Type.ValidateOrThrow(type, 21n)).toThrowErrorMatchingInlineSnapshot(
         `[Error: Provided integer value was out of range.  Value: 21, argument bounds: [10, 20]]`,
      );

      expect(() => Type.ValidateOrThrow(type, Infinity)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => Type.ValidateOrThrow(type, NaN)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
   });
});
