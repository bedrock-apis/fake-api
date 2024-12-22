import { expect, suite, test } from 'vitest';
import { Kernel } from '../../kernel';
import { Type } from '../type';
import { PromiseType } from './promise';
import { validateThrow } from './tests.helper';

suite('PromiseType', () => {
   test('Promise', () => {
      const type = new PromiseType();
      expect(() => validateThrow(type, new Promise(() => {}))).not.toThrow();
      expect(() =>
         validateThrow(
            type,
            Kernel.Construct('Promise', () => {}),
         ),
      ).not.toThrow();
   });

   test('Not A Promise', () => {
      const type = new PromiseType();
      expect(() => validateThrow(type, 'string')).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => validateThrow(type, 10)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => validateThrow(type, null)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => validateThrow(type, undefined)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => validateThrow(type, true)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => validateThrow(type, false)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
      expect(() => validateThrow(type, { then() {}, catch() {}, finally() {} })).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
   });
});
