import { expect, suite, test } from 'vitest';
import { MetadataType } from '../../../script-module-metadata';
import { Context } from '../../context';
import { Diagnostics } from '../../errors';
import { Type } from '../type';
import { DynamicType } from './dynamic';
import { StringType } from './string';

suite('DynamicType', () => {
   test('Dynamic', () => {
      const type = new DynamicType();
      expect(() => type.validate(new Diagnostics(), null)).toThrowErrorMatchingInlineSnapshot(
         `[Error: Failed to call validate on unresolved DynamicType]`,
      );

      type.setType(new StringType());
      expect(() => Type.ValidateOrThrow(type, '')).not.toThrow();
      expect(() => Type.ValidateOrThrow(type, undefined)).toThrowErrorMatchingInlineSnapshot(
         `[TypeError: Native type conversion failed.]`,
      );
   });
   test('Dynamic Type Registration', () => {
      const context = new Context();
      const ref = { is_bind_type: true, name: 'unregistered' } as unknown as MetadataType;
      const type = context.resolveType(ref);
      expect(type).toBeInstanceOf(DynamicType);
      expect(context.resolveType(ref)).toEqual(type);
   });
});
