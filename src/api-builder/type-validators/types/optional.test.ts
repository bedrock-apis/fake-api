import { expect, suite, test } from 'vitest';
import { fromDefaultType } from '../default';
import { Type } from '../type';
import { OptionalType } from './optional';
import { Context } from '../../context';
import { ValidateThrow } from './helper.test';

const context = new Context();

suite('Optional', () => {
   test('validate', () => {
      const optional = new OptionalType(context.resolveType(fromDefaultType('int32')));

      expect(() => ValidateThrow(optional, 'string')).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native optional type conversion failed.]`,
      );

      expect(() => ValidateThrow(optional, 10000000000)).toThrowErrorMatchingInlineSnapshot(
         `[Error: Provided integer value was out of range.  Value: 10000000000, argument bounds: [-2147483648, 2147483647]]`,
      );

      expect(() => ValidateThrow(optional, 10)).not.toThrow();
      expect(() => ValidateThrow(optional, undefined)).not.toThrow();
      expect(() => ValidateThrow(optional, null)).not.toThrow();
   });
});
