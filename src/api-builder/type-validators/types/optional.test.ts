import { expect, suite, test } from 'vitest';
import { fromDefaultType } from '../default';
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

      // Whats the behavior of this?
      // TODO: does optional type conversion fails and returns or its reported by NumberType
      // We have to test this behavior with array and variant as well so we know if some of the checks has bigger priority
      /*expect(() => validateThrow(optional, 10000000000)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Provided integer value was out of range.  Value: 10000000000, argument bounds: [-2147483648, 2147483647]]`,
      );*/

      expect(() => validateThrow(optional, 10)).not.toThrow();
      expect(() => validateThrow(optional, undefined)).not.toThrow();
      expect(() => validateThrow(optional, null)).not.toThrow();
   });
});
