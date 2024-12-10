import { expect, suite, test } from 'vitest';
import { Kernel } from '../../kernel';
import { Type } from '../type';
import { PromiseType } from './promise';

suite('PromiseType', () => {
   test('Promise', () => {
      const type = new PromiseType();
      expect(() => Type.ValidateOrThrow(type, new Promise(() => {}))).not.toThrow();
      expect(() =>
         Type.ValidateOrThrow(
            type,
            Kernel.Construct('Promise', () => {}),
         ),
      ).not.toThrow();
   });

   test('Not A Promise', () => {
      const type = new PromiseType();
      expect(() => Type.ValidateOrThrow(type, 'string')).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
      expect(() => Type.ValidateOrThrow(type, 10)).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
      expect(() => Type.ValidateOrThrow(type, null)).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
      expect(() => Type.ValidateOrThrow(type, undefined)).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
      expect(() => Type.ValidateOrThrow(type, true)).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
      expect(() => Type.ValidateOrThrow(type, false)).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
      expect(() =>
         Type.ValidateOrThrow(type, { then() {}, catch() {}, finally() {} }),
      ).toThrowErrorMatchingInlineSnapshot(`[TypeError: Native type conversion failed.]`);
   });
});
