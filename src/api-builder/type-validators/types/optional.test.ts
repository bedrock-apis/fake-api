import { expect, suite, test } from 'vitest';
import { fromDefaultType } from '../default';
import { Type } from '../type';
import { OptionalType } from './optional';
import { Context } from '../../context';
import { validateThrow } from './tests.helper';

const context = new Context();

suite('Optional', () => {
   test('validate', () => {
      const optional = new OptionalType(context.resolveType(fromDefaultType('int32')));

      expect(() => validateThrow(optional, 'string')).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native optional type conversion failed.]`,
      );

      expect(() => validateThrow(optional, 10000000000)).toThrowErrorMatchingInlineSnapshot(
         `[Error: Provided integer value was out of range.  Value: 10000000000, argument bounds: [-2147483648, 2147483647]]`,
      );

      expect(() => validateThrow(optional, 10)).not.toThrow();
      expect(() => validateThrow(optional, undefined)).not.toThrow();
      expect(() => validateThrow(optional, null)).not.toThrow();
   });
});
